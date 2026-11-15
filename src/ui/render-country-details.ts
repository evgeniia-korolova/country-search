import type { Country } from '../types/country';
import { createElement } from '../utils/create-element.js';

function createDetailItem(label: string, value: string): HTMLElement {
    const term = createElement('dt', {
        className: 'detail-label',
        textContent: label,
    });
    const description = createElement('dd', {
        className: 'detail-value',
        textContent: value,
    });

    return createElement('div', { className: 'detail-item' }, term, description);
}

export function renderCountryDetails(country: Country, onClose: () => void): HTMLElement {
    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    const closeModal = (): void => {
        document.removeEventListener('keydown', handleKeyDown);
        onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    const closeButton = createElement('button', {
        className: ['btn', 'btn-close'],
        textContent: '× Close',
        attributes: {
            type: 'button',
            'aria-label': 'Close country details',
        },
    });
    closeButton.addEventListener('click', closeModal);

    const header = createElement('div', { className: 'details-header' }, closeButton);

    const flagImg = createElement('img', {
        className: 'details-flag',
        attributes: {
            src: country.flag,
            alt: `Flag of ${country.name}`,
        },
    });

    const flagWrapper = createElement('div', { className: 'details-flag-wrapper' }, flagImg);

    const title = createElement('h2', {
        className: 'details-title',
        textContent: country.name,
    });

    const languagesText = country.languages.map((lang) => lang.name).join(', ');
    const currenciesText =
        country.currencies.length > 0
            ? country.currencies
                  .map((curr) => `${curr.name} (${curr.code}, ${curr.symbol})`)
                  .join(', ')
            : 'Data is currently missing';
    const bordersText = country.borders.join(', ');

    const populationText =
        country.population !== null
            ? country.population.toLocaleString('en-US')
            : 'Data is currently missing';

    const areaText =
        country.area !== null
            ? `${country.area.toLocaleString('en-US')} km²`
            : 'Data is currently missing';

    const detailsList = createElement(
        'dl',
        { className: 'details-list' },
        createDetailItem('Capital', country.capital),
        createDetailItem('Region', `${country.region} (${country.subregion})`),
        createDetailItem('Population', populationText),
        createDetailItem('Area', areaText),
        createDetailItem('Borders', bordersText),
        createDetailItem('Languages', languagesText),
        createDetailItem('Currencies', currenciesText)
    );

    const content = createElement(
        'div',
        { className: 'details-content' },
        flagWrapper,
        createElement('div', { className: 'details-body' }, title, detailsList)
    );

    const modalCard = createElement(
        'div',
        {
            className: 'details-modal',
            attributes: {
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': `${country.name} details`,
            },
        },
        header,
        content
    );

    const overlay = createElement('div', { className: 'modal-overlay' }, modalCard);

    overlay.addEventListener('click', (event: MouseEvent) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    return overlay;
}
