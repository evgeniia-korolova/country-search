import type { Country } from '../types/country';
import { searchCountries } from './search-countries.js';

export type SearchCountriesFn = (query: string, signal?: AbortSignal) => Promise<Country[]>;

export interface CachedSearchFn {
    (query: string, signal?: AbortSignal): Promise<Country[]>;
    clear: () => void;
}

function createAbortError(): DOMException {
    return new DOMException('The operation was aborted.', 'AbortError');
}

interface InFlightEntry {
    subscribe: (signal?: AbortSignal) => Promise<Country[]>;
}

export function createCachedSearch(searchFn: SearchCountriesFn): CachedSearchFn {
    const cache = new Map<string, Country[]>();
    const inFlight = new Map<string, InFlightEntry>();

    const cachedSearch = (query: string, signal?: AbortSignal): Promise<Country[]> => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            return Promise.resolve([]);
        }

        if (signal?.aborted) {
            return Promise.reject(createAbortError());
        }

        const cacheKey = trimmedQuery.toLowerCase();
        const cachedResult = cache.get(cacheKey);

        if (cachedResult !== undefined) {
            return Promise.resolve(cachedResult);
        }

        const existingEntry = inFlight.get(cacheKey);

        if (existingEntry) {
            return existingEntry.subscribe(signal);
        }

        let activeSubscribers = 0;
        const sharedController = new AbortController();

        const requestPromise = searchFn(trimmedQuery, sharedController.signal)
            .then((countries) => {
                cache.set(cacheKey, countries);
                return countries;
            })
            .finally(() => {
                inFlight.delete(cacheKey);
            });

        const subscribe = (callerSignal?: AbortSignal): Promise<Country[]> => {
            if (!callerSignal) {
                activeSubscribers += 1;
                return requestPromise;
            }

            if (callerSignal.aborted) {
                return Promise.reject(createAbortError());
            }

            activeSubscribers += 1;

            return new Promise<Country[]>((resolve, reject) => {
                const handleAbort = (): void => {
                    activeSubscribers -= 1;

                    if (activeSubscribers === 0) {
                        sharedController.abort();
                    }

                    reject(createAbortError());
                };

                callerSignal.addEventListener('abort', handleAbort, { once: true });

                requestPromise.then(
                    (value) => {
                        callerSignal.removeEventListener('abort', handleAbort);
                        resolve(value);
                    },
                    (error: unknown) => {
                        callerSignal.removeEventListener('abort', handleAbort);
                        reject(error);
                    }
                );
            });
        };

        inFlight.set(cacheKey, { subscribe });

        return subscribe(signal);
    };

    cachedSearch.clear = (): void => {
        cache.clear();
        inFlight.clear();
    };

    return cachedSearch;
}

export const cachedSearchCountries = createCachedSearch(searchCountries);
