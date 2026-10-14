import { useEffect, useState } from 'react'

interface Props {
  dataUrl: string | null
  stepText: string
  onCancel?: () => void
  onReadyToTransition?: () => void
}

export function SunglassesLoader({ dataUrl, stepText, onCancel, onReadyToTransition }: Props) {
  const [phase, setPhase] = useState<'approach' | 'zoom' | 'scanning'>('approach')

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('scanning')
      onReadyToTransition?.()
      return
    }

    // Phase 1: Sunglasses approach the viewer (0 - 450ms)
    // Phase 2: Smooth zoom into the cyan 3D lens (450ms - 950ms)
    // Phase 3: Restrained continuous scanning state (950ms+)
    const t1 = setTimeout(() => {
      setPhase('zoom')
    }, 450)

    const t2 = setTimeout(() => {
      setPhase('scanning')
      onReadyToTransition?.()
    }, 950)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onReadyToTransition])

  return (
    <div
      className={`sunglasses-loader-container phase-${phase}`}
      role="status"
      aria-live="polite"
    >
      {/* 3D Glasses Vector Rig */}
      <div className="shades-loader-rig" aria-hidden="true">
        <svg
          viewBox="0 0 260 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shades-loader-svg"
        >
          <defs>
            {/* Cyan lens gradient (left eye) */}
            <linearGradient id="loader-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#00b4d8" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#0077b6" stopOpacity="0.95" />
            </linearGradient>

            {/* Red / Pink lens gradient (right eye) */}
            <linearGradient id="loader-pink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2e93" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#ff006e" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#b8005b" stopOpacity="0.95" />
            </linearGradient>

            {/* Specular shine */}
            <linearGradient id="loader-glare" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            <filter id="loader-shades-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
            </filter>
          </defs>

          <g filter="url(#loader-shades-shadow)">
            {/* Dark Retro Frame */}
            <path
              d="M 12 24 C 36 21 88 20 108 24 C 114 25 118 30 120 34 C 122 30 126 25 132 24 C 152 20 204 21 228 24 C 234 25 238 31 236 38 L 226 78 C 223 88 215 94 204 94 L 140 94 C 128 94 122 84 120 78 C 118 84 112 94 100 94 L 36 94 C 25 94 17 88 14 78 L 4 38 C 2 31 6 25 12 24 Z"
              fill="#121216"
              stroke="#08080a"
              strokeWidth="3.5"
            />

            {/* Top browline highlight */}
            <path
              d="M 16 26 C 40 23 88 22 108 26 M 132 26 C 152 22 200 23 224 26"
              stroke="#2d2d35"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Left Lens: Cyan */}
            <g className="loader-lens-cyan">
              <path
                d="M 22 34 C 44 31 82 31 98 34 C 104 36 108 42 106 50 L 100 74 C 98 82 92 86 84 86 L 36 86 C 28 86 22 82 20 74 L 14 50 C 13 42 16 36 22 34 Z"
                fill="url(#loader-cyan-grad)"
              />
              <path
                d="M 24 36 L 46 34 L 28 84 L 22 74 Z"
                fill="url(#loader-glare)"
              />
            </g>

            {/* Right Lens: Red / Magenta */}
            <g className="loader-lens-pink">
              <path
                d="M 142 34 C 158 31 196 31 218 34 C 224 36 227 42 226 50 L 220 74 C 218 82 212 86 204 86 L 156 86 C 148 86 142 82 140 74 L 134 50 C 132 42 136 36 142 34 Z"
                fill="url(#loader-pink-grad)"
              />
              <path
                d="M 144 36 L 166 34 L 148 84 L 142 74 Z"
                fill="url(#loader-glare)"
              />
            </g>

            {/* Bridge */}
            <path
              d="M 112 36 C 116 33 124 33 128 36"
              stroke="#2e2e36"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Lens transition veil (reveals scanning stage smoothly) */}
      <div className="shades-lens-veil" aria-hidden="true" />

      {/* Active Inspection Card (continuous waiting state) */}
      <div className="shades-telemetry-card">
        <div className="telemetry-badge-row">
          <span className="telemetry-anaglyph-badge">
            <span className="badge-dot-cyan" aria-hidden="true" />
            <span className="badge-dot-pink" aria-hidden="true" />
            3D SHADES INSPECTION
          </span>
        </div>

        <h2 className="telemetry-title">Putting on the shades&hellip;</h2>
        <p className="telemetry-sub">{stepText}</p>

        {dataUrl && (
          <div className="telemetry-preview-frame">
            <img src={dataUrl} alt="Inspection target preview" className="telemetry-thumb-img" />
            <div className="telemetry-scan-reticle" aria-hidden="true" />
          </div>
        )}

        {onCancel && (
          <div className="telemetry-actions">
            <button
              type="button"
              className="telemetry-cancel-btn"
              onClick={onCancel}
            >
              Cancel scan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
