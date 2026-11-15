import { createElement } from '../utils/create-element.js';

export function renderIdleState(): HTMLElement {
    const title = createElement('p', {
        className: 'status-title',
        textContent: 'Explore countries around the world',
    });
    const hint = createElement('p', {
        className: 'status-hint',
        textContent: 'Start typing a country name in the search field above.',
    });

    return createElement(
        'div',
        {
            className: ['status-box', 'status-idle'],
            attributes: { role: 'status' },
        },
        title,
        hint
    );
}

export function renderLoadingState(): HTMLElement {
    const spinner = createElement('span', {
        className: 'spinner',
        attributes: { 'aria-hidden': 'true' },
    });
    const text = createElement('p', {
        className: 'status-text',
        textContent: 'Searching countries...',
    });

    return createElement(
        'div',
        {
            className: ['status-box', 'status-loading'],
            attributes: { role: 'status', 'aria-live': 'polite' },
        },
        spinner,
        text
    );
}

export function renderEmptyState(message: string): HTMLElement {
    const title = createElement('p', {
        className: 'status-title',
        textContent: message,
    });
    const hint = createElement('p', {
        className: 'status-hint',
        textContent: 'Try checking the spelling or searching for another country name.',
    });

    return createElement(
        'div',
        {
            className: ['status-box', 'status-empty'],
            attributes: { role: 'status' },
        },
        title,
        hint
    );
}

export function renderErrorState(message: string, onRetry: () => void): HTMLElement {
    const title = createElement('p', {
        className: 'status-title',
        textContent: 'Something went wrong',
    });
    const details = createElement('p', {
        className: 'status-text',
        textContent: message,
    });
    const retryButton = createElement('button', {
        className: ['btn', 'btn-retry'],
        textContent: 'Retry',
        attributes: { type: 'button' },
    });

    retryButton.addEventListener('click', onRetry);

    return createElement(
        'div',
        {
            className: ['status-box', 'status-error'],
            attributes: { role: 'alert' },
        },
        title,
        details,
        retryButton
    );
}
