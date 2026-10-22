import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { Phone3DCanvas } from './components/Phone3DCanvas'
import { AppIconBackground } from './components/AppIconBackground'
import { AnalysisLoadingOverlay } from './components/AnalysisLoadingOverlay'
import { FEATURED_HERO_ANALYSIS } from './data/featuredFindings'

type AppStatus = 'idle' | 'analyzing' | 'error'

const DEFAULT_SPECIMEN_SRC = '/mobile-checkout-specimen.png'

const ANALYSIS_STEPS = [
  'Checking visual layout and tricky buttons…',
  'Looking for fake countdowns and manufactured urgency…',
  'Reading the fine print and guilt-trip copy…',
  'Listing sneaky patterns with scribbled notes…',
]

export default function App() {
  const [status, setStatus] = useState<AppStatus>('idle')
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

  // Ensure Light theme permanently
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    document.body.classList.remove('theme-dark')
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

  return (
    <div className="paper-app-root">
      {/* 3D App Icon Grid Background (Spotify, Swiggy, Zomato, etc. with 20% opacity and 3D hover tilt) */}
      <AppIconBackground />

      {/* Upload Analysis Loading State */}
      {status === 'analyzing' && (
        <AnalysisLoadingOverlay
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
        {status === 'idle' && (
          <section className="paper-landing-viewport">
            <div className="paper-landing-grid">
              {/* Left Column: Big Prominent Input Area & Hero Introduction */}
              <div className="paper-hero-left">
                <div className="clean-hero-intro">
                  <h1 className="clean-hero-title">
                    Deceptive design, unmasked.
                  </h1>
                  <p className="clean-hero-subtitle">
                    Drop any checkout, subscription, or booking screenshot to detect manipulative patterns before you pay.
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
                    showOverlay={true}
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
