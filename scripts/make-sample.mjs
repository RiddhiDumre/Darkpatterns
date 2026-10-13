// Renders mock-UI screenshots for the "Try an example" cards and for testing,
// so the app can be demoed without hunting for real screenshots.
import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// This sandbox has no system fonts and no root access, so libvips would render
// every glyph as tofu. When no default fontconfig exists, point FONTCONFIG_FILE
// at a private font dir seeded with DejaVu fonts found on the machine.
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const FONT_SOURCES = [
  '/opt/freestyle/python/lib/python3.12/site-packages/matplotlib/mpl-data/fonts/ttf',
  '/usr/share/fonts/truetype/dejavu',
  '/usr/share/fonts/TTF',
]

if (!process.env.FONTCONFIG_FILE && !existsSync('/etc/fonts/fonts.conf')) {
  const fontsDir = path.join(root, '.fonts')
  await mkdir(fontsDir, { recursive: true })
  for (const srcDir of FONT_SOURCES) {
    if (!existsSync(srcDir)) continue
    for (const f of await readdir(srcDir)) {
      if (f.startsWith('DejaVuSans') && f.endsWith('.ttf')) {
        await copyFile(path.join(srcDir, f), path.join(fontsDir, f))
      }
    }
    break
  }
  const confPath = path.join(fontsDir, 'fonts.conf')
  await writeFile(
    confPath,
    `<?xml version="1.0"?>\n<fontconfig>\n  <dir>${fontsDir}</dir>\n  <cachedir>${path.join(fontsDir, 'cache')}</cachedir>\n</fontconfig>\n`,
  )
  process.env.FONTCONFIG_FILE = confPath
}

const sharp = (await import('sharp')).default

const F = 'DejaVu Sans, Arial, sans-serif'
const shell = (w, h, inner) =>
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#ffffff"/>${inner}</svg>`

/* ---------- mini example cards (640 x 430) ---------- */

const sneakyConsent = shell(640, 430, `
  <rect x="110" y="70" width="420" height="290" rx="20" fill="#f5f6fa"/>
  <rect x="150" y="110" width="340" height="170" rx="16" fill="#ffffff"/>
  <text x="320" y="152" text-anchor="middle" font-family="${F}" font-size="21" font-weight="bold" fill="#171a21">Allow notifications?</text>
  <text x="320" y="184" text-anchor="middle" font-family="${F}" font-size="14" fill="#5f6674">Get the latest updates, offers</text>
  <text x="320" y="205" text-anchor="middle" font-family="${F}" font-size="14" fill="#5f6674">and more!</text>
  <rect x="178" y="228" width="120" height="36" rx="8" fill="#e9ebf1"/>
  <text x="238" y="251" text-anchor="middle" font-family="${F}" font-size="14" font-weight="bold" fill="#7b8394">Not now</text>
  <rect x="326" y="228" width="136" height="36" rx="8" fill="#2f6fed"/>
  <text x="394" y="251" text-anchor="middle" font-family="${F}" font-size="14" font-weight="bold" fill="#ffffff">Allow</text>
  <text x="320" y="330" text-anchor="middle" font-family="${F}" font-size="11" fill="#a6adba">App preview</text>
`)

const fakeUrgency = shell(640, 430, `
  <rect x="140" y="60" width="360" height="310" rx="20" fill="#fff6f6"/>
  <circle cx="222" cy="140" r="38" fill="none" stroke="#171a21" stroke-width="6"/>
  <path d="M222 114 v28 l20 12" fill="none" stroke="#171a21" stroke-width="6" stroke-linecap="round"/>
  <path d="M196 92 l-14 -14 M248 92 l14 -14" stroke="#171a21" stroke-width="5" stroke-linecap="round"/>
  <text x="440" y="118" text-anchor="middle" font-family="${F}" font-size="17" fill="#171a21">Offer ends in</text>
  <text x="440" y="172" text-anchor="middle" font-family="${F}" font-size="44" font-weight="bold" fill="#f2455c">00:02:19</text>
  <rect x="180" y="240" width="280" height="54" rx="12" fill="#f2455c"/>
  <text x="320" y="274" text-anchor="middle" font-family="${F}" font-size="19" font-weight="bold" fill="#ffffff">Buy Now</text>
  <text x="320" y="330" text-anchor="middle" font-family="${F}" font-size="11" fill="#c2a3a8">Price jumps when the timer hits zero*</text>
`)

