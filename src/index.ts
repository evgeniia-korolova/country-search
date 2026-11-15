import { countrySearchController } from './controllers/country-search-controller.js';
import type { Country } from './types/country.js';
import type { SearchState } from './types/search-state.js';
import { renderCountryDetails } from './ui/render-country-details.js';
import { renderCountryList } from './ui/render-country-list.js';
import { renderSearchInput } from './ui/render-search-input.js';
import {
    renderEmptyState,
    renderErrorState,
    renderIdleState,
    renderLoadingState,
} from './ui/render-status.js';
import { createElement } from './utils/create-element.js';

function initApp(): void {
    let lastQuery = '';

    const appContainer = createElement('div', { className: 'app-container' });
    const title = createElement('h1', {
        className: 'app-title',
        textContent: 'Discover the Country',
    });

    const contentContainer = createElement('main', { className: 'app-content' });

    const handleSelectCountry = (country: Country): void => {
        const modal = renderCountryDetails(country, () => {
            modal.remove();
        });
        document.body.append(modal);
    };

    const handleStateChange = (state: SearchState): void => {
        switch (state.status) {
            case 'idle':
                contentContainer.replaceChildren(renderIdleState());
                break;
            case 'loading':
                contentContainer.replaceChildren(renderLoadingState());
                break;
            case 'success':
                contentContainer.replaceChildren(
                    renderCountryList(state.countries, handleSelectCountry)
                );
                break;
            case 'empty':
                contentContainer.replaceChildren(renderEmptyState(state.message));
                break;
            case 'error':
                contentContainer.replaceChildren(renderErrorState(state.message, handleRetry));
                break;
        }
    };

    const controller = countrySearchController(handleStateChange);

    const searchForm = renderSearchInput((query: string) => {
        lastQuery = query;
        controller.search(query);
    });

    const handleRetry = (): void => {
        controller.search(lastQuery);
    };

    const header = createElement('header', { className: 'app-header' }, title, searchForm);

    appContainer.append(header, contentContainer);
    document.body.append(appContainer);

    contentContainer.replaceChildren(renderIdleState());
}

initApp();
