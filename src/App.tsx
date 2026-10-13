import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { Examples } from './components/Examples'
import { FindingsPanel } from './components/FindingsPanel'
import { ScreenshotView } from './components/ScreenshotView'

type Status = 'idle' | 'analyzing' | 'done' | 'error'

const SCAN_TELEMETRY_STEPS = [
  { step: 'Inspecting visual hierarchy…', detail: 'Hunting for microscopic decline links, camouflage checkboxes, and visual asymmetry' },
  { step: 'Auditing psychological pressure…', detail: 'Checking if countdown timers, fake social proof, and artificial scarcity loops are active' },
  { step: 'Translating corporate guilt-trips…', detail: 'Deciphering why opting out requires confessing to a personal flaw or moral failure' },
  { step: 'Calculating shamelessness score…', detail: 'Measuring total gap between genuine user intent and aggressive growth-hacker ambition' },
]

function CosmosWatchdogIcon() {
  return (
    <div className="cosmos-radar-logo" aria-hidden="true">
      <span className="radar-core" />
      <span className="radar-orbit" />
      <span className="radar-crosshair-v" />
      <span className="radar-crosshair-h" />
    </div>
  )
}

export default function App() {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j: { configured?: boolean }) => setConfigured(Boolean(j.configured)))
      .catch(() => setConfigured(false))
  }, [])

  useEffect(() => {
    if (status !== 'analyzing') return
    setStepIndex(0)
    const t = setInterval(() => setStepIndex((i) => (i + 1) % SCAN_TELEMETRY_STEPS.length), 1400)
    return () => clearInterval(t)
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

  const onExampleSelect = async (label: string, src: string) => {
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrlResult = String(reader.result)
        const file = new File([blob], `${label}.png`, { type: blob.type || 'image/png' })
        onImage(dataUrlResult, file)
      }
      reader.readAsDataURL(blob)
    } catch (err) {
      console.error('Failed to load exhibit', err)
    }
  }

  const resetAll = () => {
    setDataUrl(null)
    setFileName(null)
    setAnalysis(null)
    setError(null)
    setStatus('idle')
    setActiveId(null)
  }

  const flagCount = analysis?.findings.length ?? 0
  const hasFlags = flagCount > 0

  return (
    <div className="app-viewport">
      {/* 1. Floating Cosmos-Style Capsule Navigation */}
      <header className="watchdog-nav-capsule">
        <button type="button" className="brand-shield-btn" onClick={resetAll} aria-label="Dark Pattern Watchdog Home">
          <div className="brand-logo-icon">
            <CosmosWatchdogIcon />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">Dark Pattern Detector</span>
            <span className="brand-tagline">FORENSIC UX AUDIT // COSMOS ED.</span>
          </div>
        </button>

        <div className="nav-center-pill">
          {status === 'done' ? (
            <div className="nav-audit-score-pill">
              <span className="audit-pulse-magenta" aria-hidden="true" />
              <span>
                DECEPTION INDEX: <strong>{analysis?.score ?? 0}/100</strong>
              </span>
            </div>
          ) : (
            <div className="engine-status-pill">
              <span className="pulse-dot" aria-hidden="true" />
              <span>Vision Engine: Gemini 3.8 Flash Online</span>
            </div>
          )}
        </div>

        <div className="nav-actions-group">
          {status === 'done' ? (
            <div className="header-action-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm pill-btn"
                onClick={() => setShowOverlay((v) => !v)}
                aria-pressed={showOverlay}
                disabled={!hasFlags}
              >
                {showOverlay ? 'Hide Highlights' : 'Show Highlights'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm pill-btn"
                onClick={resetAll}
              >
                ← New Scan
              </button>
            </div>
          ) : (
            <a href="#examples" className="nav-link-pill">
              <span>View Exhibits</span>
              <span className="exhibits-count-badge">6</span>
            </a>
          )}
        </div>
      </header>

      {/* 2. State 2: Watchdog Scanner (Analyzing View) */}
      {status === 'analyzing' && (
        <main className="view-scanner" role="status" aria-live="polite">
          <div className="scanner-pod">
            <div className="scanner-feed-window">
              <div className="scanner-optical-grid" aria-hidden="true" />
              {dataUrl && <img src={dataUrl} alt="Inspection target preview" className="scanner-preview-img" />}
              <div className="scanner-sweep-line" aria-hidden="true" />
            </div>

            <div className="scanner-telemetry">
              <div className="scanner-mono-badge">[OPTICAL FORENSICS // IN PROGRESS]</div>
              <div className="scanner-progress-track" aria-hidden="true">
                <div
                  className="scanner-progress-bar"
                  style={{ width: `${((stepIndex + 1) / SCAN_TELEMETRY_STEPS.length) * 100}%` }}
                />
              </div>
              <h2 className="scanner-step-title">{SCAN_TELEMETRY_STEPS[stepIndex].step}</h2>
              <p className="scanner-step-sub">{SCAN_TELEMETRY_STEPS[stepIndex].detail}</p>
            </div>
          </div>
        </main>
      )}

      {/* 3. State 3: Error Recovery Pod */}
      {status === 'error' && (
        <main className="view-error-pod">
          <div className="error-pod-card" role="alert">
            <span className="mono-sub">[AUDIT INTERRUPTED]</span>
            <h2>Inspection Encountered An Issue</h2>
            <p>{error}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm pill-btn"
                onClick={() => dataUrl && runAnalysis(dataUrl)}
              >
                Retry Scan
              </button>
              <button type="button" className="btn btn-secondary btn-sm pill-btn" onClick={resetAll}>
                Select Another Screenshot
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 4. State 4: Forensic Workspace (Results View) */}
      {status === 'done' && analysis && (
        <main className="view-workspace">
          <section className="forensic-top-strip">
            <div className="forensic-verdict-group">
              <div className="verdict-meta-row">
                <span className="verdict-tag">[AUDIT FINDING]</span>
                <span className="verdict-timestamp">CCPA 2023 & OECD FORENSICS COMPLIANT</span>
              </div>
              <h1 className="verdict-headline">
                {analysis.verdict ||
                  (hasFlags
                    ? `${flagCount} ${flagCount === 1 ? 'trap' : 'traps'} flagged — this screen is actively nudging you into compliance`
                    : 'Suspiciously wholesome — no dark patterns detected')}
              </h1>
              <p className="verdict-count">
                {analysis.summary ||
                  (hasFlags
                    ? `Audit flagged ${flagCount} psychological stunt${flagCount === 1 ? '' : 's'} designed to nudge, shame, or trick you into compliance.`
                    : 'All scanned elements provide neutral, transparent choices. Either they respect you, or their growth team called in sick.')}
              </p>
            </div>

            {hasFlags && (
              <div className="severity-meter-capsules">
                <div className="deception-score-card">
                  <span className="score-card-label">DECEPTION INDEX</span>
                  <div className="score-card-val-row">
                    <span className="score-num">{analysis.score}</span>
                    <span className="score-max">/100</span>
                  </div>
                  <span className="score-rating-pill">
                    {analysis.score >= 70 ? 'High Coercion' : analysis.score >= 40 ? 'Moderate Nudge' : 'Low Friction'}
                  </span>
                </div>
              </div>
            )}
          </section>

          <div className="forensic-studio-grid">
            {/* Left Column: Natural Aspect Screenshot Canvas */}
            <section className="forensic-canvas-panel">
              <div className="canvas-panel-bar">
                <span className="panel-bar-title">INSPECTED EXHIBIT EVIDENCE</span>
                <span className="panel-bar-file">{fileName || 'screenshot.png'}</span>
              </div>
              <ScreenshotView
                src={dataUrl!}
                alt={fileName ? `Screenshot: ${fileName}` : 'Uploaded screenshot'}
                findings={analysis.findings}
                showOverlay={showOverlay}
                activeId={activeId}
                onActivate={setActiveId}
              />
            </section>

            {/* Right Column: Watchdog Findings Panel with 3D Flip Card Specimen */}
            <section style={{ height: '100%', minHeight: 0 }}>
              <FindingsPanel
                findings={analysis.findings}
                summary={analysis.summary}
                activeId={activeId}
                onActivate={setActiveId}
              />
            </section>
          </div>
        </main>
      )}

      {/* 5. State 1: Watchdog Launchpad (Upload View & Exhibits Archive) */}
      {status === 'idle' && (
        <main className="view-launchpad">
          <section className="launchpad-hero">
            <div className="hero-content">
              <div className="hero-eyebrow-pill">
                <span className="eyebrow-dot" aria-hidden="true" />
                <span>AUTONOMOUS FORENSIC UX AUDITOR</span>
              </div>
              <h1>
                Expose <span className="hero-highlight">deceptive interfaces</span> before they cost you.
              </h1>
              <p className="hero-desc">
                Drop any mobile checkout or subscription screenshot. The vision engine flags hidden fees, manufactured countdowns, sneaky pre-selections, and confirmshaming with concrete, ethical 3D redesigns.
              </p>
              <div className="watchdog-capabilities-strip">
                <span className="capability-item">
                  <span className="cap-icon-check">✓</span>
                  <span>Instant Vision Audit</span>
                </span>
                <span className="capability-item">
                  <span className="cap-icon-check">✓</span>
                  <span>Coordinate Evidence Pins</span>
                </span>
                <span className="capability-item">
                  <span className="cap-icon-check">✓</span>
                  <span>Interactive 3D Ethical Fixes</span>
                </span>
                <span className="capability-item">
                  <span className="cap-icon-check">✓</span>
                  <span>Zero Data Retention</span>
                </span>
              </div>
            </div>

            <div className="hero-visual-frame">
              <div className="hero-image-card-3d">
                <img
                  src="/hero-illustration.png"
                  alt="Watchdog inspector examining deceptive mobile and web interfaces"
                  className="hero-watchdog-img"
                />
                <div className="hero-card-tag">
                  <span className="tag-status-live" />
                  <span>AUDIT READY</span>
                </div>
              </div>
            </div>
          </section>

          {configured === false && (
            <div className="config-alert" role="status">
              <strong>Notice:</strong> No Gemini API key detected. Add <code>GOOGLE_API_KEY</code> to <code>.env</code> and restart the server.
            </div>
          )}

          <section className="launchpad-dropzone-section">
            <Dropzone onImage={onImage} />
          </section>

          {/* Curated Exhibits Gallery */}
          <Examples onSelect={onExampleSelect} activeSrc={dataUrl} />
        </main>
      )}
    </div>
  )
}