const trickyWording = shell(640, 430, `
  <rect x="140" y="55" width="360" height="320" rx="20" fill="#f7f7f9"/>
  <text x="320" y="106" text-anchor="middle" font-family="${F}" font-size="21" font-weight="bold" fill="#171a21">Start your free trial</text>
  <g font-family="${F}" font-size="15" fill="#3d4351">
    <path d="M188 146 l8 8 l14 -16" fill="none" stroke="#2fae6a" stroke-width="4" stroke-linecap="round"/>
    <text x="222" y="152">No commitment</text>
    <path d="M188 186 l8 8 l14 -16" fill="none" stroke="#2fae6a" stroke-width="4" stroke-linecap="round"/>
    <text x="222" y="192">Cancel anytime</text>
    <path d="M188 226 l8 8 l14 -16" fill="none" stroke="#2fae6a" stroke-width="4" stroke-linecap="round"/>
    <text x="222" y="232">Full access for 7 days</text>
  </g>
  <rect x="188" y="258" width="264" height="48" rx="10" fill="#171a21"/>
  <text x="320" y="288" text-anchor="middle" font-family="${F}" font-size="17" font-weight="bold" fill="#ffffff">Continue</text>
  <text x="320" y="340" text-anchor="middle" font-family="${F}" font-size="10" fill="#a6adba">Then &#8377;999/month automatically, forever. Cancel by phone only.</text>
`)

const hiddenNudges = shell(640, 430, `
  <rect x="140" y="70" width="360" height="290" rx="20" fill="#ffffff" stroke="#e7e9ef" stroke-width="2"/>
  <g stroke="#171a21" stroke-width="5" fill="none">
    <rect x="182" y="112" width="52" height="24" rx="12"/>
    <rect x="244" y="112" width="52" height="24" rx="12"/>
    <path d="M234 118 h10"/>
  </g>
  <circle cx="204" cy="118" r="4" fill="#171a21"/>
  <circle cx="270" cy="118" r="4" fill="#171a21"/>
  <text x="330" y="132" font-family="${F}" font-size="21" font-weight="bold" fill="#171a21">Add a case?</text>
  <text x="330" y="158" font-family="${F}" font-size="13" font-weight="bold" fill="#f2455c">Most people add this</text>
  <rect x="182" y="204" width="24" height="24" rx="6" fill="#2f6fed"/>
  <path d="M188 216 l6 6 l10 -12" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <text x="222" y="222" font-family="${F}" font-size="16" fill="#3d4351">Yes, add for &#8377;299</text>
  <text x="222" y="256" font-family="${F}" font-size="13" fill="#a6adba">No thanks, I'll risk it</text>
  <rect x="182" y="284" width="276" height="46" rx="10" fill="#171a21"/>
  <text x="320" y="313" text-anchor="middle" font-family="${F}" font-size="16" font-weight="bold" fill="#ffffff">Continue</text>
`)

/* ---------- full-page samples (1280 x 900) ---------- */

