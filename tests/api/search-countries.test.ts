import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../../src/errors/http-error';
import { searchCountries } from '../../src/api/search-countries';
import { REQUEST_TIMEOUT_MS } from '../../src/constants/constants';

const mockRawCountry = {
    name: 'Ukraine',
    alpha2Code: 'UA',
    alpha3Code: 'UKR',
    capital: 'Kyiv',
    region: 'Europe',
    subregion: 'Eastern Europe',
    population: 37000000,
    area: 603500,
    borders: ['POL'],
    languages: [{ iso639_1: 'uk', iso639_2: 'ukr', name: 'Ukrainian', nativeName: 'Українська' }],
    currencies: [{ code: 'UAH', name: 'Ukrainian hryvnia', symbol: '₴' }],
    flags: { svg: 'https://example.com', png: 'https://example.com' },
};

describe('searchCountries', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        fetchMock.mockReset();
    });

    it('should return empty array without calling fetch when query is empty or whitespace', async () => {
        const resultEmpty = await searchCountries('');
        const resultSpaces = await searchCountries('   ');

        expect(resultEmpty).toEqual([]);
        expect(resultSpaces).toEqual([]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should call fetch with encoded URL and return mapped countries', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [mockRawCountry],
        });

        const result = await searchCountries('New Zealand');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://countries.dev/name/New%20Zealand',
            expect.objectContaining({
                signal: expect.any(AbortSignal),
            })
        );
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Ukraine');
        expect(result[0].flag).toBe('https://example.com');
    });

    it('should return empty array when response status is 404', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 404,
        });

        const result = await searchCountries('NonExistentCountry');

        expect(result).toEqual([]);
    });

    it('should throw HttpError when response is not ok and status is not 404', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        });

        await expect(searchCountries('Ukraine')).rejects.toThrow(HttpError);
        await expect(searchCountries('Ukraine')).rejects.toMatchObject({
            status: 500,
        });
    });

    it('should reject with AbortError when external signal is aborted', async () => {
        const controller = new AbortController();

        fetchMock.mockImplementation((_url: string, options?: RequestInit) => {
            return new Promise((_resolve, reject) => {
                options?.signal?.addEventListener('abort', () => {
                    reject(options.signal?.reason ?? new DOMException('Aborted', 'AbortError'));
                });
            });
        });

        const promise = searchCountries('Ukraine', controller.signal, REQUEST_TIMEOUT_MS);
        controller.abort();

        await expect(promise).rejects.toMatchObject({
            name: 'AbortError',
        });
    });

    it('should reject with TimeoutError when request exceeds timeout', async () => {
        const controller = new AbortController();

        fetchMock.mockImplementation((_url: string, options?: RequestInit) => {
            return new Promise((_resolve, reject) => {
                options?.signal?.addEventListener('abort', () => {
                    reject(options.signal?.reason ?? new DOMException('Timeout', 'TimeoutError'));
                });
            });
        });

        const promise = searchCountries('Ukraine', controller.signal, 20);

        await expect(promise).rejects.toMatchObject({
            name: 'TimeoutError',
        });
    });

    it('should propagate network errors', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(searchCountries('Ukraine')).rejects.toThrow('Failed to fetch');
    });
});
