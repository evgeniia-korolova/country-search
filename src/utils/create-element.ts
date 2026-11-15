import type { ElementOptions } from '../types/element-options';

export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: ElementOptions = {},
    ...children: Array<Node | string>
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (options.className) {
        if (Array.isArray(options.className)) {
            element.classList.add(...options.className.filter(Boolean));
        } else {
            element.className = options.className;
        }
    }

    if (options.textContent !== undefined) {
        element.textContent = options.textContent;
    }

    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }

    if (children.length > 0) {
        element.append(...children);
    }

    return element;
}
