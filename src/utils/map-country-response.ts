import type { Country, CountryCurrency, CountryLanguage } from '../types/country';
import type { CountryDTO, CountryFlagsDTO, CurrencyDTO, LanguageDTO } from '../types/country-dto';

const MISSING_DATA = 'Data is currently missing';

const mapLanguages = (languages?: LanguageDTO[]): CountryLanguage[] => {
    if (!Array.isArray(languages) || languages.length === 0) {
        return [{ name: MISSING_DATA }];
    }

    const validLanguages = languages
        .filter((lang): lang is LanguageDTO & { name: string } => Boolean(lang?.name?.trim()))
        .map((lang) => ({ name: lang.name }));

    return validLanguages.length > 0 ? validLanguages : [{ name: MISSING_DATA }];
};

const mapCurrencies = (currencies?: CurrencyDTO[]): CountryCurrency[] => {
    if (!Array.isArray(currencies)) {
        return [];
    }

    return currencies.map(({ code, name, symbol }) => ({
        code,
        name,
        symbol,
    }));
};

const mapBorders = (borders?: string[]): string[] => {
    if (!Array.isArray(borders) || borders.length === 0) {
        return [MISSING_DATA];
    }

    return [...borders];
};

const mapFlag = (flags?: CountryFlagsDTO): string => {
    return flags?.svg || flags?.png || MISSING_DATA;
};

export function mapCountryResponse(raw: unknown): Country[] {
    if (!Array.isArray(raw)) {
        throw new Error('Invalid country response: expected an array');
    }

    return raw.map((item: CountryDTO): Country => ({
        name: item.name,
        capital: item.capital || MISSING_DATA,
        region: item.region || MISSING_DATA,
        subregion: item.subregion || MISSING_DATA,
        population: item.population,
        area: item.area,
        borders: mapBorders(item.borders),
        languages: mapLanguages(item.languages),
        currencies: mapCurrencies(item.currencies),
        flag: mapFlag(item.flags),
    }));
}
