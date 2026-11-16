import { describe, expect, it } from 'vitest';
import { createSearchHistoryStorage } from '../../src/storage/search-history-storage';

function createMemoryStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
    const store = new Map<string, string>();

    return {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
            store.set(key, value);
        },
        removeItem: (key: string) => {
            store.delete(key);
        },
    };
}

describe('createSearchHistoryStorage', () => {
    it('should return empty array when storage is empty', () => {
        const storage = createSearchHistoryStorage(createMemoryStorage());

        expect(storage.getHistory()).toEqual([]);
    });

    it('should add trimmed queries in most-recent-first order', () => {
        const storage = createSearchHistoryStorage(createMemoryStorage());

        storage.addToHistory('  Ukraine  ');
        const updated = storage.addToHistory('Poland');

        expect(updated).toEqual(['Poland', 'Ukraine']);
        expect(storage.getHistory()).toEqual(['Poland', 'Ukraine']);
    });

    it('should ignore empty or whitespace-only queries', () => {
        const storage = createSearchHistoryStorage(createMemoryStorage());

        storage.addToHistory('');
        storage.addToHistory('   ');

        expect(storage.getHistory()).toEqual([]);
    });

    it('should deduplicate queries case-insensitively and move latest to top', () => {
        const storage = createSearchHistoryStorage(createMemoryStorage());

        storage.addToHistory('Ukraine');
        storage.addToHistory('Poland');
        const updated = storage.addToHistory('ukraine');

        expect(updated).toEqual(['ukraine', 'Poland']);
    });

    it('should limit history length to maxItems', () => {
        const storage = createSearchHistoryStorage(createMemoryStorage(), 'test-key', 3);

        storage.addToHistory('One');
        storage.addToHistory('Two');
        storage.addToHistory('Three');
        const updated = storage.addToHistory('Four');

        expect(updated).toEqual(['Four', 'Three', 'Two']);
    });

    it('should handle corrupted JSON in storage gracefully', () => {
        const memoryStorage = createMemoryStorage();
        memoryStorage.setItem('country-search-history', '{invalid-json');
        const storage = createSearchHistoryStorage(memoryStorage);

        expect(storage.getHistory()).toEqual([]);
    });

    it('should clear history when clearHistory is called', () => {
        const storage = createSearchHistoryStorage(createMemoryStorage());

        storage.addToHistory('Ukraine');
        storage.clearHistory();

        expect(storage.getHistory()).toEqual([]);
    });
});
