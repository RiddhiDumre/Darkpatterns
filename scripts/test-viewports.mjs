import { chromium } from 'playwright'

const viewports = [
  { name: '1440-desktop', width: 1440, height: 900 },
  { name: '1024-compact-desktop', width: 1024, height: 800 },
  { name: '768-tablet', width: 768, height: 1024 },
  { name: '390-mobile', width: 390, height: 844 },
  { name: '320-narrow-mobile', width: 320, height: 600 },
]

const browser = await chromium.launch()

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  })
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(500)
  
  // Check for horizontal overflow
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const hasOverflow = scrollWidth > clientWidth

  await page.screenshot({ path: `screenshot-${vp.name}.png`, fullPage: false })
  console.log(`Viewport ${vp.name} (${vp.width}px): scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, overflow=${hasOverflow}`)
  await page.close()
}

await browser.close()
