import { useState } from 'react'

export interface VisualAdjustments {
  doodleX: number
  doodleY: number
  doodleScale: number
  doodleRotate: number
  bubbleX: number
  bubbleY: number
  bubbleScale: number
  bubbleText: string
  phoneX: number
  phoneY: number
  phoneScale: number
}

const STORAGE_KEY = 'visual_adjustments_live'

export const DEFAULT_ADJUSTMENTS: VisualAdjustments = {
  doodleX: 20,
  doodleY: -32,
  doodleScale: 175, // width in px
  doodleRotate: 0,
  bubbleX: 0,
  bubbleY: 0,
  bubbleScale: 1,
  bubbleText: 'Aha! Look at this sneakiness right here...',
  phoneX: 0,
  phoneY: 0,
  phoneScale: 1,
}

interface Props {
  adjustments: VisualAdjustments
  onChange: (val: VisualAdjustments) => void
  onReset: () => void
}

export function VisualAdjustmentGizmo({ adjustments, onChange, onReset }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const update = <K extends keyof VisualAdjustments>(key: K, val: VisualAdjustments[K]) => {
    const next = { ...adjustments, [key]: val }
    onChange(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const handleCopyCode = () => {
    const code = `/* User Custom Coordinates */
.detective-doodle-wrapper {
  left: ${adjustments.doodleX}px !important;
  bottom: ${adjustments.doodleY}px !important;
  transform: rotate(${adjustments.doodleRotate}deg);
}
.detective-doodle-img {
  width: ${adjustments.doodleScale}px !important;
}
.detective-speech-bubble {
  transform: translate(${adjustments.bubbleX}px, ${adjustments.bubbleY}px) scale(${adjustments.bubbleScale}) !important;
}
.phone-3d-wrapper {
  transform: translate(${adjustments.phoneX}px, ${adjustments.phoneY}px) scale(${adjustments.phoneScale}) !important;
}`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside
      className={`visual-tuner-panel${isOpen ? ' is-open' : ' is-collapsed'}`}
      aria-label="Visual layout tuner"
    >
      <div className="tuner-header">
        <div className="tuner-title-row">
          <span className="tuner-indicator" />
          <span className="tuner-title">Interactive Visual Editor</span>
        </div>
        <div className="tuner-header-actions">
          <button
            type="button"
            className="tuner-collapse-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Collapse tuner' : 'Expand tuner'}
          >
            {isOpen ? '—' : '⚙ Edit Position'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="tuner-body">
          <p className="tuner-hint">
            Drag sliders or use mouse to move and resize elements freely. When you're satisfied, click <strong>"Copy Exact Specs"</strong> or share with me!
          </p>

          {/* DOODLE SECTION */}
          <div className="tuner-group">
            <h4 className="tuner-group-title">🕵️ Detective Doodle</h4>
            
            <label className="tuner-slider-label">
              <span>Horizontal (X): <strong>{adjustments.doodleX}px</strong></span>
              <input
                type="range"
                min="-200"
                max="400"
                step="1"
                value={adjustments.doodleX}
                onChange={(e) => update('doodleX', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Vertical (Y from bottom): <strong>{adjustments.doodleY}px</strong></span>
              <input
                type="range"
                min="-120"
                max="300"
                step="1"
                value={adjustments.doodleY}
                onChange={(e) => update('doodleY', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Size: <strong>{adjustments.doodleScale}px</strong></span>
              <input
                type="range"
                min="100"
                max="360"
                step="2"
                value={adjustments.doodleScale}
                onChange={(e) => update('doodleScale', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Tilt Angle: <strong>{adjustments.doodleRotate}°</strong></span>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={adjustments.doodleRotate}
                onChange={(e) => update('doodleRotate', Number(e.target.value))}
              />
            </label>
          </div>

          {/* SPEECH BUBBLE SECTION */}
          <div className="tuner-group">
            <h4 className="tuner-group-title">💬 Speech Bubble</h4>

            <label className="tuner-slider-label">
              <span>Text:</span>
              <input
                type="text"
                className="tuner-text-input"
                value={adjustments.bubbleText}
                onChange={(e) => update('bubbleText', e.target.value)}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Bubble Offset X: <strong>{adjustments.bubbleX}px</strong></span>
              <input
                type="range"
                min="-150"
                max="150"
                step="1"
                value={adjustments.bubbleX}
                onChange={(e) => update('bubbleX', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Bubble Offset Y: <strong>{adjustments.bubbleY}px</strong></span>
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={adjustments.bubbleY}
                onChange={(e) => update('bubbleY', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Bubble Scale: <strong>{adjustments.bubbleScale.toFixed(2)}x</strong></span>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={adjustments.bubbleScale}
                onChange={(e) => update('bubbleScale', Number(e.target.value))}
              />
            </label>
          </div>

          {/* PHONE POSITION SECTION */}
          <div className="tuner-group">
            <h4 className="tuner-group-title">📱 3D Phone Position</h4>

            <label className="tuner-slider-label">
              <span>Phone Shift X: <strong>{adjustments.phoneX}px</strong></span>
              <input
                type="range"
                min="-150"
                max="150"
                step="1"
                value={adjustments.phoneX}
                onChange={(e) => update('phoneX', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Phone Shift Y: <strong>{adjustments.phoneY}px</strong></span>
              <input
                type="range"
                min="-150"
                max="150"
                step="1"
                value={adjustments.phoneY}
                onChange={(e) => update('phoneY', Number(e.target.value))}
              />
            </label>

            <label className="tuner-slider-label">
              <span>Phone Scale: <strong>{adjustments.phoneScale.toFixed(2)}x</strong></span>
              <input
                type="range"
                min="0.75"
                max="1.3"
                step="0.02"
                value={adjustments.phoneScale}
                onChange={(e) => update('phoneScale', Number(e.target.value))}
              />
            </label>
          </div>

          {/* ACTIONS */}
          <div className="tuner-footer-actions">
            <button
              type="button"
              className="tuner-copy-btn"
              onClick={handleCopyCode}
            >
              {copied ? '✓ Copied Specs!' : '📋 Copy Exact Specs'}
            </button>
            <button
              type="button"
              className="tuner-reset-btn"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
