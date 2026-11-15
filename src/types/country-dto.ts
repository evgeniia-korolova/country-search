export interface CurrencyDTO {
    code: string;
    name: string;
    symbol: string;
}

export interface LanguageDTO {
    iso639_1: string;
    iso639_2: string;
    name: string;
    nativeName: string;
}

export interface CountryFlagsDTO {
    svg?: string;
    png?: string;
}

export interface CountryDTO {
    name: string;
    alpha2Code: string;
    alpha3Code: string;
    capital?: string;
    region?: string;
    subregion?: string;
    population: number;
    area: number;
    borders?: string[];
    languages?: LanguageDTO[];
    currencies?: CurrencyDTO[];
    flags?: CountryFlagsDTO;
}
