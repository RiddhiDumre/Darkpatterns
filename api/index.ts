import { Hono } from 'hono'
import type { Analysis, BBox, Finding, Severity } from '../shared/types'

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
// Active models verified available and responsive for your key (including flash-lite high-throughput tier)
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
]
const DEFAULT_MODEL = 'gemini-3.5-flash-lite'

const PROMPT = `You are a relentless, uncompromising Senior UX Forensic Auditor and Consumer Protection Investigator. Your mission is to hold manipulative interfaces accountable under global consumer protection standards—including the Central Consumer Protection Authority (CCPA) Guidelines for Prevention and Regulation of Dark Patterns (2023), FTC Enforcement Policy Statements on Deceptive UI, and OECD behavioral design frameworks.

MISSION DIRECTIVE:
Be extremely strict, thorough, and exhaustive. Modern deceptive interfaces rarely rely on just a single trick; they orchestrate multiple overlapping micro-nudges, visual biases, and deceptive friction. DO NOT BE LENIENT. DO NOT OVERLOOK SUBTLE PATTERNS. If an element nudges, biases, rushes, shames, hides fees, pre-selects, or visually manipulates the user in ANY way, YOU MUST DETECT AND REPORT IT.

AUDIT TAXONOMY (Strictly evaluate against these 13 categories):
1. False Urgency & Manufactured Scarcity: Ticking countdown clocks, "Only X items left", "High demand alert", "In 14 carts right now", or artificial deadlines designed to prevent calm comparison.
2. Preselection & Default Biasing: Checkboxes pre-checked by default (insurance, warranties, newsletter opt-ins, auto-renewals), pre-selected tip percentages (e.g. 20% or 25% pre-highlighted), or default-selected express delivery.
3. Interface Interference & Visual Asymmetry: Extreme visual hierarchy bias where the preferred/paid action is a giant, vibrant primary button while the decline/cancel option is microscopic, borderless, low-contrast, or styled to look like non-clickable plain text.
4. Confirmshaming & Emotional Manipulation: Passive-aggressive, guilt-tripping, or derogatory decline copy designed to shame the user for saying no (e.g., "No thanks, I hate discounts", "I don't care about my safety", "I prefer paying full price").
5. Hidden Costs, Drip Pricing & Surcharges: Unavoidable delivery surge fees, handling charges, packaging fees, service charges, or payment processing fees hidden from the initial price and revealed only at final checkout.
6. Sneak into Basket & Auto-Bundling: Silently adding protection plans, donations, subscriptions, or accessory items into the cart summary without explicit affirmative opt-in.
7. Forced Continuity & Subscription Traps: Auto-renewing subscription terms buried in fine print, recurring billing without prominent disclosure, or free trials that silently convert to paid subscriptions.
8. Low-Contrast Text & Microscopic Fine Print: Terms of service, cancellation policies, recurring fee amounts, or disclaimer clauses rendered in faint grey text, microscopic font size, or low contrast to discourage reading.
9. Trick Questions & Confusing Syntax: Double negatives, ambiguous toggle switches, or confusing opt-in/opt-out phrasing where "checking" or "unchecking" has an unexpected meaning.
10. Forced Action & Roach Motel: Forcing account creation, app downloads, or personal data entry to see basic pricing or complete a simple action, or making cancellation intentionally difficult.
11. Disguised Advertisements & Camouflaged Elements: Commercial ads or affiliate links disguised as native editorial content, system notifications, or navigation tabs; camouflaged close/dismiss 'X' buttons.
12. Deceptive Social Proof & Phantom Activity: Fabricated or unverifiable testimonials, "Popular Choice" badges on the most expensive tier, or fake live purchaser tickers.
13. Privacy Zuckering & Asymmetric Consent: Cookie/tracking banners with a prominent 1-click "Accept All" button while declining requires navigating complex, multi-step nested menus.

STRICT AUDIT RULES:
- Identify EVERY distinct deceptive tactic present on the screen. Do not stop after just 1 or 2 obvious ones.
- Scrutinize BOTH semantic text copy AND visual layout hierarchy:
  * Look for 'Interface Interference': Whenever a paid or primary action button has dominant visual contrast while the secondary/decline choice is tiny, faded, or disguised as plain text.
  * Look for 'Low-Contrast Text & Microscopic Fine Print': Whenever auto-renewal terms, subscription clauses, or cancellation conditions are printed in tiny, muted, or low-contrast text.
  * Look for 'Hidden Costs' or 'Drip Pricing': Surcharges, fees, or taxes added only to the total.
  * Look for 'Preselection': Default-checked checkboxes, pre-toggled switches, or pre-highlighted tip amounts.
  * Look for 'False Urgency': Countdown timers, stock scarcity warnings, or high-demand alerts.
  * Look for 'Confirmshaming': Any negative framing on declining an offer.
- "pattern": The exact dark pattern category name from the taxonomy above.
- "severity": "high" (causes financial loss, auto-charge, or major deception), "medium" (asymmetric nudge, false urgency, or guilt trip), or "low" (subtle contrast bias or minor nudge).
- "evidence": The exact verbatim text or UI element name on screen (e.g., "Add 2-Year Extended Care Warranty (+$9.95/mo)", "Only 2 left in stock!", "Complete Order — $59.94 vs faint decline link").
- "explanation": Exactly 1 sharp, forensic sentence exposing the corporate trickery (under 25 words).
- "recommendation": Exactly 1 practical, user-respecting design remedy.
- "box_2d": MANDATORY [ymin, xmin, ymax, xmax] integers (0 to 1000 scale). Pinpoint the EXACT coordinates of the specific button, row, toggle, countdown, or text.
- "score": 0 to 100 deception score. If the interface contains preselection, false urgency, or hidden fees, the score MUST reflect high deception (75-98).
- "verdict": A punchy forensic audit headline (e.g., "5 manipulative patterns detected on this checkout").
- "summary": Exactly 1-2 witty, deadpan sentences summarizing the deceptive mechanisms found.

Return ONLY raw JSON conforming to this schema (no markdown, no backticks):
{"score": 85, "verdict": "...", "summary": "...", "findings": [{"pattern": "...", "severity": "high", "evidence": "...", "explanation": "...", "recommendation": "...", "box_2d": [ymin, xmin, ymax, xmax]}]}`

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; status: number; message: string }

