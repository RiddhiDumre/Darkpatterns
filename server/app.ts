import { Hono } from 'hono'
import type { Analysis, BBox, Finding, Severity } from '../shared/types'

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const DEFAULT_MODEL = 'gemini-3.8-flash'

const PROMPT = `You are a razor-sharp UX forensic auditor with dry humor, deadpan sarcasm, and zero patience for manipulative interface design (dark patterns). You audit screens referencing standards like the Central Consumer Protection Authority (CCPA) Guidelines for Prevention and Regulation of Dark Patterns (2023) and OECD taxonomies, but you deliver your findings like a witty, cynical senior designer calling out corporate absurdity.

Tone & Style:
- Deadpan sarcasm, witty reality checks, and sharp dry humor.
- Highlight the important points: expose the exact sleight of hand (what they pretend they're doing vs the shameless trap they actually set).
- Keep it smart and devastatingly accurate—pair the dry humor with precise forensic identification.

Taxonomy (reference CCPA 2023 & global benchmarks):
- Confirmshaming: Guilt-tripping or emotionally manipulating the user into opting in or paying (e.g., "No thanks, I prefer paying full price", "I hate saving money").
- Interface Interference: Visual asymmetry designed to manipulate choice (e.g. neon primary button paired with a microscopic, low-contrast dismiss link designed to be invisible).
- False Urgency: Fabricating artificial scarcity or countdown pressure ("Only 2 left at this price!", resetting fake timers).
- Sneak into Basket: Adding items, subscriptions, or fees to the order without explicit opt-in.
- Hidden Costs: Unavoidable fees revealed only at final checkout.
- Forced Continuity: Trapping users in recurring renewals with labyrinthine cancellation pathways.
- Preselection: Default-checked checkboxes for marketing consent or auto-renewals.
- Trick Questions: Misleading double-negatives or confusing syntax to engineer accidental consent.
- Bait and Switch: Advertising one deal and quietly switching terms or products.
- Disguised Advertisements: Ads styled to masquerade as native buttons or OS notifications.

Rules:
- Report up to 6 findings, sorted by severity (high, medium, low).
- "evidence": Exact text or visual description of the offending element.
- "explanation": 1-2 punchy sentences with dry, sarcastic wit exposing what the design is trying to pull off. Use **double asterisks** around the 1-2 most critical words or phrases exposing the deceptive trick (e.g., "The opt-out is framed as an **embarrassing personal flaw**, while the accept button gets the **red-carpet treatment**.").
- "translation": A brutally honest, funny, sarcastic 1-sentence reality check translating what the company is *really* saying (e.g. "Translation: Agree to this right now or confess to being an irresponsible shopper.").
- "recommendation": A crisp, sensible redesign recommendation with a subtle witty remark (e.g. "Use neutral text like 'Continue without discount' and let people leave with their dignity intact.").
- "guideline": The specific CCPA 2023 / FTC guideline category (e.g., "CCPA 2023 Guideline 5(c): Confirmshaming", "CCPA 2023 Guideline 5(f): Interface Interference").
- "bbox": Precise coordinates of the offending element as percentages (0-100): {"x": number, "y": number, "w": number, "h": number}. Locate the exact offending button, link, or label.
- "score": 0-100 indicating overall deception severity (higher = more shamelessly deceptive).
- "verdict": A snappy, sarcastic forensic verdict headline (e.g. "2 manipulative tricks spotted — this popup is actively guilt-tripping you into coughing up cash").
- "summary": A witty, deadpan 1-2 sentence overview roasting the psychological warfare taking place on screen.

Return ONLY raw JSON (no markdown):
{"score": 75, "verdict": "...", "summary": "...", "findings": [{"pattern": "Confirmshaming", "severity": "high", "evidence": "No thanks, I prefer paying full price", "explanation": "The opt-out is framed as an **embarrassing personal flaw**, while the accept button gets the **red-carpet treatment**.", "translation": "Agree to this now or admit you hate saving money.", "recommendation": "Use neutral text like 'Continue without discount' and skip the psychological guilt trip.", "guideline": "CCPA 2023 Guideline 5(c): Confirmshaming", "bbox": {"x": 20, "y": 65, "w": 60, "h": 8}}]}`

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
    guideline: str(r.guideline) || undefined,
    translation: str(r.translation) || undefined,
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
  const verdict = str(r.verdict) || undefined
  const summary =
    str(r.summary) ||
    (findings.length
      ? `Audit flagged ${findings.length} psychological stunt${findings.length === 1 ? '' : 's'} designed to nudge, shame, or trick you into compliance.`
      : 'Suspiciously wholesome. No manipulative urgency, guilt-tripping, or hidden fees found. Either they respect you, or their growth hacker called in sick.')
  return { score, verdict, summary, findings }
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
