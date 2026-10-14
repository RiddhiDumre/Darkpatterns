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
        'Framing opting out as an embarrassing personal flaw to guilt-trip users into saying yes.',
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

// Mock API with intentional 1800ms delay to verify all loading animation phases
await page.route('**/api/analyze', async (r) => {
  await new Promise((res) => setTimeout(res, 1800))
  r.fulfill({ json: FIXTURE })
})

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(500)

// 1. Verify Homepage is preserved
const titleText = await page.locator('.marker-title').textContent()
const hasTransparentImg = await page.locator('.paper-drawn-image').count()
console.log('Homepage Check:', { titleText: titleText?.trim(), hasTransparentImg })
await page.screenshot({ path: '.shots/loader-01-homepage.png', fullPage: false })

// 2. Upload file to trigger loading state
const imgBuffer = fs.readFileSync('public/examples/example-tricky-wording.png')
const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles({
  name: 'example-tricky-wording.png',
  mimeType: 'image/png',
  buffer: imgBuffer,
})

// 3. Capture Phase 1: Approach (within 200ms)
await page.waitForTimeout(200)
const hasLoader = await page.locator('.sunglasses-loader-container').count()
console.log('Loader active:', hasLoader > 0)
await page.screenshot({ path: '.shots/loader-02-approach.png', fullPage: false })

// 4. Capture Phase 2: Lens zoom (around 650ms)
await page.waitForTimeout(450)
await page.screenshot({ path: '.shots/loader-03-lens-zoom.png', fullPage: false })

// 5. Capture Phase 3: Restrained waiting state with telemetry card (around 1200ms)
await page.waitForTimeout(550)
const stepText = await page.locator('.telemetry-sub').textContent()
console.log('Telemetry step:', stepText?.trim())
await page.screenshot({ path: '.shots/loader-04-waiting-state.png', fullPage: false })

// 6. Wait for results to appear after analysis completes
await page.locator('.bujo-page-viewport').waitFor({ state: 'visible', timeout: 10000 })
await page.waitForTimeout(400)

const resultsTitle = await page.locator('.bujo-section-title').textContent()
const bulletCount = await page.locator('.bujo-bullet-item').count()
const hasTapedPhoto = await page.locator('.taped-photo-paper').count()
console.log('Results Check:', { resultsTitle: resultsTitle?.trim(), bulletCount, hasTapedPhoto })
await page.screenshot({ path: '.shots/loader-05-results.png', fullPage: false })

console.log('Errors:', errors)
await browser.close()
