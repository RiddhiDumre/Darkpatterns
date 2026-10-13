// Dev helper: screenshot the running app so design changes can be verified
// without a browser panel. Usage: node scripts/screenshot.mjs <url> <out.png>
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://127.0.0.1:3000/'
const out = process.argv[3] ?? '/tmp/shot.png'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`))

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
} catch (e) {
  errors.push(`goto: ${e instanceof Error ? e.message : String(e)}`)
}
await page.waitForTimeout(800)
await page.screenshot({ path: out, fullPage: true })
console.log(JSON.stringify({ out, errors }, null, 2))
await browser.close()
