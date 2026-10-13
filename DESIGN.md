---
name: Dark Pattern Detector
description: Clean category standard modern SaaS utility for detecting and analyzing deceptive interface patterns.
colors:
  bg: "#f8fafc"
  surface: "#ffffff"
  surface-raised: "#f1f5f9"
  surface-subtle: "#f8fafc"
  ink: "#0f172a"
  ink-secondary: "#475569"
  ink-muted: "#64748b"
  ink-faint: "#94a3b8"
  line: "#e2e8f0"
  line-strong: "#cbd5e1"
  coral: "#ff1e56"
  coral-soft: "#ffe4eb"
  coral-tint: "#fff1f4"
  coral-ink: "#b80d39"
  amber: "#f59e0b"
  amber-soft: "#fef3c7"
  amber-ink: "#b45309"
  emerald: "#10b981"
  emerald-soft: "#d1fae5"
  emerald-ink: "#047857"
  blue: "#2563eb"
  blue-soft: "#dbeafe"
  blue-ink: "#1d4ed8"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  h1:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.15
  h2:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  subtext:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
  tag:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
  micro:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.3
  nano:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 800
    lineHeight: 1.2
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  none: "0px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
---

# Design System

<!-- impeccable:design-schema 1 -->

## Overview
A modern, crisp SaaS category standard interface for consumer protection and ethical interface inspection. Clean neutral surfaces (`#ffffff`, `#f8fafc`) pair with precision hairline borders (`#e2e8f0`), high-contrast ink typography, and standardized signal badges (coral for deceptive patterns, amber for questionable nudges, emerald for ethical fixes).

## Colors
- **Canvas / Background**: Clean slate tint (`#f8fafc`), pure card surface (`#ffffff`), subtle inset wells (`#f1f5f9`), hairline dividers (`#e2e8f0`), strong active borders (`#cbd5e1`).
- **Typography Inks**: Primary slate ink (`#0f172a`), secondary narrative text (`#475569`), muted tags and counts (`#64748b`), faint indicators (`#94a3b8`).
- **Signal Accents**:
  - High Deception / Violation: Vibrant Coral (`#ff1e56` / `#ffe4eb` / `#b80d39`).
  - Questionable / Nudge: Warning Amber (`#f59e0b` / `#fef3c7` / `#b45309`).
  - Remedy / Ethical Alternative: Clean Emerald (`#10b981` / `#d1fae5` / `#047857`).
  - System / Interactive: Focus Blue (`#2563eb` / `#dbeafe` / `#1d4ed8`).

## Typography
- **Headlines & Display**: Punchy `Archivo` (weight 800) with tight negative tracking (`-0.03em`).
- **Body & Captions**: Clean, legible `Archivo` for descriptions, metadata pills, and ethical recommendations.

## Layout & Viewport Contract
- Desktop experience is locked strictly to 100vh (`height: 100vh; overflow: hidden;`) with zero window scrolling.
- Results view replaces the upload launchpad upon analysis completion.
- Scrollable findings list is isolated to the findings pane (`overflow-y: auto`), allowing deep inspection without disturbing the layout.
