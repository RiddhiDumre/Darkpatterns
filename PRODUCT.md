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

- Single-page web experience with dual visual states: light editorial normal view and deep charcoal/obsidian investigation view.
- Recurring full black sunglasses zoom transition connecting initial page load and analysis completion into the investigation view.
- Hero composition featuring:
  - Left column: spacious, direct upload drop canvas supporting drag-and-drop, `<kbd>⌘V</kbd> / <kbd>Ctrl+V</kbd>` clipboard paste, public image URL scanner, and curated sample specimens.
  - Right column: Three.js procedural 3D iPhone model in Space Black titanium, floating peacefully in ambient space with an edge-to-edge mobile checkout screen.
- Floating handwritten scribble notes (`Caveat`) with large prominent index numbers (`1`, `2`, `3`, `4`), pattern titles, and concise explanations positioned strictly in the outer margins to leave the interface 100% visible, paired with curved ink arrows pointing directly to the side of suspicious elements.

## Capabilities and Constraints

- **Capabilities**:
  - Image upload with client-side drag-and-drop, direct file browsing, clipboard paste, and URL import.
  - Full black sunglasses entrance and analysis transition with camera zoom into the dark investigation view.
  - Procedural 3D iPhone in Three.js with normalized screen UV mapping and continuous ambient floating motion.
  - Gemini Vision API-powered multi-category dark pattern analysis (Urgency, Preselection, Confirmshaming, Hidden Costs, Sneak into Basket, Forced Continuity, etc.).
  - Side-anchored SVG ink arrows and handwritten notes that never obscure screen elements.
  - Severity-tagged findings with plain-language reality-check translations and ethical recommendations.
  - Toggle between normal view and investigation view anytime.
- **Constraints**:
  - Requires Google Gemini API key configured for backend server analysis.
  - Zero server persistence of user-submitted screenshots (privacy-first ephemeral processing).
  - 3D phone model is non-interactive to pointer drags and touch gestures to allow unobstructed native scrolling.

## Brand Commitments

- **Tone & Voice**: Playful yet authoritative, clear, conversational, and direct editorial voice. Demystifies deceptive patterns without dry legal jargon.
- **Visual Identity**: Warm editorial aesthetic featuring distinct headline typography (`Archivo`), full black polarized sunglasses transition motif, and candid handwritten forensic scribble annotations (`Caveat`).

## Evidence on Hand

- Example screenshots and gallery presets in `public/` (`mobile-checkout-specimen.png`, etc.).
- Pre-packaged responsive test fixture screenshots in repository root (`screenshot-1440-desktop.png`, `screenshot-390-mobile.png`, etc.).
- Self-hosted web fonts in `public/fonts/`.

## Product Principles

1. **Clarity Over Jargon**: Name the manipulative trick plainly and explain why it harms the user in relatable terms.
2. **Visual Proof Without Obstruction**: Ground every claim directly in visual evidence with arrows pointing to the side, leaving interface design fully visible.
3. **Constructive Solutions**: Never just critique; always supply a concrete, ethical alternative design fix.
4. **Privacy-Preserving Utility**: Respect user confidentiality by analyzing screenshots ephemerally without data retention.
