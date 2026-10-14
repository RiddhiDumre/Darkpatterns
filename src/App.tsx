import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { FindingsPanel } from './components/FindingsPanel'
import { ScreenshotView } from './components/ScreenshotView'

type Status = 'idle' | 'analyzing' | 'done' | 'error'

const ANALYSIS_STEPS = [
  { label: 'Inspecting visual hierarchy', detail: 'Locating micro-links, low-contrast dismissals, and asymmetric button styling.' },
  { label: 'Auditing psychological pressure', detail: 'Checking for fabricated countdowns, fake scarcity, and urgent claims.' },
  { label: 'Translating emotional guilt-trips', detail: 'Detecting confirmshaming copy that frames declining as a personal failure.' },
  { label: 'Cataloging deceptive evidence', detail: 'Pinpointing coordinates and citing regulatory guidelines.' },
]

export default function App() {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (status !== 'analyzing') return
    setStepIndex(0)
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [status])

  const runAnalysis = async (target: string) => {
    setStatus('analyzing')
    setError(null)
    setActiveId(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: target }),
      })
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const msg =
          (payload as { error?: { message?: string } } | null)?.error?.message ??
          `Analysis failed (HTTP ${res.status}).`
        throw new Error(msg)
      }
      setAnalysis(payload as Analysis)
      setShowOverlay(true)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
      setStatus('error')
    }
  }

  const onImage = (url: string, file: File) => {
    setDataUrl(url)
    setFileName(file.name)
    setAnalysis(null)
    setError(null)
    setActiveId(null)
    void runAnalysis(url)
  }

  const resetAll = () => {
    setDataUrl(null)
    setFileName(null)
    setAnalysis(null)
    setError(null)
    setStatus('idle')
    setActiveId(null)
  }

  const findingCount = analysis?.findings.length ?? 0
  const hasFindings = findingCount > 0

  return (
    <div className="editorial-app-root">
      {/* 1. Minimal Editorial Header */}
      <header className="editorial-header">
        <div className="editorial-header-inner">
          <button
            type="button"
            className="editorial-brand-badge"
            onClick={resetAll}
            aria-label="Dark Pattern Detector home"
          >
            <span className="brand-badge-shape" aria-hidden="true">
              <svg
                width="16"
                height="12"
                viewBox="0 0 24 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 8s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="8" r="3.2" fill="currentColor" />
              </svg>
            </span>
            <span className="brand-badge-title">THE DARK PATTERN DETECTOR</span>
          </button>

          <div className="editorial-header-right">
            {status === 'done' ? (
              <div className="editorial-nav-actions">
                <button
                  type="button"
                  className="editorial-action-btn secondary"
                  onClick={() => setShowOverlay((v) => !v)}
                  aria-pressed={showOverlay}
                  disabled={!hasFindings}
                >
                  {showOverlay ? 'Hide Annotations' : 'Show Annotations'}
                </button>
                <button
                  type="button"
                  className="editorial-action-btn primary"
                  onClick={resetAll}
                >
                  &larr; Inspect Another Screenshot
                </button>
              </div>
            ) : (
              /* Directional diagonal arrow in header (top-right to bottom-left ↙) matching reference */
              <div className="editorial-header-arrow" aria-hidden="true" title="Editorial Directional Glyph">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <polyline points="19 19 5 19 5 5" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Views */}
      <main className="editorial-main-content">
        {/* STATE A: IDLE / LANDING PAGE */}
        {status === 'idle' && (
          <section className="editorial-landing-viewport">
            <div className="editorial-landing-grid">
              {/* Left Column: Bold Headline, Supporting Copy, Upload */}
              <div className="editorial-hero-left">
                <div className="editorial-headline-wrapper">
                  <h1 className="editorial-display-heading">
                    <span className="heading-line-1">LOOKS NORMAL?</span>
                    <span className="heading-line-2">
                      <span className="heading-text-accent">THINK AGAIN.</span>
                      <span className="heading-arrow-svg" aria-hidden="true">
                        <svg
                          width="42"
                          height="42"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="7" y1="7" x2="17" y2="17" />
                          <polyline points="7 17 17 17 17 7" />
                        </svg>
                      </span>
                    </span>
                  </h1>
                </div>

                {/* Editorial corner-bracket supporting copy */}
                <div className="editorial-bracket-copy">
                  <span className="bracket-mark top-right" aria-hidden="true" />
                  <p className="editorial-supporting-text">
                    Upload a screenshot.<br />
                    Let&apos;s see what sneaky design tricks are hiding in plain sight.
                  </p>
                  <span className="bracket-mark bottom-left" aria-hidden="true" />
                </div>

                {/* Primary Upload Region */}
                <div className="editorial-hero-upload">
                  <Dropzone onImage={onImage} />
                </div>
              </div>

              {/* Right Column: Purposefully integrated illustration with duotone treatment */}
              <div className="editorial-hero-right">
                <div className="editorial-image-frame">
                  {/* Geometric corner tick marks */}
                  <span className="editorial-corner-mark top-left" aria-hidden="true" />
                  <span className="editorial-corner-mark top-right" aria-hidden="true" />
                  <span className="editorial-corner-mark bottom-left" aria-hidden="true" />
                  <span className="editorial-corner-mark bottom-right" aria-hidden="true" />

                  <div className="editorial-image-viewport">
                    <img
                      src="/hero-illustration.png"
                      alt="Editorial specimen showing forensic magnifying glass examining manipulative mobile interface tricks"
                      className="editorial-duotone-image"
                    />
                  </div>

                  <div className="editorial-image-caption">
                    <span className="caption-mono">[FIG. 01 // INTERFACE INVESTIGATION SPECIMEN]</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STATE B: ANALYZING / INVESTIGATION IN PROGRESS */}
        {status === 'analyzing' && (
          <section className="editorial-analyzing-viewport" role="status" aria-live="polite">
            <div className="editorial-analyzing-container">
              <span className="editorial-corner-mark top-left" aria-hidden="true" />
              <span className="editorial-corner-mark top-right" aria-hidden="true" />
              <span className="editorial-corner-mark bottom-left" aria-hidden="true" />
              <span className="editorial-corner-mark bottom-right" aria-hidden="true" />

              <div className="analyzing-header-row">
                <span className="editorial-mono-label">[EXHIBIT FORENSICS IN PROGRESS]</span>
                <span className="analyzing-step-badge">
                  STEP {String(stepIndex + 1).padStart(2, '0')} / {String(ANALYSIS_STEPS.length).padStart(2, '0')}
                </span>
              </div>

              {dataUrl && (
                <div className="analyzing-preview-canvas">
                  <img src={dataUrl} alt="Inspection target preview" className="analyzing-img" />
                  <div className="analyzing-crosshair" aria-hidden="true" />
                </div>
              )}

              <div className="analyzing-telemetry-body">
                <div className="editorial-progress-line" aria-hidden="true">
                  <div
                    className="editorial-progress-fill"
                    style={{ width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                  />
                </div>
                <h2 className="analyzing-step-title">{ANALYSIS_STEPS[stepIndex].label}&hellip;</h2>
                <p className="analyzing-step-detail">{ANALYSIS_STEPS[stepIndex].detail}</p>
              </div>
            </div>
          </section>
        )}

        {/* STATE C: ERROR STATE */}
        {status === 'error' && (
          <section className="editorial-error-viewport" role="alert">
            <div className="editorial-error-card">
              <span className="editorial-corner-mark top-left" aria-hidden="true" />
              <span className="editorial-corner-mark top-right" aria-hidden="true" />
              <span className="editorial-corner-mark bottom-left" aria-hidden="true" />
              <span className="editorial-corner-mark bottom-right" aria-hidden="true" />

              <span className="editorial-mono-label">[AUDIT INTERRUPTED]</span>
              <h2 className="editorial-error-heading">Inspection Failed</h2>
              <p className="editorial-error-message">{error}</p>
              <div className="editorial-error-actions">
                <button
                  type="button"
                  className="editorial-action-btn primary"
                  onClick={() => dataUrl && runAnalysis(dataUrl)}
                >
                  Retry Inspection
                </button>
                <button
                  type="button"
                  className="editorial-action-btn secondary"
                  onClick={resetAll}
                >
                  Choose Another Screenshot
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STATE D: RESULTS VIEW (REPLACES LANDING PAGE) */}
        {status === 'done' && analysis && (
          <section className="editorial-results-viewport">
            {/* Results Headline Strip */}
            <div className="editorial-results-header-strip">
              <div className="results-header-text">
                <span className="editorial-mono-label">
                  [AUDIT REPORT &middot; {fileName || 'SCREENSHOT'}]
                </span>
                <h1 className="editorial-results-headline">
                  {hasFindings ? 'Caught being sneaky.' : 'Nothing suspicious detected.'}
                </h1>
                <p className="editorial-results-sub">
                  {analysis.summary ||
                    (hasFindings
                      ? `We found ${findingCount} deceptive pattern${findingCount === 1 ? '' : 's'} engineered to manipulate choice.`
                      : 'All scanned elements provide neutral, transparent choices. No deceptive tricks flagged.')}
                </p>
              </div>
            </div>

            {/* Two-Column Editorial Inspection Layout */}
            <div className="editorial-results-layout">
              {/* Left Column: Natural Aspect Ratio Screenshot with Annotations */}
              <div className="editorial-results-screenshot-col">
                <ScreenshotView
                  src={dataUrl!}
                  alt={fileName ? `Inspected screenshot: ${fileName}` : 'Inspected screenshot'}
                  findings={analysis.findings}
                  showOverlay={showOverlay}
                  activeId={activeId}
                  onActivate={setActiveId}
                />
              </div>

              {/* Right Column: Editorial Findings List */}
              <div className="editorial-results-findings-col">
                <FindingsPanel
                  findings={analysis.findings}
                  summary={analysis.summary}
                  activeId={activeId}
                  onActivate={setActiveId}
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
