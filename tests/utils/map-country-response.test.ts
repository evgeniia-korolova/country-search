import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../../src/utils/map-country-response';

const raw = [
    {
        name: 'Ukraine',
        alpha2Code: 'UA',
        alpha3Code: 'UKR',
        capital: 'Kyiv',
        region: 'Europe',
        subregion: 'Eastern Europe',
        population: 37000000,
        area: 603500,
        borders: ['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'SVK'],
        languages: [
            {
                iso639_1: 'uk',
                iso639_2: 'ukr',
                name: 'Ukrainian',
                nativeName: 'Українська',
            },
        ],
        currencies: [
            {
                code: 'UAH',
                name: 'Ukrainian hryvnia',
                symbol: '₴',
            },
        ],
        flags: {
            svg: 'https://example.com',
            png: 'https://example.com',
        },
    },
];

const expected = [
    {
        name: 'Ukraine',
        flag: 'https://example.com',
        capital: 'Kyiv',
        region: 'Europe',
        subregion: 'Eastern Europe',
        population: 37000000,
        area: 603500,
        borders: ['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'SVK'],
        languages: [{ name: 'Ukrainian' }],
        currencies: [
            {
                code: 'UAH',
                name: 'Ukrainian hryvnia',
                symbol: '₴',
            },
        ],
    },
];

const createRawCountry = (languages?: unknown) => ({
    name: 'Ukraine',
    alpha2Code: 'UA',
    alpha3Code: 'UKR',
    capital: 'Kyiv',
    region: 'Europe',
    subregion: 'Eastern Europe',
    population: 37000000,
    area: 603500,
    borders: ['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'SVK'],
    currencies: [
        {
            code: 'UAH',
            name: 'Ukrainian hryvnia',
            symbol: '₴',
        },
    ],
    flags: {
        svg: 'https://example.com',
        png: 'https://example.com',
    },
    ...(languages === undefined ? {} : { languages }),
});

const missingLanguage = [{ name: 'Data is currently missing' }];
const missingData = 'Data is currently missing';

describe('mapCountryResponse', () => {
    it('should map API country data to Country model', () => {
        const mappedCountry = mapCountryResponse(raw);

        expect(mappedCountry).toEqual(expected);
    });

    it('should return an array', () => {
        const mappedCountry = mapCountryResponse(raw);

        expect(Array.isArray(mappedCountry)).toBe(true);
    });

    it('should throw an error if raw data is not an array', () => {
        expect(() => mapCountryResponse({})).toThrow();
    });

    it('should not throw an error if raw data is an array', () => {
        expect(() => mapCountryResponse([])).not.toThrow();
    });

    it('should return an empty array if raw data is an empty array', () => {
        const mappedCountry = mapCountryResponse([]);

        expect(mappedCountry).toEqual([]);
    });

    it('should preserve the order of countries', () => {
        const rawCountries = [
            { ...raw[0], name: 'Ukraine' },
            { ...raw[0], name: 'Poland' },
        ];

        const expectedCountries = [
            { ...expected[0], name: 'Ukraine' },
            { ...expected[0], name: 'Poland' },
        ];

        expect(mapCountryResponse(rawCountries)).toEqual(expectedCountries);
    });

    it('should map currency data correctly', () => {
        const mappedCountry = mapCountryResponse(raw);

        expect(mappedCountry[0].currencies).toEqual([
            {
                code: 'UAH',
                name: 'Ukrainian hryvnia',
                symbol: '₴',
            },
        ]);
    });

    it('should return a fallback if languages are missing', () => {
        const mappedCountry = mapCountryResponse([createRawCountry()]);

        expect(mappedCountry[0].languages).toEqual(missingLanguage);
    });

    it('should return a fallback if languages is an empty array', () => {
        const mappedCountry = mapCountryResponse([createRawCountry([])]);

        expect(mappedCountry[0].languages).toEqual(missingLanguage);
    });

    it('should return a fallback if language name is missing', () => {
        const mappedCountry = mapCountryResponse([
            createRawCountry([{ iso639_1: 'uk', iso639_2: 'ukr' }]),
        ]);

        expect(mappedCountry[0].languages).toEqual(missingLanguage);
    });

    it('should skip languages without a name', () => {
        const mappedCountry = mapCountryResponse([
            createRawCountry([
                { name: 'Ukrainian', iso639_1: 'uk' },
                { iso639_1: 'en', iso639_2: 'eng' },
            ]),
        ]);

        expect(mappedCountry[0].languages).toEqual([{ name: 'Ukrainian' }]);
    });

    describe('optional country fields', () => {
        it('should map capital correctly', () => {
            const mappedCountry = mapCountryResponse([createRawCountry(undefined)]);

            expect(mappedCountry[0].capital).toBe('Kyiv');
        });

        it('should return a fallback if capital is missing', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), capital: undefined },
            ]);

            expect(mappedCountry[0].capital).toBe(missingData);
        });

        it('should map region correctly', () => {
            const mappedCountry = mapCountryResponse([createRawCountry(undefined)]);

            expect(mappedCountry[0].region).toBe('Europe');
        });

        it('should return a fallback if region is missing', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), region: undefined },
            ]);

            expect(mappedCountry[0].region).toBe(missingData);
        });

        it('should map subregion correctly', () => {
            const mappedCountry = mapCountryResponse([createRawCountry(undefined)]);

            expect(mappedCountry[0].subregion).toBe('Eastern Europe');
        });

        it('should return a fallback if subregion is missing', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), subregion: undefined },
            ]);

            expect(mappedCountry[0].subregion).toBe(missingData);
        });

        it('should map population correctly', () => {
            const mappedCountry = mapCountryResponse([createRawCountry(undefined)]);

            expect(mappedCountry[0].population).toBe(37000000);
        });

        it('should return null if population is missing', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), population: undefined },
            ]);

            expect(mappedCountry[0].population).toBeNull();
        });

        it('should map area correctly', () => {
            const mappedCountry = mapCountryResponse([createRawCountry(undefined)]);

            expect(mappedCountry[0].area).toBe(603500);
        });

        it('should return null if area is missing', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), area: undefined },
            ]);

            expect(mappedCountry[0].area).toBeNull();
        });
    });

    describe('borders', () => {
        it('should map borders correctly', () => {
            const mappedCountry = mapCountryResponse([createRawCountry(undefined)]);

            expect(mappedCountry[0].borders).toEqual(['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'SVK']);
        });

        it('should return a fallback if borders are missing', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), borders: undefined },
            ]);

            expect(mappedCountry[0].borders).toEqual([missingData]);
        });

        it('should return a fallback if borders is an empty array', () => {
            const mappedCountry = mapCountryResponse([
                { ...createRawCountry(undefined), borders: [] },
            ]);

            expect(mappedCountry[0].borders).toEqual([missingData]);
        });
    });

    describe('flag', () => {
        it('should prefer SVG flag over PNG', () => {
            const mappedCountry = mapCountryResponse([
                {
                    ...createRawCountry(undefined),
                    flags: {
                        svg: 'https://example.com/ua.svg',
                        png: 'https://example.com/ua.png',
                    },
                },
            ]);

            expect(mappedCountry[0].flag).toBe('https://example.com/ua.svg');
        });

        it('should use PNG flag if SVG is missing', () => {
            const mappedCountry = mapCountryResponse([
                {
                    ...createRawCountry(undefined),
                    flags: {
                        png: 'https://example.com/ua.png',
                    },
                },
            ]);

            expect(mappedCountry[0].flag).toBe('https://example.com/ua.png');
        });

        it('should return a fallback if both flag formats are missing', () => {
            const mappedCountry = mapCountryResponse([
                {
                    ...createRawCountry(undefined),
                    flags: {},
                },
            ]);

            expect(mappedCountry[0].flag).toBe(missingData);
        });
    });

    it('should return a fallback if both flag formats are missing', () => {
        const mappedCountry = mapCountryResponse([
            {
                ...createRawCountry(undefined),
                flags: {},
            },
        ]);

        expect(mappedCountry[0].flag).toBe(missingData);
    });

    it('should not mutate the response', () => {
        const raw = [createRawCountry(['UA', 'PL'])];
        const original = structuredClone(raw);

        mapCountryResponse(raw);

        expect(raw).toEqual(original);
    });

    it('should return a copy of the borders list', () => {
        const raw = [createRawCountry(['UA', 'PL'])];

        const mappedCountry = mapCountryResponse(raw);

        expect(mappedCountry[0].borders).not.toBe(raw[0].borders);
        expect(mappedCountry[0].borders).toEqual(raw[0].borders);
    });
});
