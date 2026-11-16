import { createElement } from '../utils/create-element.js';

export function renderSearchHistory(
    history: string[],
    onSelect: (query: string) => void,
    onClear: () => void
): HTMLElement {
    const container = createElement('div', {
        className: 'search-history',
        attributes: { role: 'region', 'aria-label': 'Recent searches' },
    });

    if (history.length === 0) {
        return container;
    }

    const label = createElement('span', {
        className: 'history-label',
        textContent: 'Recent:',
    });

    const chips = history.map((query) => {
        const chipButton = createElement('button', {
            className: 'history-chip',
            textContent: query,
            attributes: { type: 'button' },
        });

        chipButton.addEventListener('click', () => {
            onSelect(query);
        });

        return createElement('li', { className: 'history-item' }, chipButton);
    });

    const list = createElement('ul', { className: 'history-list' }, ...chips);

    const clearButton = createElement('button', {
        className: 'history-clear-btn',
        textContent: 'Clear',
        attributes: { type: 'button', 'aria-label': 'Clear search history' },
    });

    clearButton.addEventListener('click', onClear);

    container.append(label, list, clearButton);

    return container;
}