const darkCheckout = `<svg width="1280" height="900" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="900" fill="#f2f4f8"/>
  <rect width="1280" height="68" fill="#ffffff"/>
  <text x="44" y="44" font-family="${F}" font-size="24" font-weight="bold" fill="#141821">ShopBright</text>
  <text x="1120" y="44" font-family="${F}" font-size="15" fill="#5b6474">Cart (3)</text>

  <rect x="44" y="100" width="740" height="560" rx="14" fill="#ffffff"/>
  <text x="76" y="146" font-family="${F}" font-size="21" font-weight="bold" fill="#141821">Wireless Noise-Cancelling Headphones</text>
  <text x="76" y="182" font-family="${F}" font-size="30" font-weight="bold" fill="#141821">$49.99</text>
  <text x="216" y="182" font-family="${F}" font-size="17" fill="#98a1b1">today only</text>

  <rect x="76" y="204" width="330" height="40" rx="8" fill="#fff1f2"/>
  <text x="92" y="231" font-family="${F}" font-size="16" font-weight="bold" fill="#e11d48">Only 2 left in stock - order soon!</text>

  <rect x="76" y="256" width="330" height="36" rx="8" fill="#fff7ed"/>
  <text x="92" y="281" font-family="${F}" font-size="15" fill="#c2410c">Sale ends in 02:14:33</text>

  <rect x="76" y="318" width="672" height="1" fill="#e6e9ef"/>
  <rect x="76" y="344" width="22" height="22" rx="5" fill="#2563eb"/>
  <path d="M81 355 l5 5 l9 -11" stroke="#ffffff" stroke-width="3" fill="none"/>
  <text x="112" y="361" font-family="${F}" font-size="16" fill="#141821">Add 2-year protection plan - $9.95/month</text>
  <text x="112" y="384" font-family="${F}" font-size="13" fill="#6b7280">Begins today and renews automatically unless cancelled.</text>

  <text x="76" y="436" font-family="${F}" font-size="13" fill="#98a1b1">Shipping &amp; handling calculated at the last step.</text>

  <rect x="76" y="470" width="430" height="74" rx="12" fill="#16a34a"/>
  <text x="291" y="515" text-anchor="middle" font-family="${F}" font-size="24" font-weight="bold" fill="#ffffff">Yes, protect my order!</text>

  <rect x="530" y="546" width="218" height="30" rx="6" fill="#eceef3"/>
  <text x="639" y="566" text-anchor="middle" font-family="${F}" font-size="12" fill="#a2a9b8">No, I enjoy risk</text>

  <text x="76" y="628" font-family="${F}" font-size="12" fill="#98a1b1">By placing your order you agree to our Terms and our auto-renewing subscription.</text>

  <rect x="812" y="100" width="424" height="380" rx="14" fill="#ffffff"/>
  <text x="844" y="146" font-family="${F}" font-size="19" font-weight="bold" fill="#141821">Order summary</text>
  <text x="844" y="190" font-family="${F}" font-size="15" fill="#5b6474">Subtotal</text>
  <text x="1196" y="190" text-anchor="end" font-family="${F}" font-size="15" fill="#141821">$49.99</text>
  <text x="844" y="222" font-family="${F}" font-size="15" fill="#5b6474">Protection plan (auto)</text>
  <text x="1196" y="222" text-anchor="end" font-family="${F}" font-size="15" fill="#141821">$9.95</text>
  <text x="844" y="254" font-family="${F}" font-size="15" fill="#5b6474">Service fee</text>
  <text x="1196" y="254" text-anchor="end" font-family="${F}" font-size="15" fill="#141821">$4.99</text>
  <rect x="844" y="278" width="352" height="1" fill="#e6e9ef"/>
  <text x="844" y="314" font-family="${F}" font-size="17" font-weight="bold" fill="#141821">Total</text>
  <text x="1196" y="314" text-anchor="end" font-family="${F}" font-size="17" font-weight="bold" fill="#141821">$64.93</text>
  <text x="844" y="352" font-family="${F}" font-size="14" fill="#2563eb">Start my 7-day free trial</text>
  <text x="844" y="376" font-family="${F}" font-size="12" fill="#98a1b1">then $19.99/month. Cancel anytime.</text>
  <text x="844" y="452" font-family="${F}" font-size="11" fill="#b3bac7">Cancel by tapping Account, then Settings, then Subscriptions.</text>

  <rect x="44" y="684" width="1192" height="172" rx="14" fill="#ffffff"/>
  <text x="76" y="730" font-family="${F}" font-size="17" font-weight="bold" fill="#141821">Complete your order</text>
  <rect x="76" y="752" width="740" height="56" rx="10" fill="#e5e7eb"/>
  <text x="446" y="787" text-anchor="middle" font-family="${F}" font-size="17" fill="#9aa2b1">Card number</text>
  <rect x="848" y="752" width="352" height="56" rx="10" fill="#4f46e5"/>
  <text x="1024" y="787" text-anchor="middle" font-family="${F}" font-size="18" font-weight="bold" fill="#ffffff">Place my order</text>
  <text x="76" y="836" font-family="${F}" font-size="11" fill="#b3bac7">Fees may be adjusted. Subscription renews at $19.99/mo unless cancelled before the trial ends.</text>
</svg>`

