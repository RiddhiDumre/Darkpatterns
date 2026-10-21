import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { Phone3DCanvas } from './components/Phone3DCanvas'
import { SunglassesTransition } from './components/SunglassesTransition'
import { FEATURED_HERO_ANALYSIS } from './data/featuredFindings'

type ViewMode = 'investigation' | 'normal'
type AppStatus = 'initial-loading' | 'idle' | 'analyzing' | 'error'

const DEFAULT_SPECIMEN_SRC = '/mobile-checkout-specimen.png'

const ANALYSIS_STEPS = [
  'Checking visual layout and tricky buttons…',
  'Looking for fake countdowns and manufactured urgency…',
  'Reading the fine print and guilt-trip copy…',
  'Listing sneaky patterns with scribbled notes…',
]

function SunglassesIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="12"
      viewBox="0 0 28 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="sunglasses-toggle-svg"
    >
      <path d="M2 4h7c1 0 2 1 2 2v4c0 2-2 4-4.5 4S2 12 2 10V4z" fill={active ? 'currentColor' : 'none'} />
      <path d="M26 4h-7c-1 0-2 1-2 2v4c0 2 2 4 4.5 4s4.5-2 4.5-4V4z" fill={active ? 'currentColor' : 'none'} />
      <line x1="11" y1="6" x2="17" y2="6" />
    </svg>
  )
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('normal')
  const [status, setStatus] = useState<AppStatus>('initial-loading')
  const [initialAssetsReady, setInitialAssetsReady] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  // Currently displayed screenshot & findings
  const [currentImage, setCurrentImage] = useState<string>(DEFAULT_SPECIMEN_SRC)
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis>(FEATURED_HERO_ANALYSIS)
  const [isCustomUpload, setIsCustomUpload] = useState(false)
  const [uploadFileName, setUploadFileName] = useState<string | null>(null)

  // Upload & analysis state
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null)
  const [pendingAnalysis, setPendingAnalysis] = useState<Analysis | null>(null)
  const [analysisReady, setAnalysisReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preload featured mobile specimen on initial page load
  useEffect(() => {
    const img = new Image()
    img.src = DEFAULT_SPECIMEN_SRC
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

  // Handle sample preset selection
  const handleSelectSample = async (samplePath: string) => {
    try {
      if (samplePath === DEFAULT_SPECIMEN_SRC) {
        resetToDemo()
        return
      }
      const res = await fetch(samplePath)
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = String(reader.result)
        const file = new File([blob], samplePath.split('/').pop() || 'sample.png', { type: blob.type })
        onImage(dataUrl, file)
      }
      reader.readAsDataURL(blob)
    } catch {
      // Fallback: direct set if fetch fails
      setCurrentImage(samplePath)
    }
  }

  const resetToDemo = () => {
    setCurrentImage(DEFAULT_SPECIMEN_SRC)
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
      {/* 1. INITIAL LOAD FULL BLACK SUNGLASSES TRANSITION */}
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

      {/* 2. UPLOAD ANALYSIS FULL BLACK SUNGLASSES TRANSITION */}
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

      {/* Clean Editorial Masthead Header */}
      <header className="paper-header">
        <div className="paper-header-inner">
          <button
            type="button"
            className="clean-brand-button"
            onClick={resetToDemo}
            aria-label="Dark Pattern Detector home"
          >
            <span className="brand-dot" aria-hidden="true" />
            <span className="brand-name">Dark Pattern Detector</span>
          </button>

          <div className="paper-header-right">
            {/* View Mode Toggle: Investigation View / Normal View */}
            <button
              type="button"
              className={`clean-mode-toggle ${viewMode === 'investigation' ? 'is-investigation' : 'is-normal'}`}
              onClick={toggleViewMode}
              aria-label={
                viewMode === 'investigation'
                  ? 'Investigation view is active. Click to switch to normal view.'
                  : 'Normal view is active. Click to enter investigation view.'
              }
            >
              <SunglassesIcon active={viewMode === 'investigation'} />
              <span className="toggle-label">
                {viewMode === 'investigation' ? 'Shades On' : 'Shades Off'}
              </span>
            </button>

            {isCustomUpload && (
              <button
                type="button"
                className="clean-reset-btn"
                onClick={resetToDemo}
              >
                &larr; Reset specimen
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
              <h2>ANALYSIS ERROR</h2>
              <p>{error}</p>
              <div className="paper-error-buttons">
                <button
                  type="button"
                  className="clean-action-btn primary"
                  onClick={() => uploadDataUrl && runAnalysis(uploadDataUrl)}
                >
                  Try again
                </button>
                <button
                  type="button"
                  className="clean-action-btn"
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
              {/* Left Column: Big Prominent Input Area & Hero Introduction */}
              <div className="paper-hero-left">
                <div className="clean-hero-intro">
                  <h1 className="clean-hero-title">
                    Deceptive design, unmasked.
                  </h1>
                  <p className="clean-hero-subtitle">
                    Expose manufactured urgency, sneaky opt-ins, and manipulative guilt-tripping before you check out. Drop a screenshot to inspect what’s happening beneath the surface.
                  </p>
                </div>

                {/* Big Prominent Direct Input Field */}
                <div className="paper-upload-box">
                  <Dropzone
                    onImage={onImage}
                    onSelectSample={handleSelectSample}
                  />
                </div>
              </div>

              {/* Right Column: 3D Model of an iPhone with Floating Scribbled Handwritten Notes */}
              <div className="paper-hero-right">
                <div className="phone-3d-stage-container">
                  <Phone3DCanvas
                    src={currentImage}
                    alt={
                      isCustomUpload
                        ? `Uploaded screenshot: ${uploadFileName || 'Custom screenshot'}`
                        : 'Mobile checkout specimen inside 3D iPhone'
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
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
