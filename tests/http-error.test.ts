import { describe, expect, it } from 'vitest';
import { HttpError } from '../src/errors/http-error';

describe('HttpError', () => {
    it('should create an instance of HttpError', () => {
        const error = new HttpError(404, 'Not Found');

        expect(error).toBeInstanceOf(HttpError);
        expect(error).toBeInstanceOf(Error);
    });

    it('should store the HTTP status', () => {
        const error = new HttpError(500, 'Internal Server Error');

        expect(error.status).toBe(500);
    });

    it('should store the error message and name', () => {
        const error = new HttpError(404, 'Not Found');

        expect(error.message).toBe('Not Found');
        expect(error.name).toBe('HttpError');
    });
});
