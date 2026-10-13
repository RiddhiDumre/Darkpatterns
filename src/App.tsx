import { useEffect, useState } from 'react'
import type { Analysis } from '../shared/types'
import { Dropzone } from './components/Dropzone'
import { Examples } from './components/Examples'
import { BulbIcon, FindingsPanel } from './components/FindingsPanel'
import { ScreenshotView } from './components/ScreenshotView'

type Status = 'idle' | 'analyzing' | 'done' | 'error'

const LOADING_LINES = [
  'Peeking under the hood…',
  'Checking for fake urgency…',
  'Reading the fine print…',
  'Judging those buttons…',
]

function EyeLogo() {
  return (
    <svg viewBox="0 0 48 30" width="42" height="27" aria-hidden="true">
      <path
        d="M2 15C10 4 20 1 24 1s14 3 22 14c-8 11-18 14-22 14S10 26 2 15z"
        fill="#14141B"
      />
      <circle cx="24" cy="15" r="9" fill="#FF5C8A" />
      <circle cx="24" cy="15" r="4.6" fill="#14141B" />
      <circle cx="27" cy="11.4" r="1.9" fill="#FFFFFF" />
    </svg>
  )
}

function PhoneDoodle() {
  return (
    <svg className="phone-doodle" viewBox="0 0 230 265" aria-hidden="true" fill="none">
      <rect x="52" y="14" width="136" height="238" rx="30" fill="#FFFFFF" stroke="#14141B" strokeWidth="5" />
      <rect x="66" y="38" width="108" height="188" rx="16" fill="#FBF8F1" stroke="#14141B" strokeWidth="3" />
      <path d="M84 76 l26 8" stroke="#14141B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M156 76 l-26 8" stroke="#14141B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="100" cy="104" r="13" fill="#FFFFFF" stroke="#14141B" strokeWidth="3.5" />
      <circle cx="140" cy="104" r="13" fill="#FFFFFF" stroke="#14141B" strokeWidth="3.5" />
      <circle cx="104" cy="107" r="5.5" fill="#14141B" />
      <circle cx="144" cy="107" r="5.5" fill="#14141B" />
      <path d="M104 148 q18 16 38 -2" stroke="#14141B" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="76" y="176" width="88" height="34" rx="8" fill="#FFE55C" stroke="#14141B" strokeWidth="3" />
      <path d="M86 193 h68" stroke="#14141B" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 202 h48" stroke="#14141B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="74" cy="212" r="34" fill="#FFFFFF" fillOpacity="0.75" stroke="#FF5C8A" strokeWidth="8" />
      <path d="M52 236 L26 258" stroke="#14141B" strokeWidth="11" strokeLinecap="round" />
      <path d="M198 34 l16 -12 M204 58 h20 M198 82 l16 12" stroke="#14141B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function ArrowSquiggle() {
  return (
    <svg className="arrow-squiggle" viewBox="0 0 64 78" aria-hidden="true" fill="none">
      <path
        d="M54 8 C24 12 14 40 26 62"
        stroke="#3F6FE0"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M18 54 l8 11 l12 -7" stroke="#3F6FE0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function App() {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [activeExample, setActiveExample] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j: { configured?: boolean }) => setConfigured(Boolean(j.configured)))
      .catch(() => setConfigured(false))
  }, [])

  useEffect(() => {
    if (status !== 'analyzing') return
    setLineIndex(0)
    const t = setInterval(() => setLineIndex((i) => (i + 1) % LOADING_LINES.length), 1800)
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
      requestAnimationFrame(() =>
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
      setStatus('error')
    }
  }

  const onImage = (url: string, file: File) => {
    setDataUrl(url)
    setFileName(file.name)
    setActiveExample(null)
    setAnalysis(null)
    setError(null)
    setStatus('idle')
    setActiveId(null)
    void runAnalysis(url)
  }

  const runExample = async (label: string, src: string) => {
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      const url = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result))
        fr.onerror = () => reject(new Error('read failed'))
        fr.readAsDataURL(blob)
      })
      setDataUrl(url)
      setFileName(`${label}.png`)
      setActiveExample(src)
      setAnalysis(null)
      void runAnalysis(url)
    } catch {
      setError('Could not load that example. Try uploading a screenshot instead.')
      setStatus('error')
    }
  }

  const resetAll = () => {
    setDataUrl(null)
    setFileName(null)
    setActiveExample(null)
    setAnalysis(null)
    setError(null)
    setStatus('idle')
    setActiveId(null)
  }

  const flagCount = analysis?.findings.length ?? 0
  const hasFlags = flagCount > 0
  const showResultsArea = status === 'analyzing' || status === 'error' || status === 'done'

  return (
    <div className="page">
      <header className="topbar">
        <a className="logo" href="#top">
          <EyeLogo />
          <span>Dark Pattern Detector</span>
        </a>
        <nav className="nav">
          <a href="#examples">Examples</a>
          <a href="#results">The Hall of Shame</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>
            Looks normal?
            <br />
            <span className="mark-pink">Think</span> again.
          </h1>
          <p className="hero-sub">
            Upload a screenshot and we'll call out the sneaky design tricks hiding in plain sight.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sticky-note note-hero">Same UI.<br />Different Agenda.</div>
          <PhoneDoodle />
          <span className="hand hand-dark">Looks innocent, right? Think again.</span>
        </div>
      </section>

      {configured === false && (
        <div className="notice" role="status">
          <strong>Heads up:</strong> no API key is set yet, so analysis will fail. Copy{' '}
          <code>.env.example</code> to <code>.env</code>, add your <code>GOOGLE_API_KEY</code> and restart{' '}
          <code>npm run dev</code>.
        </div>
      )}

      <section className="drop-card">
        <Dropzone onImage={onImage} compact={Boolean(dataUrl)} />
        {!dataUrl && (
          <div className="drop-note" aria-hidden="true">
            <ArrowSquiggle />
            <span className="hand hand-blue">
              Try a shopping app, a bank app, or that “harmless” popup 👀
            </span>
          </div>
        )}
      </section>

      <Examples onSelect={runExample} activeSrc={activeExample} disabled={status === 'analyzing'} />

      {showResultsArea && (
        <section className="results-area" id="results">
          {status === 'analyzing' && (
            <div className="panel loading" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <p className="loading-line">{LOADING_LINES[lineIndex]}</p>
              <p className="loading-sub">This usually takes a few seconds.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="panel error-card" role="alert">
              <h2>Well, that didn't work</h2>
              <p>{error}</p>
              <button type="button" className="btn btn-solid" onClick={() => dataUrl && runAnalysis(dataUrl)}>
                Try again
              </button>
            </div>
          )}

          {status === 'done' && analysis && (
            <>
              <div className="results-head">
                <h2 className="mark-yellow">Here's what we found</h2>
                <div className="results-badges">
                  <span className="count-pill">
                    {hasFlags
                      ? `${flagCount} dark pattern${flagCount === 1 ? '' : 's'} found`
                      : 'No dark patterns found'}
                  </span>
                  <span className="score-chip">Score {analysis.score}/100</span>
                </div>
              </div>

              <div className="results-grid">
                <div className="phone-col">
                  <div className="sparks" aria-hidden="true">
                    <svg viewBox="0 0 40 120" fill="none">
                      <path d="M8 14 l14 -8 M4 46 h16 M8 78 l14 8" stroke="#FFD84D" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="phone">
                    <div className="phone-notch" aria-hidden="true" />
                    <div className="phone-screen">
                      <ScreenshotView
                        src={dataUrl!}
                        alt={fileName ? `Screenshot: ${fileName}` : 'Uploaded screenshot'}
                        findings={analysis.findings}
                        showOverlay={showOverlay}
                        activeId={activeId}
                        onActivate={setActiveId}
                      />
                    </div>
                  </div>
                  <p className="shot-caption">{fileName}</p>
                  <div className="toolbar">
                    <button type="button" className="btn btn-solid" onClick={() => dataUrl && runAnalysis(dataUrl)}>
                      Re-analyze
                    </button>
                    <button
                      type="button"
                      className="btn btn-line"
                      onClick={() => setShowOverlay((v) => !v)}
                      aria-pressed={showOverlay}
                      disabled={!hasFlags}
                    >
                      {showOverlay ? 'Hide annotations' : 'Show annotations'}
                    </button>
                    <button type="button" className="btn btn-line" onClick={resetAll}>
                      Clear
                    </button>
                  </div>
                </div>

                <FindingsPanel analysis={analysis} activeId={activeId} onActivate={setActiveId} />
              </div>
            </>
          )}
        </section>
      )}

      <section className="trust-band" id="about">
        <span className="trust-bulb">
          <BulbIcon size={30} />
        </span>
        <div className="trust-copy">
          <h3>Good design builds trust.</h3>
          <p>Dark patterns do the opposite. Let's make the internet a little kinder.</p>
        </div>
        <div className="sticky-note note-trust" aria-hidden="true">
          Same UI.
          <br />
          Different Intentions.
        </div>
      </section>

      <footer className="mini-footer">
        <p>
          Your screenshot is sent only to the Gemini API for analysis — nothing is stored. Scores are
          advisory, not legal advice.
        </p>
      </footer>
    </div>
  )
}
