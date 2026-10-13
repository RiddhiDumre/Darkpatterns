import { Hono } from 'hono'
import type { Analysis, BBox, Finding, Severity } from '../shared/types'

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const DEFAULT_MODEL = 'gemini-3.8-flash'

const PROMPT = `You are a UX auditor who specialises in dark patterns: manipulative interface tricks that coerce, trick or nudge users against their own interests.

Audit the attached UI screenshot and return a JSON report.

Taxonomy - use these pattern names when they apply:
- Urgency: fake scarcity or countdown pressure ("only 2 left", "sale ends in")
- Confirmshaming: guilt-tripped opt-out ("No, I hate saving money")
- Interface interference: styling that steers the choice (one button far brighter than its alternative, cancel link low-contrast)
- Hidden costs: fees revealed late (handling fee, service charge)
- Forced continuity: sneaky auto-renewal or trial-to-paid traps
- Preselection: consent, donations or paid extras ticked by default
- Trick questions: confusing wording engineered to produce accidental consent
- Roach motel: easy to get in, hard to get out (buried cancel flow)
- Privacy zuckering: misleading consent for data collection
- Sneak into basket: items added without clear consent
- Disguised ads: advertising styled as content or system UI
- Bait and switch: the promoted option is unavailable and a pricier substitute is pushed
- Nagging: repeated asking after the user declined
- Hard to cancel: cancellation or unsubscribe deliberately difficult

Rules:
- Report at most 8 findings, most severe first. Severity must be exactly "high", "medium" or "low".
- Only manipulative or deceptive UX counts. Ignore plain style or accessibility issues.
- If the screenshot has no dark patterns, return a "score" between 0 and 10 and an empty "findings" array.
- "evidence": quote the exact visible wording, or describe the element when it has no text.
- "explanation": 1-2 sentences in plain English explaining how it manipulates the user.
- "recommendation": one concrete fix a designer could apply.
- "bbox": locate the flagged element as percentages of the image, origin top-left: x, y, w, h each in 0-100 with x+w <= 100 and y+h <= 100. Use null only when the element genuinely cannot be located.
- "score": 0-100 for the overall severity of manipulation in this screenshot.
- "summary": one sentence overview of what was found.

Return ONLY raw JSON (no markdown fences), exactly this shape:
{"score": 0, "summary": "", "findings": [{"pattern": "", "severity": "high", "evidence": "", "explanation": "", "recommendation": "", "bbox": {"x": 0, "y": 0, "w": 0, "h": 0}}]}`

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

async function callGemini(apiKey: string, mimeType: string, data: string): Promise<GeminiResult> {
  const model = getModel()
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
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
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
      return { ok: false, status: 429, message: 'Rate limit reached at the Gemini API. Wait a minute and try again.' }
    }
    if (res.status === 404) {
      return { ok: false, status: 502, message: `Model "${model}" is not available for this key. Set GEMINI_MODEL to a vision-capable Gemini model.` }
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
  const r = asRecord(v)
  if (!r) return null
  const x = Number(r.x)
  const y = Number(r.y)
  const w = Number(r.w)
  const h = Number(r.h)
  if (![x, y, w, h].every(Number.isFinite)) return null
  const cx = clamp(x, 0, 100)
  const cy = clamp(y, 0, 100)
  const cw = clamp(w, 0, 100 - cx)
  const ch = clamp(h, 0, 100 - cy)
  if (cw < 1 || ch < 1) return null
  return { x: round1(cx), y: round1(cy), w: round1(cw), h: round1(ch) }
}

const round1 = (n: number): number => Math.round(n * 10) / 10

function sanitizeSeverity(v: unknown): Severity {
  const s = str(v).toLowerCase()
  return s === 'high' || s === 'medium' || s === 'low' ? s : 'medium'
}

function sanitizeFinding(v: unknown, index: number): Finding {
  const r = asRecord(v) ?? {}
  return {
    id: `f${index + 1}`,
    pattern: str(r.pattern, 'Unnamed pattern'),
    severity: sanitizeSeverity(r.severity),
    evidence: str(r.evidence),
    explanation: str(r.explanation),
    recommendation: str(r.recommendation),
    bbox: sanitizeBBox(r.bbox),
  }
}

function deriveScore(findings: Finding[]): number {
  const weight: Record<Severity, number> = { high: 32, medium: 18, low: 8 }
  return clamp(findings.reduce((sum, f) => sum + weight[f.severity], 0), 0, 100)
}

function sanitizeAnalysis(raw: unknown): Analysis {
  const r = asRecord(raw) ?? {}
  const list = Array.isArray(r.findings) ? r.findings : []
  const findings = list.slice(0, 8).map((f, i) => sanitizeFinding(f, i))
  const scoreRaw = Number(r.score)
  const score = Number.isFinite(scoreRaw) ? Math.round(clamp(scoreRaw, 0, 100)) : deriveScore(findings)
  const summary =
    str(r.summary) ||
    (findings.length
      ? `${findings.length} manipulative pattern${findings.length === 1 ? '' : 's'} detected in this screenshot.`
      : 'No obvious dark patterns detected in this screenshot.')
  return { score, summary, findings }
}

const app = new Hono()

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    configured: Boolean(process.env.GOOGLE_API_KEY?.trim()),
    model: getModel(),
  }),
)

app.post('/api/analyze', async (c) => {
  const apiKey = process.env.GOOGLE_API_KEY?.trim()
  if (!apiKey) {
    return jsonError(
      503,
      'missing_api_key',
      'The server has no GOOGLE_API_KEY configured. Copy .env.example to .env, add a key from https://aistudio.google.com/apikey and restart the dev server.',
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
})

app.onError((err, _c) => {
  console.error('[api] unhandled error:', err)
  return jsonError(500, 'internal_error', 'Unexpected server error. Check the API logs.')
})

app.notFound(() => jsonError(404, 'not_found', 'Unknown API route.'))

export default app
