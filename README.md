# Dark Pattern Detector

Upload a screenshot of any app or website and get manipulative UX ("dark patterns")
flagged with plain-English explanations, severity ratings, highlighted regions on the
screenshot and a concrete suggested fix for each flag.

Playful editorial UI: hero + doodles, drag-and-drop upload, a "Try an example" gallery,
and a phone-framed results view with numbered findings.

Analysis runs through Google's Gemini vision model.

## What it flags

Urgency · Confirmshaming · Interface interference · Hidden costs · Forced continuity ·
Preselection · Trick questions · Roach motel · Privacy zuckering · Sneak into basket ·
Disguised ads · Bait and switch · Nagging · Hard to cancel

## Setup

```bash
npm install
cp .env.example .env   # then add your GOOGLE_API_KEY
npm run dev            # web on http://localhost:3000, API on :3001
```

Get a free API key at https://aistudio.google.com/apikey

## Scripts

| Script                    | What it does                                          |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Vite frontend + Hono API (watch mode)                 |
| `npm run build`           | Typecheck and build the frontend                      |
| `npm run typecheck`       | `tsc --noEmit` over app, server and shared types      |
| `npm run sample`          | Regenerate the gallery images in `public/examples/`   |
| `node scripts/screenshot.mjs <url> <out.png>`   | Screenshot the running app (Playwright) |
| `node scripts/screenshot-results.mjs`           | Screenshot the results view with a mocked API |

Fonts (Archivo + Caveat) are self-hosted in `public/fonts/` — no external CDN needed.

## API

`POST /api/analyze` with `{"image": "data:image/png;base64,..."}` returns:

```json
{
  "score": 72,
  "summary": "One sentence overview.",
  "findings": [
    {
      "id": "f1",
      "pattern": "Confirmshaming",
      "severity": "high",
      "evidence": "No, I enjoy risk",
      "explanation": "...",
      "recommendation": "...",
      "bbox": { "x": 41.4, "y": 60.7, "w": 17, "h": 3.3 }
    }
  ]
}
```

`GET /api/health` reports whether an API key is configured.

`bbox` values are percentages of the image (origin top-left) and are used to draw the
numbered annotation boxes inside the phone frame. Screenshots are never stored; they are
sent straight to the Gemini API for analysis.
