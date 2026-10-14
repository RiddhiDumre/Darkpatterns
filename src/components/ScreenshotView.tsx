import { useState } from 'react'
import type { Finding } from '../../shared/types'

interface Props {
  src: string
  alt: string
  findings: Finding[]
  showOverlay: boolean
  activeId: string | null
  onActivate: (id: string) => void
}

export function ScreenshotView({ src, alt, findings, showOverlay, activeId, onActivate }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="editorial-screenshot-container">
      <div className="editorial-screenshot-frame">
        {/* Geometric corner reticles */}
        <span className="editorial-corner-mark top-left" aria-hidden="true" />
        <span className="editorial-corner-mark top-right" aria-hidden="true" />
        <span className="editorial-corner-mark bottom-left" aria-hidden="true" />
        <span className="editorial-corner-mark bottom-right" aria-hidden="true" />

        <div className="editorial-shot-canvas">
          <img src={src} alt={alt} className="editorial-native-img" />

          {showOverlay &&
            findings.map((f, i) =>
              f.bbox ? (
                <button
                  key={f.id}
                  type="button"
                  className={`editorial-overlay-box${activeId === f.id ? ' is-active' : ''} sev-${f.severity}`}
                  style={{
                    left: `${f.bbox.x}%`,
                    top: `${f.bbox.y}%`,
                    width: `${f.bbox.w}%`,
                    height: `${f.bbox.h}%`,
                  }}
                  onClick={() => onActivate(f.id)}
                  onMouseEnter={() => onActivate(f.id)}
                  aria-label={`Finding ${i + 1}: ${f.pattern}`}
                >
                  <span className="overlay-corner-tick top-left" aria-hidden="true" />
                  <span className="overlay-corner-tick top-right" aria-hidden="true" />
                  <span className="overlay-corner-tick bottom-left" aria-hidden="true" />
                  <span className="overlay-corner-tick bottom-right" aria-hidden="true" />

                  <span className="overlay-badge-num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              ) : null,
            )}
        </div>
      </div>

      <div className="editorial-screenshot-bar">
        <span className="screenshot-meta-mono">[EVIDENCE ARTIFACT // NATURAL SCALE]</span>
        <button
          type="button"
          className="editorial-zoom-btn"
          onClick={() => setLightboxOpen(true)}
          aria-label="Enlarge screenshot view"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <span>Enlarge</span>
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="editorial-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged screenshot preview"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="lightbox-editorial-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-top-bar">
              <span className="lightbox-label-mono">[FULL RESOLUTION INSPECTION]</span>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close full view"
              >
                &times; Close
              </button>
            </div>
            <div className="lightbox-img-scroller">
              <img src={src} alt={alt} className="lightbox-full-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
