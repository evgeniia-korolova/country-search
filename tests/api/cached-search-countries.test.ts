import { describe, expect, it, vi } from 'vitest';
import { createCachedSearch } from '../../src/api/cached-search-countries';
import type { Country } from '../../src/types/country';

const mockCountries: Country[] = [
    {
        name: 'Ukraine',
        capital: 'Kyiv',
        region: 'Europe',
        subregion: 'Eastern Europe',
        population: 37000000,
        area: 603500,
        borders: ['POL'],
        languages: [{ name: 'Ukrainian' }],
        currencies: [{ code: 'UAH', name: 'Ukrainian hryvnia', symbol: '₴' }],
        flag: 'https://example.com',
    },
];

describe('createCachedSearch', () => {
    it('should return empty array without calling searchFn for empty or whitespace query', async () => {
        const searchFn = vi.fn();
        const cachedSearch = createCachedSearch(searchFn);

        const resultEmpty = await cachedSearch('');
        const resultSpaces = await cachedSearch('   ');

        expect(resultEmpty).toEqual([]);
        expect(resultSpaces).toEqual([]);
        expect(searchFn).not.toHaveBeenCalled();
    });

    it('should cache results by normalized query (case-insensitive and trimmed)', async () => {
        const searchFn = vi.fn().mockResolvedValue(mockCountries);
        const cachedSearch = createCachedSearch(searchFn);

        const firstResult = await cachedSearch('  Ukraine  ');
        const secondResult = await cachedSearch('ukraine');
        const thirdResult = await cachedSearch('UKRAINE');

        expect(searchFn).toHaveBeenCalledTimes(1);
        expect(firstResult).toEqual(mockCountries);
        expect(secondResult).toEqual(mockCountries);
        expect(thirdResult).toEqual(mockCountries);
    });

    it('should deduplicate concurrent identical requests into a single network call', async () => {
        let resolveRequest!: (value: Country[]) => void;

        const searchFn = vi.fn().mockImplementation(
            () =>
                new Promise<Country[]>((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const cachedSearch = createCachedSearch(searchFn);

        const promise1 = cachedSearch('Ukraine');
        const promise2 = cachedSearch('  ukraine ');

        expect(searchFn).toHaveBeenCalledTimes(1);

        resolveRequest(mockCountries);

        const [res1, res2] = await Promise.all([promise1, promise2]);

        expect(res1).toEqual(mockCountries);
        expect(res2).toEqual(mockCountries);
        expect(searchFn).toHaveBeenCalledTimes(1);
    });

    it('should not cache rejected requests so subsequent retries can succeed', async () => {
        const searchFn = vi
            .fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(mockCountries);

        const cachedSearch = createCachedSearch(searchFn);

        await expect(cachedSearch('Ukraine')).rejects.toThrow('Network error');

        const retryResult = await cachedSearch('Ukraine');

        expect(retryResult).toEqual(mockCountries);
        expect(searchFn).toHaveBeenCalledTimes(2);
    });

    it('should reject only the aborted caller without breaking deduplicated peer request', async () => {
        let resolveRequest!: (value: Country[]) => void;

        const searchFn = vi.fn().mockImplementation(
            () =>
                new Promise<Country[]>((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const cachedSearch = createCachedSearch(searchFn);
        const controller1 = new AbortController();
        const controller2 = new AbortController();

        const promise1 = cachedSearch('Ukraine', controller1.signal);
        const promise2 = cachedSearch('Ukraine', controller2.signal);

        controller1.abort();
        await expect(promise1).rejects.toMatchObject({ name: 'AbortError' });

        resolveRequest(mockCountries);
        await expect(promise2).resolves.toEqual(mockCountries);
        expect(searchFn).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when clear() is called', async () => {
        const searchFn = vi.fn().mockResolvedValue(mockCountries);
        const cachedSearch = createCachedSearch(searchFn);

        await cachedSearch('Ukraine');
        expect(searchFn).toHaveBeenCalledTimes(1);

        cachedSearch.clear();

        await cachedSearch('Ukraine');
        expect(searchFn).toHaveBeenCalledTimes(2);
    });
});
