import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { FindingsPanel } from './components/FindingsPanel'
import { ScreenshotView } from './components/ScreenshotView'

type Status = 'idle' | 'analyzing' | 'done' | 'error'

const SCAN_TELEMETRY_STEPS = [
  { step: 'Inspecting visual hierarchy…', detail: 'Hunting for microscopic decline links and camouflage checkboxes' },
  { step: 'Auditing psychological pressure…', detail: 'Checking if that countdown timer was born 4 seconds ago' },
  { step: 'Translating corporate guilt-trips…', detail: 'Deciphering why opting out requires confessing to a moral failure' },
  { step: 'Calculating shamelessness score…', detail: 'Measuring total gap between user intent and growth-hacker ambition' },
]

function WatchdogShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="var(--coral)" stroke="#ffffff" />
      <circle cx="12" cy="11" r="3" fill="#ffffff" />
      <circle cx="12" cy="11" r="1.5" fill="var(--ink)" />
    </svg>
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
      {/* 1. Global Navigation Bar */}
      <header className="watchdog-nav">
        <button type="button" className="brand-shield-btn" onClick={resetAll} aria-label="Dark Pattern Watchdog Home">
          <div className="brand-logo-icon">
            <WatchdogShieldIcon />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">Dark Pattern Watchdog</span>
            <span className="brand-tagline">Autonomous Consumer Defense</span>
          </div>
        </button>

        <div className="nav-telemetry">
          {status === 'done' ? (
            <div className="header-action-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowOverlay((v) => !v)}
                aria-pressed={showOverlay}
                disabled={!hasFlags}
              >
                {showOverlay ? 'Hide highlights' : 'Show highlights'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={resetAll}
              >
                ← New Scan
              </button>
            </div>
          ) : (
            <div className="engine-status-pill">
              <span className="pulse-dot" aria-hidden="true" />
              <span>Vision Engine: Online</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. State 2: Watchdog Scanner (Analyzing View) */}
      {status === 'analyzing' && (
        <main className="view-scanner" role="status" aria-live="polite">
          <div className="scanner-pod">
            <div className="scanner-feed-window">
              {dataUrl && <img src={dataUrl} alt="Inspection target preview" className="scanner-preview-img" />}
            </div>

            <div className="scanner-telemetry">
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
            <h2>Inspection Encountered An Issue</h2>
            <p>{error}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => dataUrl && runAnalysis(dataUrl)}
              >
                Retry Scan
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetAll}>
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
              <h1 className="verdict-headline">
                {analysis.verdict ||
                  (hasFlags
                    ? `${flagCount} ${flagCount === 1 ? 'trap' : 'traps'} flagged — this screen is trying aggressively hard to hustle you`
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
                <span className="verdict-audit-badge">
                  <span className="audit-dot" aria-hidden="true" />
                  <span>Deception Score: {analysis.score}/100</span>
                </span>
              </div>
            )}
          </section>

          <div className="forensic-studio-grid">
            {/* Left Column: Natural Aspect Screenshot Canvas */}
            <section className="forensic-canvas-panel">
              <div className="canvas-panel-bar">
                <span>Inspected Evidence</span>
                <span>{fileName || 'screenshot.png'}</span>
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

            {/* Right Column: Watchdog Findings Panel */}
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

      {/* 5. State 1: Watchdog Launchpad (Upload View) */}
      {status === 'idle' && (
        <main className="view-launchpad">
          <section className="launchpad-hero">
            <div className="hero-content">
              <h1>
                Expose <span className="hero-highlight">deceptive interfaces</span> before they cost you.
              </h1>
              <p className="hero-desc">
                Inspect any checkout or web screenshot. The vision engine flags hidden subscriptions, misleading timers, sneak-into-basket fees, and confirmshaming with concrete fixes.
              </p>
              <div className="watchdog-capabilities-strip">
                <span className="capability-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Instant Vision Audit</span>
                </span>
                <span className="capability-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Coordinate Evidence</span>
                </span>
                <span className="capability-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Ethical Redesign Fixes</span>
                </span>
              </div>
            </div>

            <div className="hero-visual-frame">
              <img
                src="/hero-illustration.png"
                alt="Watchdog inspector examining deceptive mobile and web interfaces"
                className="hero-watchdog-img"
              />
            </div>
          </section>

          {configured === false && (
            <div className="config-alert" role="status">
              <strong>Notice:</strong> No Gemini API key detected. Add <code>GOOGLE_API_KEY</code> to <code>.env</code> and restart the server.
            </div>
          )}

          <section>
            <Dropzone onImage={onImage} />
          </section>
        </main>
      )}
    </div>
  )
}
