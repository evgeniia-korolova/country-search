import { cachedSearchCountries } from '../api/cached-search-countries.js';
import { DEBOUNCE_DELAY_MS } from '../constants/constants.js';
import { HttpError } from '../errors/http-error.js';
import type { SearchState } from '../types/search-state.js';
import { debounce } from '../utils/debounce.js';

export interface SearchController {
    search: (query: string) => void;
    cancel: () => void;
}

const isAbortError = (error: unknown): boolean =>
    error instanceof DOMException && error.name === 'AbortError';

const isTimeoutError = (error: unknown): boolean =>
    error instanceof DOMException && error.name === 'TimeoutError';

export function countrySearchController(
    onStateChange: (state: SearchState) => void,
    delay: number = DEBOUNCE_DELAY_MS
): SearchController {
    let currentController: AbortController | null = null;
    let latestQuery = '';

    function abortActiveRequest(): void {
        if (currentController) {
            currentController.abort();
            currentController = null;
        }
    }

    async function executeSearch(query: string): Promise<void> {
        const trimmedQuery = query.trim();

        if (!trimmedQuery || trimmedQuery !== latestQuery.trim()) {
            return;
        }

        const controller = new AbortController();
        currentController = controller;

        onStateChange({ status: 'loading' });

        try {
            const countries = await cachedSearchCountries(trimmedQuery, controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            if (countries.length === 0) {
                onStateChange({
                    status: 'empty',
                    message: 'No countries found on your request',
                });
                return;
            }

            onStateChange({
                status: 'success',
                countries,
            });
        } catch (error) {
            if (isAbortError(error)) {
                return;
            }

            if (isTimeoutError(error)) {
                onStateChange({
                    status: 'error',
                    message: 'Request timed out. Please try again.',
                });
                return;
            }

            if (error instanceof HttpError) {
                onStateChange({
                    status: 'error',
                    message: `Server error (${error.status}). Please try again later.`,
                });
                return;
            }

            onStateChange({
                status: 'error',
                message: 'Network error. Please check your connection.',
            });
        } finally {
            if (currentController === controller) {
                currentController = null;
            }
        }
    }

    const debouncedExecute = debounce((query: string) => {
        void executeSearch(query);
    }, delay);

    function search(query: string): void {
        latestQuery = query;
        abortActiveRequest();

        if (!query.trim()) {
            onStateChange({ status: 'idle' });
            return;
        }

        debouncedExecute(query);
    }

    function cancel(): void {
        latestQuery = '';
        abortActiveRequest();
    }

    return {
        search,
        cancel,
    };
}
