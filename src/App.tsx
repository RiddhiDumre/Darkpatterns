import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { FindingsPanel } from './components/FindingsPanel'
import { ScreenshotView } from './components/ScreenshotView'
import { SunglassesLoader } from './components/SunglassesLoader'

type Status = 'idle' | 'analyzing' | 'done' | 'error'

const ANALYSIS_STEPS = [
  'Checking visual layout and tricky buttons…',
  'Looking for fake countdowns and manufactured urgency…',
  'Reading the fine print and guilt-trip copy…',
  'Listing any sneaky patterns found…',
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
  const [pendingAnalysis, setPendingAnalysis] = useState<Analysis | null>(null)
  const [canCompleteAnimation, setCanCompleteAnimation] = useState(false)

  useEffect(() => {
    if (status !== 'analyzing') return
    setStepIndex(0)
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [status])

  // Complete loading transition when both API payload and minimum animation are ready
  useEffect(() => {
    if (pendingAnalysis && canCompleteAnimation && status === 'analyzing') {
      setAnalysis(pendingAnalysis)
      setShowOverlay(true)
      setStatus('done')
      setPendingAnalysis(null)
    }
  }, [pendingAnalysis, canCompleteAnimation, status])

  const runAnalysis = async (target: string) => {
    setStatus('analyzing')
    setError(null)
    setActiveId(null)
    setPendingAnalysis(null)
    setCanCompleteAnimation(false)
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
      setPendingAnalysis(payload as Analysis)
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

  return (
    <div className="paper-app-root">
      {/* Minimal Header */}
      <header className="paper-header">
        <div className="paper-header-inner">
          <button
            type="button"
            className="paper-brand-logo"
            onClick={resetAll}
            aria-label="Dark Pattern Detector home"
          >
            <span className="brand-dot" aria-hidden="true" />
            <span className="brand-name">Dark Pattern Detector</span>
          </button>

          <div className="paper-header-right">
            {status === 'done' ? (
              <button
                type="button"
                className="paper-action-btn"
                onClick={resetAll}
              >
                &larr; Scan another screenshot
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="paper-main-content">
        {/* STATE A: IDLE / LANDING PAGE */}
        {status === 'idle' && (
          <section className="paper-landing-viewport">
            <div className="paper-landing-grid">
              {/* Left Column: Hand-drawn Marker Title, Supporting Text, Upload Area */}
              <div className="paper-hero-left">
                <div className="paper-title-wrapper">
                  <h1 className="marker-title">
                    <span className="marker-line-1">Looks normal?</span>
                    <span className="marker-line-2">
                      <span className="marker-highlight">Think again.</span>
                      <span className="marker-arrow" aria-hidden="true">
                        <svg
                          width="38"
                          height="38"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.2"
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

                <p className="paper-supporting-text">
                  Upload a screenshot. Let&apos;s see what sneaky design tricks are hiding in plain sight.
                </p>

                <div className="paper-upload-box">
                  <Dropzone onImage={onImage} />
                </div>
              </div>

              {/* Right Column: Illustration drawn directly onto paper with transparent background */}
              <div className="paper-hero-right">
                <div className="paper-drawn-illustration-wrapper">
                  <img
                    src="/hero-illustration.png"
                    alt="Hand drawn illustration showing a mobile character with magnifying glass and sticky notes"
                    className="paper-drawn-image"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STATE B: ANALYZING STATE WITH SUNGLASSES LOADER */}
        {status === 'analyzing' && (
          <SunglassesLoader
            dataUrl={dataUrl}
            stepText={ANALYSIS_STEPS[stepIndex]}
            onCancel={resetAll}
            onReadyToTransition={() => setCanCompleteAnimation(true)}
          />
        )}

        {/* STATE C: ERROR STATE */}
        {status === 'error' && (
          <section className="paper-error-viewport" role="alert">
            <div className="paper-error-card">
              <h2>Something went wrong</h2>
              <p>{error}</p>
              <div className="paper-error-buttons">
                <button
                  type="button"
                  className="paper-action-btn primary"
                  onClick={() => dataUrl && runAnalysis(dataUrl)}
                >
                  Try again
                </button>
                <button
                  type="button"
                  className="paper-action-btn"
                  onClick={resetAll}
                >
                  Pick another screenshot
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STATE D: RESULTS VIEW (CLEAN NORMAL PAGE LIKE A BULLET JOURNAL) */}
        {status === 'done' && analysis && (
          <section className="bujo-page-viewport">
            <div className="bujo-page-spread">
              {/* Left Column: Scotch-Taped Screenshot */}
              <div className="bujo-col-screenshot">
                <ScreenshotView
                  src={dataUrl!}
                  alt={fileName ? `Uploaded screenshot: ${fileName}` : 'Uploaded screenshot'}
                  findings={analysis.findings}
                  showOverlay={showOverlay}
                  activeId={activeId}
                  onActivate={setActiveId}
                />
              </div>

              {/* Right Column: Bullet Journaling Pointers */}
              <div className="bujo-col-findings">
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
