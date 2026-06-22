import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture.html')).href;

// The fixture feeds 10 words (the shortest of the input vectors), so the
// shift plots 10 word bars.
const EXPECTED_WORDS = 10;

test.beforeEach(async ({ page }) => {
    await page.goto(fixture);
    // wait until the inline script finished plotting
    await page.waitForFunction(() => window.__rendered === true);
});

test('renders the shift SVG with the expected structure', async ({ page }) => {
    const svg = page.locator('svg#shiftsvg');
    await expect(svg).toHaveCount(1);

    // one bar + one label per plotted word
    await expect(page.locator('rect.shiftrect')).toHaveCount(EXPECTED_WORDS);
    await expect(page.locator('text.shifttext')).toHaveCount(EXPECTED_WORDS);

    // three right-hand summary bars (positive, negative, total)
    await expect(page.locator('rect.sumrectR')).toHaveCount(3);
});

test('labels include the input words', async ({ page }) => {
    const labels = await page.locator('text.shifttext').allTextContents();
    const joined = labels.join(' ');
    // a few of the input words should appear among the rank-prefixed labels
    expect(joined).toContain('love');
    expect(joined).toContain('happy');
});

// Migration canary: the click-to-translate handler is registered as
// `.on("click", function(d, i) { ... sortedWordsEn[i] ... })`. That index
// argument only exists in d3 v4/v5; d3 v6+ changed the signature to
// `(event, d)`, which would break this toggle. If a future d3 bump regresses
// the event wiring, this test fails.
test('clicking a word toggles it to the translated label', async ({ page }) => {
    const firstLabel = page.locator('text.shifttext').first();

    const before = await firstLabel.textContent();
    expect(before).not.toContain('_en');

    await firstLabel.click();

    await expect(firstLabel).toContainText('_en');
});
