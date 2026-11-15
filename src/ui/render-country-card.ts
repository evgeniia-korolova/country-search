import type { Country } from '../types/country';
import { createElement } from '../utils/create-element.js';

function createInfoRow(label: string, value: string): HTMLElement {
    const labelEl = createElement('span', {
        className: 'info-label',
        textContent: `${label}: `,
    });
    const valueEl = createElement('span', {
        className: 'info-value',
        textContent: value,
    });

    return createElement('p', { className: 'info-row' }, labelEl, valueEl);
}

export function renderCountryCard(
    country: Country,
    onSelect: (country: Country) => void
): HTMLElement {
    const flagImg = createElement('img', {
        className: 'country-flag',
        attributes: {
            src: country.flag,
            alt: `Flag of ${country.name}`,
            loading: 'lazy',
        },
    });

    const flagWrapper = createElement('div', { className: 'country-flag-wrapper' }, flagImg);

    const title = createElement('h2', {
        className: 'country-name',
        textContent: country.name,
    });

    const infoList = createElement(
        'div',
        { className: 'country-info' },
        createInfoRow('Capital', country.capital),
        createInfoRow('Region', country.region),
        createInfoRow('Population', country.population.toLocaleString('en-US'))
    );

    const body = createElement('div', { className: 'country-card-body' }, title, infoList);

    const card = createElement(
        'article',
        {
            className: 'country-card',
            attributes: {
                tabindex: '0',
                role: 'button',
                'aria-label': `View details for ${country.name}`,
            },
        },
        flagWrapper,
        body
    );

    card.addEventListener('click', () => {
        onSelect(country);
    });

    card.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(country);
        }
    });

    return card;
}
