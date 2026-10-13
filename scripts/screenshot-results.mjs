import { chromium } from 'playwright'

const FIXTURE = {
  score: 72,
  summary: 'The prompt buries the real consequences behind friendly wording and steers you toward "Allow".',
  findings: [
    {
      id: 'f1',
      pattern: 'Trick Questions',
      severity: 'high',
      evidence: 'Get the latest updates, offers and more!',
      explanation:
        'The button says "Allow", but it is really asking for marketing notifications — not something essential to the app.',
      recommendation:
        'State plainly what will be collected and offer equally visible "Not now" and "Allow" choices.',
      bbox: { x: 51, y: 53, w: 21.5, h: 8.5 },
    },
    {
      id: 'f2',
      pattern: 'Sneaky Consent',
      severity: 'medium',
      evidence: 'Not now / Allow',
      explanation:
        'The message uses friendly language to make you agree without explaining the consequences, and the "Allow" button is visually prominent while "Not now" is less noticeable.',
      recommendation: 'Use neutral wording and give both options the same visual weight.',
      bbox: { x: 23, y: 39.5, w: 53, h: 9.5 },
    },
    {
      id: 'f3',
      pattern: 'Forced Continuity',
      severity: 'low',
      evidence: 'Get the latest updates, offers and more!',
      explanation:
        'You might keep getting notifications even after you stop finding them useful, with no clear explanation of how to turn them off later.',
      recommendation: 'Link to notification settings from the prompt and explain how to opt out.',
      bbox: { x: 27.5, y: 53, w: 19, h: 8.5 },
    },
  ],
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

await page.route('**/api/health', (r) => r.fulfill({ json: { ok: true, configured: true, model: 'mock' } }))
await page.route('**/api/analyze', async (r) => {
  await new Promise((res) => setTimeout(res, 350))
  r.fulfill({ json: FIXTURE })
})

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 30000 })
await page.getByRole('button', { name: /Sneaky consent/i }).click()
await page.locator('.results-head').waitFor({ state: 'visible', timeout: 15000 })
await page.waitForTimeout(600)

const report = await page.evaluate(() => ({
  pills: [...document.querySelectorAll('.pill')].map((p) => p.textContent),
  count: document.querySelector('.count-pill')?.textContent,
  score: document.querySelector('.score-chip')?.textContent,
  boxes: document.querySelectorAll('.overlay-box').length,
  cards: document.querySelectorAll('.find-card').length,
  scrollHeight: document.documentElement.scrollHeight,
}))
console.log(JSON.stringify({ report, errors }, null, 2))

await page.screenshot({ path: '.shots/results.png', fullPage: true })
await browser.close()
