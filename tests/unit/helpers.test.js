import { describe, it, expect } from 'vitest';
import {
    capitaliseFirstLetter,
    commaSeparateNumber,
    intStr0,
    intStr,
} from '../../src/helpers.js';

describe('capitaliseFirstLetter', () => {
    it('upper-cases the first character', () => {
        expect(capitaliseFirstLetter('love')).toBe('Love');
    });

    it('leaves the rest of the string untouched', () => {
        expect(capitaliseFirstLetter('happiness shift')).toBe('Happiness shift');
    });

    it('is a no-op on an already-capitalised string', () => {
        expect(capitaliseFirstLetter('Joy')).toBe('Joy');
    });
});

describe('commaSeparateNumber', () => {
    it('inserts thousands separators', () => {
        expect(commaSeparateNumber(1000)).toBe('1,000');
        expect(commaSeparateNumber(1234567)).toBe('1,234,567');
    });

    it('leaves small numbers unchanged', () => {
        expect(commaSeparateNumber(42).toString()).toBe('42');
    });
});

describe('integer name tables', () => {
    it('maps small integers to words, starting at zero', () => {
        expect(intStr0[0]).toBe('zero');
        expect(intStr0[3]).toBe('three');
    });

    it('intStr is intStr0 shifted to start at one', () => {
        expect(intStr[0]).toBe('one');
        expect(intStr[0]).toBe(intStr0[1]);
        expect(intStr.length).toBe(intStr0.length - 1);
    });
});
