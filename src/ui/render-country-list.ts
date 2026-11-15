import type { Country } from '../types/country';
import { createElement } from '../utils/create-element.js';
import { renderCountryCard } from './render-country-card.js';

export function renderCountryList(
    countries: Country[],
    onSelect: (country: Country) => void
): HTMLElement {
    const items = countries.map((country) =>
        createElement('li', { className: 'countries-item' }, renderCountryCard(country, onSelect))
    );

    return createElement('ul', { className: 'countries-list' }, ...items);
}
