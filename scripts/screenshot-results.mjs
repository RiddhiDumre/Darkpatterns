import { chromium } from 'playwright'

import fs from 'node:fs'

const FIXTURE = {
  score: 82,
  verdict: '2 manipulative traps flagged — this popup is actively guilt-tripping you into coughing up cash',
  summary:
    'The growth team pulled out all the classic tricks: neon primary buttons, existential guilt for leaving, and an opt-out link designed to be practically invisible.',
  findings: [
    {
      id: 'f1',
      pattern: 'Confirmshaming',
      severity: 'high',
      evidence: 'No thanks, I prefer to pay full price',
      explanation:
        'The opt-out is framed as an **embarrassing personal flaw**, forcing users to admit they love wasting money just to close a pop-up.',
      translation: 'Click accept or officially confess to being bad with your own finances.',
      recommendation:
        'Use neutral copy like "Continue without discount" and skip the amateur guilt trip.',
      guideline: 'CCPA Guideline 5(c) Confirmshaming',
      bbox: { x: 22, y: 78, w: 56, h: 9 },
    },
    {
      id: 'f2',
      pattern: 'Interface Interference',
      severity: 'medium',
      evidence: 'Start your free trial',
      explanation:
        'The primary button gets a **luminous neon runway**, while the dismissal link was styled by someone who is terrified of being noticed.',
      translation: 'We really hope you do not notice the exit button.',
      recommendation:
        'Present accept and decline choices with balanced button weights and neutral typography.',
      guideline: 'CCPA Guideline 5(f) Interface Interference',
      bbox: { x: 18, y: 64, w: 64, h: 11 },
    },
  ],
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

await page.route('**/api/health', (r) => r.fulfill({ json: { ok: true, configured: true, model: 'mock' } }))
await page.route('**/api/analyze', async (r) => {
  await new Promise((res) => setTimeout(res, 200))
  r.fulfill({ json: FIXTURE })
})

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 30000 })

const imgBuffer = fs.readFileSync('public/examples/example-tricky-wording.png')
const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles({
  name: 'example-tricky-wording.png',
  mimeType: 'image/png',
  buffer: imgBuffer,
})

await page.locator('.view-workspace').waitFor({ state: 'visible', timeout: 15000 })
await page.waitForTimeout(600)
// 1. Activate Finding 1 so active pin label appears directly on screenshot
await page.locator('.finding-card').first().click()
await page.waitForTimeout(300)

const report = await page.evaluate(() => ({
  title: document.querySelector('.verdict-headline')?.textContent,
  sub: document.querySelector('.verdict-count')?.textContent,
  findingsCount: document.querySelectorAll('.finding-card').length,
  boxes: document.querySelectorAll('.overlay-box').length,
  activeLabel: document.querySelector('.overlay-active-label')?.textContent?.trim(),
  hasHero: Boolean(document.querySelector('.launchpad-hero')),
  hasDropzone: Boolean(document.querySelector('.dropzone-trigger')),
  scrollHeight: document.documentElement.scrollHeight,
}))
console.log(JSON.stringify({ report, errors }, null, 2))

await page.screenshot({ path: '.shots/results.png', fullPage: true })

// 2. Click "The Trap" on finding 1 to verify before toggle
await page.locator('.fix-toggle-btn:text("The Trap")').first().click()
await page.waitForTimeout(300)
await page.screenshot({ path: '.shots/results-before-toggle.png', fullPage: true })

await browser.close()
