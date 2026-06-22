import { describe, it, expect } from 'vitest';
import {
    monochrome,
    collideRects,
    cloudRadians,
    indexer2d,
} from '../../src/cloud.js';

// cloudSpriteSimple is intentionally not covered here: it needs a real canvas
// 2d context (measureText / getImageData), which belongs in a browser harness.

describe('cloudRadians', () => {
    it('is one degree in radians', () => {
        expect(cloudRadians).toBeCloseTo(Math.PI / 180, 12);
    });
});

describe('monochrome', () => {
    // monochrome reads the red channel of RGBA pixel data: >10% of 256 => 1.
    it('thresholds the red channel to 0/1', () => {
        const pixels = [
            255, 0, 0, 255, // bright red -> 1
            0, 0, 0, 255, //   black      -> 0
            26, 9, 9, 255, // red just above 25.6 -> 1
            25, 9, 9, 255, // red just below 25.6 -> 0
        ];
        expect(monochrome(pixels)).toEqual([1, 0, 1, 0]);
    });

    it('returns one entry per pixel (length / 4)', () => {
        const pixels = new Array(4 * 5).fill(0);
        expect(monochrome(pixels)).toHaveLength(5);
    });
});

describe('collideRects', () => {
    // (x0,y0) upper-left, (x1,y1) lower-right; screen coords so y0 < y1.
    const rect = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });

    it('detects two overlapping boxes', () => {
        const a = rect(0, 0, 10, 10);
        const b = rect(5, 5, 15, 15);
        expect(collideRects(a, b)).toBe(true);
    });

    it('detects full containment', () => {
        const a = rect(0, 0, 10, 10);
        const b = rect(2, 2, 8, 8);
        expect(collideRects(a, b)).toBe(true);
    });

    it('reports no collision when b is separated horizontally', () => {
        const a = rect(0, 0, 10, 10);
        const b = rect(20, 0, 30, 10);
        expect(collideRects(a, b)).toBe(false);
    });

    it('reports no collision when b is separated vertically', () => {
        // Regression: the original code used `b.y0 > a.y1` here, which falsely
        // reported overlap for vertically-separated boxes (and missed genuine
        // vertical overlaps). Fixed to `b.y0 < a.y1`.
        const a = rect(0, 0, 10, 10);
        const b = rect(0, 20, 10, 30);
        expect(collideRects(a, b)).toBe(false);
    });

    it('detects a genuine vertical overlap', () => {
        const a = rect(0, 0, 10, 10);
        const b = rect(0, 5, 10, 8);
        expect(collideRects(a, b)).toBe(true);
    });
});

describe('indexer2d', () => {
    // a is a flat row-major matrix of width w. indexer2d slices the inclusive
    // sub-block rows i..ip, cols j..jp.
    const matrix = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
    ];

    it('extracts an inclusive sub-block', () => {
        // rows 0..1, cols 1..2 => [1,2,4,5]
        expect(indexer2d(matrix, 3, 0, 1, 1, 2)).toEqual([1, 2, 4, 5]);
    });

    it('extracts a single cell', () => {
        expect(indexer2d(matrix, 3, 1, 1, 1, 1)).toEqual([4]);
    });
});
