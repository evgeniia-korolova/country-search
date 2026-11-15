import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../constants/constants';
import { HttpError } from '../errors/http-error';
import type { Country } from '../types/country';
import { mapCountryResponse } from '../utils/map-country-response';

export async function searchCountries(
    query: string,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Country[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return [];
    }

    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    const url = `${API_BASE_URL}/name/${encodeURIComponent(trimmedQuery)}`;
    const response = await fetch(url, { signal: combinedSignal });

    if (response.status === 404) {
        return [];
    }

    if (!response.ok) {
        throw new HttpError(response.status, `Request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    return mapCountryResponse(data);
}
