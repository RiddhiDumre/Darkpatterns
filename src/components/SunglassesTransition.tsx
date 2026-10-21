import { useEffect, useRef, useState } from 'react'

export interface SunglassesTransitionProps {
  mode: 'initial-load' | 'analysis'
  isReady: boolean
  stepText?: string
  previewUrl?: string | null
  onCancel?: () => void
  onTransitionComplete: () => void
  onFinish?: () => void
}

type Phase = 'waiting' | 'approach' | 'zoom' | 'revealing' | 'complete'

export function SunglassesTransition({
  mode,
  isReady,
  stepText = 'Scanning interface for dark patterns…',
  previewUrl,
  onCancel,
  onTransitionComplete,
  onFinish,
}: SunglassesTransitionProps) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const startTimeRef = useRef(Date.now())
  const hasTriggeredCompleteRef = useRef(false)

  useEffect(() => {
    // Accessibility check: Skip animation if reduced motion preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true
        onTransitionComplete()
        onFinish?.()
      }
      setPhase('complete')
      return
    }

    // When ready, initiate smooth approach & lens zoom
    if (isReady && (phase === 'waiting' || phase === 'approach')) {
      const elapsed = Date.now() - startTimeRef.current
      const minWaiting = mode === 'initial-load' ? 350 : 400
      const delay = Math.max(0, minWaiting - elapsed)

      const timer = setTimeout(() => {
        setPhase('zoom')

        // At peak zoom (~500ms), switch underlying view
        const t1 = setTimeout(() => {
          if (!hasTriggeredCompleteRef.current) {
            hasTriggeredCompleteRef.current = true
            onTransitionComplete()
          }
          setPhase('revealing')

          // After veil fades out (~350ms), finish completely
          const t2 = setTimeout(() => {
            setPhase('complete')
            onFinish?.()
          }, 350)

          return () => clearTimeout(t2)
        }, 500)

        return () => clearTimeout(t1)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isReady, phase, mode, onTransitionComplete, onFinish])

  if (phase === 'complete') {
    return null
  }

  return (
    <div
      className={`sunglasses-transition-overlay phase-${phase} mode-${mode}`}
      role="status"
      aria-live="polite"
    >
      {/* Full Black Designer Sunglasses Vector Rig */}
      <div className="shades-loader-rig" aria-hidden="true">
        <svg
          viewBox="0 0 280 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shades-loader-svg"
        >
          <defs>
            {/* Deep Black Polarized Lens Gradient */}
            <linearGradient id="black-lens-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a22" stopOpacity="0.98" />
              <stop offset="50%" stopColor="#0e0e13" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#050508" stopOpacity="0.99" />
            </linearGradient>

            {/* Sharp Specular Diagonal Glare for Sunglasses Glass */}
            <linearGradient id="black-lens-glare" x1="0%" y1="0%" x2="65%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* High-end Acetate Frame Gradient */}
            <linearGradient id="black-frame-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#222228" />
              <stop offset="30%" stopColor="#121216" />
              <stop offset="100%" stopColor="#08080a" />
            </linearGradient>

            {/* Drop Shadow */}
            <filter id="black-shades-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter="url(#black-shades-shadow)">
            {/* Dark Glossy Acetate Frame */}
            <path
              d="M 14 26 C 40 22 96 21 118 25 C 124 26 128 31 130 35 C 132 31 136 26 142 25 C 164 21 220 22 246 26 C 253 27 257 33 255 40 L 244 84 C 241 95 232 101 220 101 L 152 101 C 139 101 132 90 130 84 C 128 90 121 101 108 101 L 40 101 C 28 101 19 95 16 84 L 5 40 C 3 33 7 27 14 26 Z"
              fill="url(#black-frame-grad)"
              stroke="#0a0a0c"
              strokeWidth="3.5"
            />

            {/* Subtle Metallic Browline Bevel Highlight */}
            <path
              d="M 18 28 C 44 24 96 23 118 27 M 142 27 C 164 23 216 24 242 28"
              stroke="#3a3a44"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Left Full Black Polarized Lens */}
            <g className="black-lens-left">
              <path
                d="M 24 36 C 48 33 90 33 108 36 C 114 38 118 44 116 52 L 110 80 C 108 88 101 92 92 92 L 40 92 C 31 92 24 88 22 80 L 16 52 C 15 44 18 38 24 36 Z"
                fill="url(#black-lens-grad)"
              />
              {/* Glossy Diagonal Specular Glare */}
              <path
                d="M 26 38 L 52 35 L 32 90 L 24 80 Z"
                fill="url(#black-lens-glare)"
              />
            </g>

            {/* Right Full Black Polarized Lens */}
            <g className="black-lens-right">
              <path
                d="M 152 36 C 170 33 212 33 236 36 C 242 38 245 44 244 52 L 238 80 C 236 88 229 92 220 92 L 168 92 C 159 92 152 88 150 80 L 144 52 C 143 44 146 38 152 36 Z"
                fill="url(#black-lens-grad)"
              />
              {/* Glossy Diagonal Specular Glare */}
              <path
                d="M 154 38 L 180 35 L 160 90 L 152 80 Z"
                fill="url(#black-lens-glare)"
              />
            </g>

            {/* Dual Silver Temple Rivets (Classic Wayfarer signature) */}
            <ellipse cx="14" cy="38" rx="2.5" ry="1.5" fill="#d0d0d8" />
            <ellipse cx="246" cy="38" rx="2.5" ry="1.5" fill="#d0d0d8" />

            {/* Center Bridge Detail */}
            <path
              d="M 122 38 C 126 35 134 35 138 38"
              stroke="#2e2e36"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Deep Obsidian Lens Transition Veil (replaces old cyan veil) */}
      <div className="shades-lens-veil" aria-hidden="true" />

      {/* Waiting State UI for Upload Analysis */}
      {phase === 'waiting' && mode === 'analysis' && (
        <div className="shades-telemetry-card">
          <div className="telemetry-badge-row">
            <span className="telemetry-anaglyph-badge">
              <span className="badge-dot-obsidian" aria-hidden="true" />
              BLACK SHADES FORENSIC SCAN
            </span>
          </div>

          <h2 className="telemetry-title">Putting on the shades&hellip;</h2>
          <p className="telemetry-sub">{stepText}</p>

          {previewUrl && (
            <div className="telemetry-preview-frame">
              <img src={previewUrl} alt="Inspection target preview" className="telemetry-thumb-img" />
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
      )}

      {/* Minimal label during initial page load waiting */}
      {phase === 'waiting' && mode === 'initial-load' && (
        <div className="initial-load-telemetry">
          <span className="telemetry-anaglyph-badge">
            <span className="badge-dot-obsidian" aria-hidden="true" />
            PUTTING ON THE SHADES&hellip;
          </span>
        </div>
      )}
    </div>
  )
}
