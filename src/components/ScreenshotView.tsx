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
  return (
    <div className="shot-frame">
      <img src={src} alt={alt} />
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
              aria-label={`Flag ${i + 1}: ${f.pattern}`}
            >
              <span className="overlay-num">{i + 1}</span>
            </button>
          ) : null,
        )}
    </div>
  )
}
