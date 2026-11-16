import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/utils/debounce';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return a function', () => {
        const callback = vi.fn<(query: string) => void>();
        const debounced = debounce(callback, 500);

        expect(typeof debounced).toBe('function');
    });

    it('should not be called immediately or before the time expires', () => {
        const callback = vi.fn<(query: string) => void>();
        const debounced = debounce(callback, 400);

        debounced('France');

        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(399);

        expect(callback).not.toHaveBeenCalled();
    });

    it('should call the function after the specified delay', () => {
        const callback = vi.fn<(query: string) => void>();
        const debounced = debounce(callback, 400);

        debounced('France');

        vi.advanceTimersByTime(400);

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith('France');
    });

    it('should cancel the previous timer when called again', () => {
        const callback = vi.fn<(query: string) => void>();
        const debounced = debounce(callback, 500);

        debounced('France');

        vi.advanceTimersByTime(200);

        debounced('Germany');

        vi.advanceTimersByTime(200);

        debounced('Italy');

        expect(callback).not.toHaveBeenCalled();
    });

    it('should execute the last call with its arguments', () => {
        const callback = vi.fn<(query: string) => void>();
        const debounced = debounce(callback, 500);

        debounced('France');
        debounced('Germany');
        debounced('Italy');

        vi.advanceTimersByTime(500);

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith('Italy');
    });

    it('should pass the arguments from the last call', () => {
        const callback = vi.fn<(query: string) => void>();
        const debounced = debounce(callback, 500);

        debounced('France');
        debounced('Germany');
        debounced('Italy');

        vi.advanceTimersByTime(500);

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith('Italy');
    });
});
