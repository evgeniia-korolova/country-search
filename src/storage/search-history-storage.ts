export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface SearchHistoryStorage {
    getHistory: () => string[];
    addToHistory: (query: string) => string[];
    clearHistory: () => void;
}

const DEFAULT_STORAGE_KEY = 'country-search-history';
const DEFAULT_MAX_ITEMS = 5;

function getDefaultStorage(): StorageLike | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

export function createSearchHistoryStorage(
    storage: StorageLike | null = getDefaultStorage(),
    storageKey: string = DEFAULT_STORAGE_KEY,
    maxItems: number = DEFAULT_MAX_ITEMS
): SearchHistoryStorage {
    function getHistory(): string[] {
        if (!storage) {
            return [];
        }

        try {
            const raw = storage.getItem(storageKey);

            if (!raw) {
                return [];
            }

            const parsed: unknown = JSON.parse(raw);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.filter((item): item is string => typeof item === 'string');
        } catch {
            return [];
        }
    }

    function saveHistory(items: string[]): void {
        if (!storage) {
            return;
        }

        try {
            storage.setItem(storageKey, JSON.stringify(items));
        } catch (error: unknown) {
            console.warn('Failed to save search history:', error);
        }
    }

    function addToHistory(query: string): string[] {
        const trimmed = query.trim();

        if (!trimmed) {
            return getHistory();
        }

        const normalized = trimmed.toLowerCase();
        const current = getHistory();
        const deduplicated = current.filter((item) => item.toLowerCase() !== normalized);
        const updated = [trimmed, ...deduplicated].slice(0, maxItems);

        saveHistory(updated);

        return updated;
    }

    function clearHistory(): void {
        if (!storage) {
            return;
        }

        try {
            storage.removeItem(storageKey);
        } catch (error: unknown) {
            console.warn('Failed to save search history:', error);
        }
    }

    return {
        getHistory,
        addToHistory,
        clearHistory,
    };
}
