import { chromium } from 'playwright'
import fs from 'node:fs'

const FIXTURE = {
  score: 82,
  verdict: 'Caught being sneaky.',
  summary:
    'We found 2 deceptive patterns engineered to manipulate user decisions through asymmetric button styling and emotional guilt-tripping.',
  findings: [
    {
      id: 'f1',
      pattern: 'Confirmshaming',
      severity: 'high',
      evidence: 'No thanks, I prefer paying full price',
      explanation:
        'Framing opting out as an **embarrassing personal flaw** to guilt-trip users into saying yes.',
      guideline: 'CCPA 2023 Guideline 5(c): Confirmshaming',
      bbox: { x: 22, y: 78, w: 56, h: 9 },
    },
    {
      id: 'f2',
      pattern: 'Interface Interference',
      severity: 'medium',
      evidence: 'Start your free trial',
      explanation:
        'Making the primary button huge and colorful while hiding the decline link in low-contrast text.',
      guideline: 'CCPA 2023 Guideline 5(f): Interface Interference',
      bbox: { x: 18, y: 64, w: 64, h: 11 },
    },
  ],
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

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

await page.locator('.bujo-page-viewport').waitFor({ state: 'visible', timeout: 15000 })
await page.waitForTimeout(500)

// Click first bullet item to verify active highlight
await page.locator('.bujo-bullet-item').first().click()
await page.waitForTimeout(300)

const report = await page.evaluate(() => ({
  title: document.querySelector('.bujo-section-title')?.textContent,
  bulletCount: document.querySelectorAll('.bujo-bullet-item').length,
  hasTapedPhoto: Boolean(document.querySelector('.taped-photo-paper')),
  tapeCount: document.querySelectorAll('.scotch-tape').length,
  pinCount: document.querySelectorAll('.taped-overlay-pin').length,
  scrollHeight: document.documentElement.scrollHeight,
}))
console.log(JSON.stringify({ report, errors }, null, 2))

await page.screenshot({ path: '.shots/paper-results.png', fullPage: true })
await browser.close()
