import { defineConfig, devices } from '@playwright/test';

// Browser tests render the real bundle in Chromium and assert against the
// produced SVG. The dist bundle is rebuilt first by the `pretest:browser`
// npm script, so these tests always run against current source.
export default defineConfig({
    testDir: './tests/browser',
    testMatch: '**/*.spec.mjs',
    fullyParallel: true,
    reporter: 'list',
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
