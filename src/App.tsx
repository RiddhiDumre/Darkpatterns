import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { FindingsPanel } from './components/FindingsPanel'
import { ScreenshotView } from './components/ScreenshotView'
import { SunglassesTransition } from './components/SunglassesTransition'
import { FEATURED_HERO_ANALYSIS } from './data/featuredFindings'

type ViewMode = 'investigation' | 'normal'
type AppStatus = 'initial-loading' | 'idle' | 'analyzing' | 'error'

const FEATURED_SCREENSHOT_SRC = '/featured-screenshot.png'

const ANALYSIS_STEPS = [
  'Checking visual layout and tricky buttons…',
  'Looking for fake countdowns and manufactured urgency…',
  'Reading the fine print and guilt-trip copy…',
  'Listing any sneaky patterns found…',
]

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('normal')
  const [status, setStatus] = useState<AppStatus>('initial-loading')
  const [initialAssetsReady, setInitialAssetsReady] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  // Currently displayed screenshot & findings
  const [currentImage, setCurrentImage] = useState<string>(FEATURED_SCREENSHOT_SRC)
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis>(FEATURED_HERO_ANALYSIS)
  const [isCustomUpload, setIsCustomUpload] = useState(false)
  const [uploadFileName, setUploadFileName] = useState<string | null>(null)

  // Upload & analysis state
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null)
  const [pendingAnalysis, setPendingAnalysis] = useState<Analysis | null>(null)
  const [analysisReady, setAnalysisReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preload featured screenshot on initial page load
  useEffect(() => {
    const img = new Image()
    img.src = FEATURED_SCREENSHOT_SRC
    img.onload = () => setInitialAssetsReady(true)
    img.onerror = () => setInitialAssetsReady(true)
  }, [])

  // Cycle analysis steps during 'analyzing'
  useEffect(() => {
    if (status !== 'analyzing') return
    setStepIndex(0)
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [status])

  // Sync document theme with viewMode
  useEffect(() => {
    const isDark = viewMode === 'investigation'
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    if (isDark) {
      document.body.classList.add('theme-dark')
    } else {
      document.body.classList.remove('theme-dark')
    }
  }, [viewMode])

  const runAnalysis = async (target: string) => {
    setStatus('analyzing')
    setError(null)
    setActiveId(null)
    setPendingAnalysis(null)
    setAnalysisReady(false)

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
      setAnalysisReady(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
      setStatus('error')
    }
  }

  const onImage = (url: string, file: File) => {
    setUploadDataUrl(url)
    setUploadFileName(file.name)
    setError(null)
    setActiveId(null)
    void runAnalysis(url)
  }

  const resetToDemo = () => {
    setCurrentImage(FEATURED_SCREENSHOT_SRC)
    setCurrentAnalysis(FEATURED_HERO_ANALYSIS)
    setIsCustomUpload(false)
    setUploadFileName(null)
    setUploadDataUrl(null)
    setPendingAnalysis(null)
    setActiveId(null)
  }

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'investigation' ? 'normal' : 'investigation'))
  }

  return (
    <div className={`paper-app-root ${viewMode === 'investigation' ? 'mode-investigation' : 'mode-normal'}`}>
      {/* 1. INITIAL LOAD SUNGLASSES TRANSITION */}
      {status === 'initial-loading' && (
        <SunglassesTransition
          mode="initial-load"
          isReady={initialAssetsReady}
          onTransitionComplete={() => {
            setViewMode('investigation')
            setStatus('idle')
          }}
        />
      )}

      {/* 2. UPLOAD ANALYSIS SUNGLASSES TRANSITION */}
      {status === 'analyzing' && (
        <SunglassesTransition
          mode="analysis"
          isReady={analysisReady}
          stepText={ANALYSIS_STEPS[stepIndex]}
          previewUrl={uploadDataUrl}
          onCancel={() => {
            setStatus('idle')
            setUploadDataUrl(null)
            setPendingAnalysis(null)
          }}
          onTransitionComplete={() => {
            if (uploadDataUrl && pendingAnalysis) {
              setCurrentImage(uploadDataUrl)
              setCurrentAnalysis(pendingAnalysis)
              setIsCustomUpload(true)
              setViewMode('investigation')
              setStatus('idle')
            }
          }}
        />
      )}

      {/* Editorial Minimal Header */}
      <header className="paper-header">
        <div className="paper-header-inner">
          <button
            type="button"
            className="paper-brand-logo"
            onClick={resetToDemo}
            aria-label="Dark Pattern Detector home"
          >
            <span className="brand-dot-anaglyph" aria-hidden="true">
              <span className="dot-cyan" />
              <span className="dot-pink" />
            </span>
            <span className="brand-name">Dark Pattern Detector</span>
          </button>

          <div className="paper-header-right">
            {/* View Mode Toggle Button */}
            <button
              type="button"
              className={`paper-shades-toggle ${viewMode === 'investigation' ? 'is-active' : ''}`}
              onClick={toggleViewMode}
              aria-label={
                viewMode === 'investigation'
                  ? 'Investigation view is active. Click to switch to normal view.'
                  : 'Normal view is active. Click to put on shades and switch to investigation view.'
              }
            >
              <span className="toggle-icon" aria-hidden="true">
                {viewMode === 'investigation' ? '🕶' : '👓'}
              </span>
              <span className="toggle-label">
                {viewMode === 'investigation' ? 'Shades ON' : 'Put on shades'}
              </span>
            </button>

            {isCustomUpload && (
              <button
                type="button"
                className="paper-action-btn"
                onClick={resetToDemo}
              >
                &larr; View featured demo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="paper-main-content">
        {/* ERROR STATE */}
        {status === 'error' && (
          <section className="paper-error-viewport" role="alert">
            <div className="paper-error-card">
              <h2>Something went wrong</h2>
              <p>{error}</p>
              <div className="paper-error-buttons">
                <button
                  type="button"
                  className="paper-action-btn primary"
                  onClick={() => uploadDataUrl && runAnalysis(uploadDataUrl)}
                >
                  Try again
                </button>
                <button
                  type="button"
                  className="paper-action-btn"
                  onClick={() => {
                    setError(null)
                    setStatus('idle')
                  }}
                >
                  Back to inspection
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ACTIVE EDITORIAL INVESTIGATION VIEW */}
        {(status === 'idle' || status === 'initial-loading') && (
          <section className="paper-landing-viewport">
            <div className="paper-landing-grid">
              {/* Left Column: Marker Title, Supporting Text, Dropzone, and Bullet Journal Findings */}
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

                {/* Dropzone Upload Section: ALWAYS visible & usable */}
                <div className="paper-upload-box">
                  <Dropzone onImage={onImage} />
                </div>

                {/* Bullet Journal Findings Section */}
                <div className="paper-findings-box">
                  <FindingsPanel
                    findings={currentAnalysis.findings}
                    summary={currentAnalysis.summary}
                    activeId={activeId}
                    onActivate={setActiveId}
                  />
                </div>
              </div>

              {/* Right Column: Scotch-Taped Screenshot Specimen */}
              <div className="paper-hero-right">
                <ScreenshotView
                  src={currentImage}
                  alt={
                    isCustomUpload
                      ? `Uploaded screenshot: ${uploadFileName || 'Custom screenshot'}`
                      : 'Featured e-commerce checkout screenshot'
                  }
                  findings={currentAnalysis.findings}
                  showOverlay={viewMode === 'investigation'}
                  activeId={activeId}
                  onActivate={setActiveId}
                  isCustomUpload={isCustomUpload}
                  onResetToDemo={resetToDemo}
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
