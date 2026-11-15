import type { Country } from './country';

export type SearchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; countries: Country[] }
    | { status: 'empty'; message: string }
    | { status: 'error'; message: string };
