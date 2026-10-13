# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are everyday web consumers, online shoppers, and digital privacy advocates who encounter manipulative, deceptive, or coercive user interfaces ("dark patterns") and seek immediate clarity, transparency, and validation on deceptive UX tactics.

Secondary users include designers and builders curious about ethical UX alternatives.

## Product Purpose

Dark Pattern Detector analyzes screenshots of websites and mobile applications to unmask deceptive interface designs. It translates complex manipulative tactics into plain-English explanations, assigns severity ratings, highlights exact deceptive regions visually on the image, and provides concrete, ethical redesign recommendations. Success means empowering visitors to recognize manipulation quickly and understand how ethical design should work.

## Positioning

Instant, zero-friction AI vision analysis combining visual bounding-box highlights directly mapped onto mobile/web screenshots with plain-language critiques and actionable redesign suggestions—without storing user screenshots or requiring account sign-ups.

## Operating Context

- Single-page web tool optimized for desktop and mobile browsers.
- Fast drag-and-drop or file picker screenshot upload workflow.
- Preset "Try an example" gallery for immediate instant demonstration without requiring visitors to provide their own screenshots.
- Device-framed preview showing numbered findings pinned over the uploaded visual context.

## Capabilities and Constraints

- **Capabilities**:
  - Image upload with client-side drag-and-drop and validation.
  - Gemini Vision API-powered multi-category dark pattern analysis (Urgency, Confirmshaming, Hidden Costs, Sneak into Basket, Forced Continuity, Roach Motel, etc.).
  - Bounding box overlay annotations on the analyzed screenshot.
  - Severity-tagged findings with plain-language explanations and ethical recommendations.
  - Overall manipulative score calculation.
- **Constraints**:
  - Requires Google Gemini API key configured for backend server analysis.
  - Zero server persistence of user-submitted screenshots (privacy-first).

## Brand Commitments

- **Tone & Voice**: Playful yet authoritative, clear, conversational, and direct editorial voice. Demystifies deceptive patterns without dry legal jargon.
- **Visual Identity**: Warm editorial aesthetic featuring distinct headline typography (`Archivo`) paired with candid hand-drawn annotation accents (`Caveat`).

## Evidence on Hand

- Example screenshots and gallery presets in `public/examples/`.
- Pre-packaged responsive test fixture screenshots in repository root (`screenshot-1440-desktop.png`, `screenshot-390-mobile.png`, etc.).
- Self-hosted web fonts in `public/fonts/`.

## Product Principles

1. **Clarity Over Jargon**: Name the manipulative trick plainly and explain why it harms the user in relatable terms.
2. **Visual Proof**: Ground every claim directly in visual evidence with precise screenshot annotations.
3. **Constructive Solutions**: Never just critique; always supply a concrete, ethical alternative design fix.
4. **Privacy-Preserving Utility**: Respect user confidentiality by analyzing screenshots ephemerally without data retention.
