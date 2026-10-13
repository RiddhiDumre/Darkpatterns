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
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="screenshot-container">
      <div className="screenshot-canvas">
        <div className="shot-frame-native">
          <img src={src} alt={alt} className="native-img" />
          {showOverlay &&
            findings.map((f, i) =>
              f.bbox ? (
                <button
                  key={f.id}
                  type="button"
                  className={`overlay-box sev-${f.severity}${activeId === f.id ? ' active' : ''}`}
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
                  <span className="overlay-num">
                    <span className="overlay-pin-point" aria-hidden="true" />
                    <span>{i + 1}</span>
                  </span>
                  {activeId === f.id && (
                    <span className="overlay-active-label" aria-hidden="true">
                      {f.pattern}
                    </span>
                  )}
                </button>
              ) : null,
            )}
        </div>
      </div>
      <div className="screenshot-footer">
        <button
          type="button"
          className="btn-zoom-preview"
          onClick={() => setModalOpen(true)}
          aria-label="Enlarge screenshot preview"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>Enlarge image</span>
        </button>
      </div>

      {modalOpen && (
        <div
          className="screenshot-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged screenshot preview"
          onClick={() => setModalOpen(false)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close preview"
            >
              ✕
            </button>
            <div className="lightbox-img-wrap">
              <img src={src} alt={alt} className="lightbox-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