async function callGeminiSingle(model: string, apiKey: string, mimeType: string, data: string): Promise<GeminiResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data } },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    })
  } catch (err) {
    return {
      ok: false,
      status: 502,
      message: `Could not reach the Gemini API (${err instanceof Error ? err.message : 'network error'}).`,
    }
  }

  if (!res.ok) {
    let detail = ''
    try {
      const j = (await res.json()) as { error?: { message?: string } }
      detail = j.error?.message ?? ''
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 401 || res.status === 403 || /api key/i.test(detail)) {
      return { ok: false, status: 401, message: 'The configured GOOGLE_API_KEY was rejected. Check the key in your .env file.' }
    }
    if (res.status === 429) {
      return { ok: false, status: 429, message: detail || 'Gemini API is currently experiencing high demand. Please try again in a few moments.' }
    }
    if (res.status === 404) {
      return { ok: false, status: 502, message: `Model "${model}" is not available for this key.` }
    }
    return { ok: false, status: 502, message: detail ? `Gemini API error: ${detail}` : `Gemini API error (HTTP ${res.status}).` }
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
    promptFeedback?: { blockReason?: string }
  }
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  if (!text.trim()) {
    const block = json.promptFeedback?.blockReason
    return {
      ok: false,
      status: 502,
      message: block ? `The model blocked the request (${block}).` : 'The model returned an empty response.',
    }
  }
  return { ok: true, text }
}

async function callGemini(apiKey: string, mimeType: string, data: string): Promise<GeminiResult> {
  const primaryModel = getModel()
  const candidateModels = Array.from(new Set([primaryModel, ...FALLBACK_MODELS]))

  let lastError: GeminiResult = { ok: false, status: 502, message: 'Gemini request failed' }

  for (const model of candidateModels) {
    const result = await callGeminiSingle(model, apiKey, mimeType, data)
    if (result.ok) {
      return result
    }
    lastError = result
    // If it's auth failure, don't retry with other models
    if (result.status === 401) {
      return result
    }
    // High demand (429 / 503) or not found (404) -> attempt next fallback model
    console.warn(`[api] Model ${model} returned status ${result.status} (${result.message}), trying fallback...`)
  }

  return lastError
}

function parseModelJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    /* fall through: try to extract an embedded object */
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch {
      return undefined
    }
  }
  return undefined
}

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

function sanitizeBBox(v: unknown): BBox | null {
  if (!v) return null

  // Case 1: Array format [ymin, xmin, ymax, xmax] or [x, y, w, h]
  if (Array.isArray(v) && v.length === 4 && v.every(Number.isFinite)) {
    const nums = v.map(Number)
    const maxVal = Math.max(...nums)
    const [ymin, xmin, ymax, xmax] = nums
    let x: number, y: number, w: number, h: number
    if (maxVal > 100) {
      // 0..1000 scale
      x = xmin / 10
      y = ymin / 10
      w = (xmax - xmin) / 10
      h = (ymax - ymin) / 10
    } else if (maxVal <= 1) {
      // 0..1 scale
      x = xmin * 100
      y = ymin * 100
      w = (xmax - xmin) * 100
      h = (ymax - ymin) * 100
    } else {
      // 0..100 scale
      x = xmin
      y = ymin
      w = xmax - xmin
      h = ymax - ymin
    }
    const cx = clamp(x, 0, 95)
    const cy = clamp(y, 0, 95)
    const cw = clamp(Math.max(w, 5), 2, 100 - cx)
    const ch = clamp(Math.max(h, 4), 2, 100 - cy)
    return { x: round1(cx), y: round1(cy), w: round1(cw), h: round1(ch) }
  }

  const r = asRecord(v)
  if (!r) return null

  // Case 2: Nested box_2d
  if (Array.isArray(r.box_2d) && r.box_2d.length === 4) {
    return sanitizeBBox(r.box_2d)
  }

  // Case 3: Object with {x, y, w, h} or {left, top, width, height} or {xmin, ymin, xmax, ymax}
  let x = Number(r.x ?? r.left ?? r.xmin)
  let y = Number(r.y ?? r.top ?? r.ymin)
  let w = Number(r.w ?? r.width ?? (Number(r.xmax) - Number(r.xmin)))
  let h = Number(r.h ?? r.height ?? (Number(r.ymax) - Number(r.ymin)))

  if (![x, y, w, h].every(Number.isFinite)) return null

  // Check scale: 0..1 normalized vs 0..1000 vs 0..100
  if (x <= 1 && y <= 1 && w <= 1 && h <= 1 && (x > 0 || y > 0 || w > 0 || h > 0)) {
    x *= 100
    y *= 100
    w *= 100
    h *= 100
  } else if (Math.max(x, y, w, h) > 100) {
    x /= 10
    y /= 10
    w /= 10
    h /= 10
  }

  const cx = clamp(x, 0, 95)
  const cy = clamp(y, 0, 95)
  const cw = clamp(Math.max(w, 5), 2, 100 - cx)
  const ch = clamp(Math.max(h, 4), 2, 100 - cy)

  return { x: round1(cx), y: round1(cy), w: round1(cw), h: round1(ch) }
}

const round1 = (n: number): number => Math.round(n * 10) / 10

function sanitizeSeverity(v: unknown): Severity {
  const s = str(v).toLowerCase()
  return s === 'high' || s === 'medium' || s === 'low' ? s : 'medium'
}

function sanitizeFinding(v: unknown, index: number, total = 3): Finding {
  const r = asRecord(v) ?? {}
  const rawBbox = sanitizeBBox(r.box_2d ?? r.bbox ?? r.boundingBox)
  // Fallback bbox if model failed to supply coordinates
  const step = Math.min(65 / Math.max(total, 1), 18)
  const defaultY = Math.min(22 + index * step, 82)
  const bbox = rawBbox ?? { x: 20, y: round1(defaultY), w: 60, h: 7 }

  return {
    id: `f${index + 1}`,
    pattern: str(r.pattern, 'Deceptive UI'),
    severity: sanitizeSeverity(r.severity),
    evidence: str(r.evidence),
    explanation: str(r.explanation),
    recommendation: str(r.recommendation, 'Use clear, upfront presentation.'),
    guideline: str(r.guideline) || undefined,
    translation: str(r.translation) || undefined,
    bbox,
  }
}

