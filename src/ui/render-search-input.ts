import { createElement } from '../utils/create-element.js';

export interface SearchInputComponent {
    element: HTMLElement;
    setValue: (value: string) => void;
}

export function renderSearchInput(onInput: (query: string) => void): SearchInputComponent {
    const label = createElement('label', {
        className: 'visually-hidden',
        textContent: 'Search for a country',
        attributes: { for: 'country-search-input' },
    });

    const input = createElement('input', {
        className: 'search-input',
        attributes: {
            id: 'country-search-input',
            type: 'search',
            placeholder: 'Search for a country...',
            autocomplete: 'off',
            'aria-label': 'Search for a country',
        },
    });

    input.addEventListener('input', () => {
        onInput(input.value);
    });

    const form = createElement(
        'form',
        {
            className: 'search-form',
            attributes: { role: 'search' },
        },
        label,
        input
    );

    form.addEventListener('submit', (event: SubmitEvent) => {
        event.preventDefault();
    });

    return {
        element: form,
        setValue: (value: string) => {
            input.value = value;
        },
    };
}
