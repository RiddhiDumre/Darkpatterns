import { chromium } from 'playwright'
import fs from 'node:fs'

const FIXTURE = {
  score: 85,
  verdict: '2 deceptive tactics caught in action',
  summary:
    'The checkout uses confirmshaming copy and oversized buttons to manipulate choice.',
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

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

  // Setup API route with intentional delay for upload flow
  await page.route('**/api/analyze', async (r) => {
    await new Promise((res) => setTimeout(res, 1400))
    r.fulfill({ json: FIXTURE })
  })

  console.log('1. Navigating to website...')
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' })

  // 1. Initial Load: Sunglasses rocking
  await page.waitForTimeout(100)
  const initialOverlay = await page.locator('.sunglasses-transition-overlay').count()
  console.log('Initial transition active:', initialOverlay > 0)
  await page.screenshot({ path: '.shots/reveal-01-initial-rocking.png', fullPage: false })

  // 2. Initial Load: Lens Zoom
  await page.waitForTimeout(450)
  await page.screenshot({ path: '.shots/reveal-02-initial-zoom.png', fullPage: false })

  // 3. First Reveal: Dark investigation homepage with featured screenshot & findings
  await page.locator('.sunglasses-transition-overlay').waitFor({ state: 'detached', timeout: 5000 })
  await page.waitForTimeout(400)

  const isDarkMode = await page.evaluate(() => document.body.classList.contains('theme-dark'))
  const pinCount = await page.locator('.taped-overlay-pin').count()
  const bulletCount = await page.locator('.bujo-bullet-item').count()
  const hasDropzone = await page.locator('.editorial-dropzone').count()
  console.log('First Reveal (Dark Investigation Homepage):', {
    isDarkMode,
    pinCount,
    bulletCount,
    hasDropzone,
  })
  await page.screenshot({ path: '.shots/reveal-03-dark-homepage.png', fullPage: false })

  // Check screenshot threshold
  const imgBox = await page.locator('.taped-native-img').boundingBox()
  console.log('Screenshot rendered dimensions:', { width: imgBox?.width, height: imgBox?.height })

  // 4. Test View Mode Toggle (Normal View: Light mode, no annotations)
  const toggleBtn = page.locator('.paper-shades-toggle')
  await toggleBtn.click()
  await page.waitForTimeout(300)

  const isNormalMode = await page.evaluate(() => !document.body.classList.contains('theme-dark'))
  const pinsVisibleInNormal = await page.locator('.taped-overlay-pin').count()
  console.log('Normal View Check:', { isNormalMode, pinsVisibleInNormal })
  await page.screenshot({ path: '.shots/reveal-04-normal-mode.png', fullPage: false })

  // Switch back to Investigation Mode
  await toggleBtn.click()
  await page.waitForTimeout(300)

  // 5. Test Upload a new screenshot
  console.log('Testing upload flow...')
  const imgBuffer = fs.readFileSync('public/examples/example-tricky-wording.png')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'example-tricky-wording.png',
    mimeType: 'image/png',
    buffer: imgBuffer,
  })

  // Check upload transition active
  await page.waitForTimeout(200)
  const uploadOverlay = await page.locator('.sunglasses-transition-overlay.mode-analysis').count()
  console.log('Upload transition active:', uploadOverlay > 0)
  await page.screenshot({ path: '.shots/reveal-05-upload-analyzing.png', fullPage: false })

  // Wait for upload reveal transition to finish
  await page.locator('.sunglasses-transition-overlay').waitFor({ state: 'detached', timeout: 8000 })
  await page.waitForTimeout(400)

  const newPinCount = await page.locator('.taped-overlay-pin').count()
  const newBulletCount = await page.locator('.bujo-bullet-item').count()
  const resetBtnCount = await page.locator('.bujo-secondary-btn').count()
  console.log('Upload Reveal Check:', { newPinCount, newBulletCount, resetBtnCount })
  await page.screenshot({ path: '.shots/reveal-06-uploaded-revealed.png', fullPage: false })

  // 6. Test scrolling down
  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(200)
  const scrollY = await page.evaluate(() => window.scrollY)
  console.log('Page scrolled to Y:', scrollY)
  await page.screenshot({ path: '.shots/reveal-07-page-scrolled.png', fullPage: false })

  // 7. Test Mobile Viewport
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: '.shots/reveal-08-mobile.png', fullPage: false })

  console.log('Errors:', errors)
  await browser.close()
  console.log('Done!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