function deriveScore(findings: Finding[]): number {
  const weight: Record<Severity, number> = { high: 32, medium: 18, low: 8 }
  return clamp(findings.reduce((sum, f) => sum + weight[f.severity], 0), 0, 100)
}

function sanitizeAnalysis(raw: unknown): Analysis {
  const r = asRecord(raw) ?? {}
  const list = Array.isArray(r.findings) ? r.findings : []
  const findings = list.slice(0, 8).map((f, i) => sanitizeFinding(f, i, list.length))
  const scoreRaw = Number(r.score)
  const score = Number.isFinite(scoreRaw) ? Math.round(clamp(scoreRaw, 0, 100)) : deriveScore(findings)
  const verdict = str(r.verdict) || undefined
  const summary =
    str(r.summary) ||
    (findings.length
      ? `Audit flagged ${findings.length} psychological stunt${findings.length === 1 ? '' : 's'} designed to nudge, shame, or trick you into compliance.`
      : 'Suspiciously wholesome. No manipulative urgency, guilt-tripping, or hidden fees found. Either they respect you, or their growth hacker called in sick.')
  return { score, verdict, summary, findings }
}

const app = new Hono()

const healthHandler = (c: any) =>
  c.json({
    ok: true,
    configured: Boolean(process.env.GOOGLE_API_KEY?.trim()),
    model: getModel(),
  })

const analyzeHandler = async (c: any) => {
  const apiKey = process.env.GOOGLE_API_KEY?.trim()
  if (!apiKey) {
    return jsonError(
      503,
      'missing_api_key',
      'The server has no GOOGLE_API_KEY configured. Set GOOGLE_API_KEY in your environment variables.',
    )
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return jsonError(400, 'bad_request', 'Expected a JSON body like {"image": "data:image/png;base64,..."}.')
  }

  const image = asRecord(body)?.image
  if (typeof image !== 'string') {
    return jsonError(400, 'bad_request', 'Missing "image": send the screenshot as a base64 data URL.')
  }

  const match = /^data:([a-zA-Z0-9/+.-]+);base64,([A-Za-z0-9+/=]+)$/.exec(image)
  if (!match) {
    return jsonError(400, 'bad_request', 'Malformed image data URL.')
  }
  const mimeType = match[1].toLowerCase()
  const data = match[2]
  if (!ALLOWED_MIME.has(mimeType)) {
    return jsonError(400, 'unsupported_type', 'Unsupported image type. Use PNG, JPEG, WebP or GIF.')
  }
  const approxBytes = Math.floor((data.length * 3) / 4)
  if (approxBytes > MAX_IMAGE_BYTES) {
    return jsonError(413, 'too_large', 'That screenshot is over 8 MB. Please upload a smaller image.')
  }

  const result = await callGemini(apiKey, mimeType, data)
  if (!result.ok) {
    return jsonError(result.status, result.status === 429 ? 'rate_limited' : 'upstream_error', result.message)
  }

  const raw = parseModelJson(result.text)
  if (raw === undefined) {
    return jsonError(502, 'bad_upstream_response', 'Could not parse the model response as JSON.')
  }

  return c.json(sanitizeAnalysis(raw))
}

app.get('/api', (c) => c.json({ ok: true, name: 'Dark Pattern Detector API' }))
app.get('/api/health', healthHandler)
app.get('/health', healthHandler)
app.post('/api/analyze', analyzeHandler)
app.post('/analyze', analyzeHandler)

app.onError((err, _c) => {
  console.error('[api] unhandled error:', err)
  return jsonError(500, 'internal_error', 'Unexpected server error. Check the API logs.')
})

app.notFound(() => jsonError(404, 'not_found', 'Unknown API route.'))

export default app