const cleanApp = `<svg width="1280" height="900" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="900" fill="#f6f7fb"/>
  <rect width="1280" height="68" fill="#ffffff"/>
  <text x="44" y="44" font-family="${F}" font-size="24" font-weight="bold" fill="#141821">PlainCart</text>
  <text x="1104" y="44" font-family="${F}" font-size="15" fill="#5b6474">Your cart (1)</text>

  <rect x="340" y="120" width="600" height="520" rx="16" fill="#ffffff"/>
  <text x="384" y="172" font-family="${F}" font-size="22" font-weight="bold" fill="#141821">Order summary</text>

  <text x="384" y="226" font-family="${F}" font-size="16" fill="#374151">Stainless steel water bottle</text>
  <text x="896" y="226" text-anchor="end" font-family="${F}" font-size="16" fill="#141821">$24.00</text>
  <text x="384" y="258" font-family="${F}" font-size="15" fill="#6b7280">Shipping (standard, 3-5 days)</text>
  <text x="896" y="258" text-anchor="end" font-family="${F}" font-size="15" fill="#141821">$0.00</text>
  <text x="384" y="290" font-family="${F}" font-size="15" fill="#6b7280">Estimated tax</text>
  <text x="896" y="290" text-anchor="end" font-family="${F}" font-size="15" fill="#141821">$2.40</text>
  <rect x="384" y="314" width="512" height="1" fill="#e6e9ef"/>
  <text x="384" y="352" font-family="${F}" font-size="17" font-weight="bold" fill="#141821">Total</text>
  <text x="896" y="352" text-anchor="end" font-family="${F}" font-size="17" font-weight="bold" fill="#141821">$26.40</text>

  <text x="384" y="400" font-family="${F}" font-size="14" fill="#6b7280">Optional add-on (unselected by default):</text>
  <rect x="384" y="418" width="20" height="20" rx="5" fill="#ffffff" stroke="#cbd2de" stroke-width="2"/>
  <text x="416" y="434" font-family="${F}" font-size="15" fill="#374151">Gift wrap for $2.00</text>

  <rect x="384" y="470" width="512" height="54" rx="10" fill="#2563eb"/>
  <text x="640" y="504" text-anchor="middle" font-family="${F}" font-size="17" font-weight="bold" fill="#ffffff">Pay $26.40</text>

  <text x="384" y="560" font-family="${F}" font-size="13" fill="#6b7280">One-time purchase - no subscription. You can cancel within 30 days for a full refund.</text>
  <text x="384" y="586" font-family="${F}" font-size="13" fill="#2563eb">Read the return policy</text>
</svg>`

const OUT = 'public/examples'
await mkdir(OUT, { recursive: true })

const jobs = [
  ['example-sneaky-consent.png', sneakyConsent],
  ['example-fake-urgency.png', fakeUrgency],
  ['example-tricky-wording.png', trickyWording],
  ['example-hidden-nudges.png', hiddenNudges],
  ['example-dark-checkout.png', darkCheckout],
  ['example-clean-cart.png', cleanApp],
]

for (const [name, svg] of jobs) {
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, name))
}
console.log(`wrote ${jobs.length} images to ${OUT}/`)
