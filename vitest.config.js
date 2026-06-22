import { defineConfig } from 'vitest/config';

// Unit tests cover the pure, DOM-free helpers. Anything that touches the
// DOM or d3 rendering is exercised by the Playwright browser tests instead.
export default defineConfig({
    test: {
        include: ['tests/unit/**/*.test.js'],
        environment: 'node',
    },
});
