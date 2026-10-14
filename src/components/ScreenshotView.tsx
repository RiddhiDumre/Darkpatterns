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
    <div className="taped-photo-container">
      {/* Scotch tape strips holding the image to the paper */}
      <div className="scotch-tape tape-top-left" aria-hidden="true" />
      <div className="scotch-tape tape-top-right" aria-hidden="true" />

      {/* The paper-mounted screenshot */}
      <div className="taped-photo-paper">
        <div className="taped-photo-canvas">
          <img src={src} alt={alt} className="taped-native-img" />

          {showOverlay &&
            findings.map((f, i) =>
              f.bbox ? (
                <button
                  key={f.id}
                  type="button"
                  className={`taped-overlay-pin${activeId === f.id ? ' is-active' : ''}`}
                  style={{
                    left: `${f.bbox.x}%`,
                    top: `${f.bbox.y}%`,
                    width: `${f.bbox.w}%`,
                    height: `${f.bbox.h}%`,
                  }}
                  onClick={() => onActivate(f.id)}
                  onMouseEnter={() => onActivate(f.id)}
                  aria-label={`Dark pattern ${i + 1}: ${f.pattern}`}
                >
                  <span className="taped-pin-badge">{i + 1}</span>
                </button>
              ) : null,
            )}
        </div>
      </div>

      <div className="taped-photo-footer">
        <button
          type="button"
          className="bujo-zoom-btn"
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
          <span>Enlarge image</span>
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="bujo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged screenshot preview"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="bujo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="bujo-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close full view"
            >
              &times; Close
            </button>
            <div className="bujo-lightbox-scroll">
              <img src={src} alt={alt} className="bujo-lightbox-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
