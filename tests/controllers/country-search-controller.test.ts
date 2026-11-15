import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Country } from '../../src/types/country';
import { countrySearchController } from '../../src/controllers/country-search-controller';
import { searchCountries } from '../../src/api/search-countries';
import { SearchState } from '../../src/types/search-state';
import { DEBOUNCE_DELAY_MS } from '../../src/constants/constants';
import { HttpError } from '../../src/errors/http-error';

vi.mock('../../src/api/search-countries', () => ({
    searchCountries: vi.fn(),
}));

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

describe('countrySearchController', () => {
    const searchCountriesMock = vi.mocked(searchCountries);
    let onStateChange: ReturnType<typeof vi.fn<(state: SearchState) => void>>;

    beforeEach(() => {
        vi.useFakeTimers();
        onStateChange = vi.fn();
        searchCountriesMock.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should debounce search calls and emit loading then success states', async () => {
        searchCountriesMock.mockResolvedValue(mockCountries);
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('U');
        controller.search('Uk');
        controller.search('Ukraine');

        expect(searchCountriesMock).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(searchCountriesMock).toHaveBeenCalledTimes(1);
        expect(searchCountriesMock).toHaveBeenCalledWith('Ukraine', expect.any(AbortSignal));
        expect(onStateChange).toHaveBeenNthCalledWith(1, { status: 'loading' });
        expect(onStateChange).toHaveBeenNthCalledWith(2, {
            status: 'success',
            countries: mockCountries,
        });
    });

    it('should reset to idle state immediately and skip request when query is cleared', async () => {
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Ukraine');
        controller.search('   ');

        expect(onStateChange).toHaveBeenLastCalledWith({ status: 'idle' });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);
        expect(searchCountriesMock).not.toHaveBeenCalled();
    });

    it('should immediately abort in-flight request when user types new input before debounce fires', async () => {
        let capturedSignal: AbortSignal | undefined;

        searchCountriesMock.mockImplementation((_query, signal) => {
            capturedSignal = signal;
            return new Promise(() => {});
        });

        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Uk');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(capturedSignal).toBeDefined();
        expect(capturedSignal?.aborted).toBe(false);

        controller.search('Ukr');
        expect(capturedSignal?.aborted).toBe(true);
    });

    it('should silently ignore AbortError and not show error state to user', async () => {
        searchCountriesMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Ukraine');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(onStateChange).toHaveBeenCalledTimes(1);
        expect(onStateChange).toHaveBeenCalledWith({ status: 'loading' });
        expect(onStateChange).not.toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error' })
        );
    });

    it('should emit empty state when searchCountries returns an empty array', async () => {
        searchCountriesMock.mockResolvedValue([]);
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Atlantis');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(onStateChange).toHaveBeenLastCalledWith({
            status: 'empty',
            message: 'No countries found on your request',
        });
    });

    it('should emit timeout error state on TimeoutError separately from AbortError', async () => {
        searchCountriesMock.mockRejectedValue(new DOMException('Timeout', 'TimeoutError'));
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Ukraine');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(onStateChange).toHaveBeenLastCalledWith({
            status: 'error',
            message: 'Request timed out. Please try again.',
        });
    });

    it('should emit server error state on HttpError', async () => {
        searchCountriesMock.mockRejectedValue(new HttpError(500, 'Internal Server Error'));
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Ukraine');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(onStateChange).toHaveBeenLastCalledWith({
            status: 'error',
            message: 'Server error (500). Please try again later.',
        });
    });

    it('should emit generic network error state on unexpected errors', async () => {
        searchCountriesMock.mockRejectedValue(new TypeError('Failed to fetch'));
        const controller = countrySearchController(onStateChange, DEBOUNCE_DELAY_MS);

        controller.search('Ukraine');
        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS);

        expect(onStateChange).toHaveBeenLastCalledWith({
            status: 'error',
            message: 'Network error. Please check your connection.',
        });
    });
});
