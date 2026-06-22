import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { urllib } from '../../src/urllib.js';

// urllib reads window.location and writes via window.history.replaceState.
// In the node test env we stub a minimal window; each test can set the
// query string it wants to parse.
let replaceStateCalls;

function stubWindow(search = '') {
    replaceStateCalls = [];
    globalThis.window = {
        location: { search, origin: 'http://example.test', pathname: '/p' },
        history: { replaceState: (...args) => replaceStateCalls.push(args) },
    };
}

beforeEach(() => stubWindow());
afterEach(() => {
    delete globalThis.window;
});

describe('urllib.encoder', () => {
    it('exposes the default variable name and supports chaining', () => {
        const enc = urllib.encoder();
        expect(enc.varname()).toBe('tmp');
        expect(enc.varname('wordtypes').varname()).toBe('wordtypes');
    });

    it('writes the encoded array to the URL and remembers the value', () => {
        const enc = urllib.encoder().varname('wordtypes');
        enc.varval([1, 2, 3]);

        expect(enc.varval()).toEqual([1, 2, 3]);
        expect(replaceStateCalls).toHaveLength(1);
        // replaceState(state, title, url)
        expect(replaceStateCalls[0][2]).toContain('wordtypes=[1,2,3]');
    });
});

describe('urllib.decoder', () => {
    it('exposes the default variable name', () => {
        expect(urllib.decoder().varname()).toBe('tmp');
    });

    it('round-trips an explicit varresult', () => {
        const dec = urllib.decoder().varresult('none');
        expect(dec.varresult()).toBe('none');
    });

    it('parses a bracketed array out of the query string', () => {
        stubWindow('?wordtypes=[a,b,c]');
        const result = urllib.decoder().varname('wordtypes')();
        expect(result.current).toEqual(['a', 'b', 'c']);
    });

    it('parses a scalar value out of the query string', () => {
        stubWindow('?viz=wordshift');
        const result = urllib.decoder().varname('viz')();
        expect(result.current).toBe('wordshift');
    });
});
