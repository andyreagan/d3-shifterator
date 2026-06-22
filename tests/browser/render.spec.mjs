import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture.html')).href;

// The fixture feeds 10 words (the shortest of the input vectors), so the
// shift plots 10 word bars.
const EXPECTED_WORDS = 10;

// Build an extra shift with the given options into a fresh container and
// return its CSS selector, so each scenario is isolated from the default one.
async function buildInto(page, opts) {
    return page.evaluate((o) => {
        const el = document.createElement('div');
        el.id = 'scenario-' + Math.floor(performance.now() * 1000);
        document.body.appendChild(el);
        window.buildShift('#' + el.id, o);
        return '#' + el.id;
    }, opts);
}

let pageErrors;

test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    await page.goto(fixture);
    // wait until the inline script finished plotting the default shift
    await page.waitForFunction(() => window.__rendered === true);
});

test.afterEach(() => {
    // No scenario should produce an uncaught error (a d3 API regression would
    // typically surface here — e.g. the removed d3.event in v6).
    expect(pageErrors, pageErrors.map((e) => e.message).join('\n')).toEqual([]);
});

test('renders the shift SVG with the expected structure', async ({ page }) => {
    const svg = page.locator('#thisdiv svg#shiftsvg');
    await expect(svg).toHaveCount(1);

    // one bar + one label per plotted word
    await expect(page.locator('#thisdiv rect.shiftrect')).toHaveCount(EXPECTED_WORDS);
    await expect(page.locator('#thisdiv text.shifttext')).toHaveCount(EXPECTED_WORDS);

    // three right-hand summary bars (positive, negative, total)
    await expect(page.locator('#thisdiv rect.sumrectR')).toHaveCount(3);
});

test('labels include the input words', async ({ page }) => {
    const labels = await page.locator('#thisdiv text.shifttext').allTextContents();
    const joined = labels.join(' ');
    expect(joined).toContain('love');
    expect(joined).toContain('happy');
});

// Migration canary: the click-to-translate handler is registered as
// `.on("click", function(d, i) { ... sortedWordsEn[i] ... })`. That index
// argument only exists in d3 v4/v5; d3 v6+ changed the signature to
// `(event, d)`, which would break this toggle. If a future d3 bump regresses
// the event wiring, this test fails.
test('clicking a word toggles it to the translated label', async ({ page }) => {
    const firstLabel = page.locator('#thisdiv text.shifttext').first();

    const before = await firstLabel.textContent();
    expect(before).not.toContain('_en');

    await firstLabel.click();

    await expect(firstLabel).toContainText('_en');
});

test('hovering a summary bar raises its opacity', async ({ page }) => {
    const sumBar = page.locator('#thisdiv rect.sumrectR').first();
    expect(await sumBar.evaluate((el) => el.style.opacity)).toBe('0.7');

    await sumBar.hover();

    expect(await sumBar.evaluate((el) => el.style.opacity)).toBe('1');
});

test('renders an x-axis with ticks when enabled', async ({ page }) => {
    const sel = await buildInto(page, { xaxis: true });
    await expect(page.locator(`${sel} g.axis`)).toHaveCount(1);
    expect(await page.locator(`${sel} g.axis .tick`).count()).toBeGreaterThan(0);
});

test('renders the distribution view without errors', async ({ page }) => {
    const sel = await buildInto(page, { dist: true, height: 600 });
    // the shift still renders its word bars in distribution mode
    await expect(page.locator(`${sel} rect.shiftrect`)).toHaveCount(EXPECTED_WORDS);
    // afterEach asserts no uncaught errors were thrown building the dist view
});

// Migration canary for the zoom/wheel handler, which reads the global
// `d3.event` (removed in d3 v6). A wheel event on the plot must not throw.
test('wheel/zoom interaction does not throw', async ({ page }) => {
    await page.locator('#thisdiv .main').dispatchEvent('wheel', { deltaY: 20 });
    // give the handler a tick to run
    await page.waitForTimeout(50);
    // afterEach asserts pageErrors is empty
});
