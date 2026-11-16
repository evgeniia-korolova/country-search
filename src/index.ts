import { countrySearchController } from './controllers/country-search-controller.js';
import { createSearchHistoryStorage } from './storage/search-history-storage.js';
import type { Country } from './types/country.js';
import type { SearchState } from './types/search-state.js';
import { renderCountryDetails } from './ui/render-country-details.js';
import { renderCountryList } from './ui/render-country-list.js';
import { renderSearchHistory } from './ui/render-search-history.js';
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
    const historyStorage = createSearchHistoryStorage();

    const appContainer = createElement('div', { className: 'app-container' });
    const title = createElement('h1', {
        className: 'app-title',
        textContent: 'Discover the Country',
    });

    const historyContainer = createElement('div', { className: 'history-container' });
    const contentContainer = createElement('main', { className: 'app-content' });

    const searchInput = renderSearchInput((query: string) => {
        lastQuery = query;
        controller.search(query);
    });

    const handleSelectCountry = (country: Country): void => {
        const modal = renderCountryDetails(country, () => {
            modal.remove();
        });
        document.body.append(modal);
    };

    const handleSelectHistory = (query: string): void => {
        lastQuery = query;
        searchInput.setValue(query);
        controller.search(query);
    };

    const handleClearHistory = (): void => {
        historyStorage.clearHistory();
        updateHistoryUI([]);
    };

    const updateHistoryUI = (items: string[]): void => {
        historyContainer.replaceChildren(
            renderSearchHistory(items, handleSelectHistory, handleClearHistory)
        );
    };

    const handleStateChange = (state: SearchState): void => {
        switch (state.status) {
            case 'idle':
                contentContainer.replaceChildren(renderIdleState());
                break;
            case 'loading':
                contentContainer.replaceChildren(renderLoadingState());
                break;
            case 'success': {
                const updatedHistory = historyStorage.addToHistory(lastQuery);
                updateHistoryUI(updatedHistory);
                contentContainer.replaceChildren(
                    renderCountryList(state.countries, handleSelectCountry)
                );
                break;
            }
            case 'empty':
                contentContainer.replaceChildren(renderEmptyState(state.message));
                break;
            case 'error':
                contentContainer.replaceChildren(renderErrorState(state.message, handleRetry));
                break;
        }
    };

    const controller = countrySearchController(handleStateChange);

    const handleRetry = (): void => {
        controller.search(lastQuery);
    };

    const header = createElement('header', { className: 'app-header' }, title, searchInput.element);

    appContainer.append(header, historyContainer, contentContainer);
    document.body.append(appContainer);

    updateHistoryUI(historyStorage.getHistory());
    contentContainer.replaceChildren(renderIdleState());
}

initApp();
