export interface CountryLanguage {
    name: string;
}

export interface CountryCurrency {
    code: string;
    name: string;
    symbol: string;
}

export interface Country {
    name: string;
    capital: string;
    region: string;
    subregion: string;
    population: number;
    area: number;
    borders: string[];
    languages: CountryLanguage[];
    currencies: CountryCurrency[];
    flag: string;
}
