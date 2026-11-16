import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { countrySearchController } from '../../src/controllers/country-search-controller';
import { SearchState } from '../../src/types/search-state';
import { DEBOUNCE_DELAY_MS } from '../../src/constants/constants';
import { cachedSearchCountries } from '../../src/api/cached-search-countries';

const createMockRawCountry = (name: string) => ({
    name,
    alpha2Code: name.slice(0, 2).toUpperCase(),
    alpha3Code: name.slice(0, 3).toUpperCase(),
    capital: `${name} Capital`,
    region: 'Europe',
    subregion: 'Eastern Europe',
    population: 1000000,
    area: 50000,
    borders: ['POL'],
    languages: [{ iso639_1: 'en', iso639_2: 'eng', name: 'English', nativeName: 'English' }],
    currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
    flags: { svg: `https://example.com{name.toLowerCase()}.svg` },
});

describe('race condition handling in countrySearchController', () => {
    const fetchMock = vi.fn();
    let onStateChange: ReturnType<typeof vi.fn<(state: SearchState) => void>>;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', fetchMock);
        onStateChange = vi.fn();
        fetchMock.mockReset();
        cachedSearchCountries.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('should abort earlier request and keep only the latest result when responses resolve out of order', async () => {
        let firstSignal: AbortSignal | undefined;
        let resolveFirstFetch!: (value: Response) => void;
        let resolveSecondFetch!: (value: Response) => void;

        fetchMock.mockImplementation((url: string, options?: RequestInit) => {
            return new Promise<Response>((resolve, reject) => {
                options?.signal?.addEventListener('abort', () => {
                    reject(new DOMException('The operation was aborted.', 'AbortError'));
                });

                if (url.endsWith('/name/Uk')) {
                    firstSignal = options?.signal ?? undefined;
                    resolveFirstFetch = resolve;
                } else if (url.endsWith('/name/Ukr')) {
                    resolveSecondFetch = resolve;
                }
            });
        });

        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Uk');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(firstSignal?.aborted).toBe(false);

        controller.search('Ukr');
        expect(firstSignal?.aborted).toBe(true);

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
        expect(fetchMock).toHaveBeenCalledTimes(2);

        resolveSecondFetch({
            ok: true,
            status: 200,
            json: async () => [createMockRawCountry('Ukraine')],
        } as Response);
        await vi.runAllTimersAsync();

        resolveFirstFetch({
            ok: true,
            status: 200,
            json: async () => [createMockRawCountry('United Kingdom')],
        } as Response);
        await vi.runAllTimersAsync();

        const successCalls = onStateChange.mock.calls
            .map(([state]) => state)
            .filter(
                (state): state is Extract<SearchState, { status: 'success' }> =>
                    state.status === 'success'
            );

        expect(successCalls).toHaveLength(1);
        expect(successCalls[0].countries[0].name).toBe('Ukraine');
        expect(onStateChange).toHaveBeenLastCalledWith({
            status: 'success',
            countries: [expect.objectContaining({ name: 'Ukraine' })],
        });
    });
});
