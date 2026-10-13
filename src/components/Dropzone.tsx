import { useEffect, useRef, useState } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_BYTES = 8 * 1024 * 1024

const QUICK_PRESETS = [
  { label: 'Sneaky consent', file: '/examples/example-sneaky-consent.png' },
  { label: 'Fake urgency', file: '/examples/example-fake-urgency.png' },
  { label: 'Sneaky checkout', file: '/examples/example-dark-checkout.png' },
  { label: 'Clean cart', file: '/examples/example-clean-cart.png' },
]

interface Props {
  onImage: (dataUrl: string, file: File) => void
  disabled?: boolean
}

function ScannerUploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

export function Dropzone({ onImage, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    if (!ACCEPT.includes(file.type)) {
      setError('Please upload a PNG, JPEG, WebP or GIF screenshot.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('That image is over 8 MB — please upload a smaller screenshot.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onImage(String(reader.result), file)
    reader.onerror = () => setError('Could not read that file. Try another screenshot.')
    reader.readAsDataURL(file)
  }

  const loadPreset = async (preset: { label: string; file: string }) => {
    try {
      const res = await fetch(preset.file)
      const blob = await res.blob()
      const file = new File([blob], `${preset.label}.png`, { type: blob.type || 'image/png' })
      handleFile(file)
    } catch {
      setError('Could not load that preset. Please browse a file instead.')
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleFile(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [disabled])

  return (
    <div className="scan-station-card">
      <button
        type="button"
        className={`dropzone-trigger${dragging ? ' dragging' : ''}`}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
      >
        <div className="dropzone-corner-markers" aria-hidden="true">
          <span className="corner-mark top-left" />
          <span className="corner-mark top-right" />
          <span className="corner-mark bottom-left" />
          <span className="corner-mark bottom-right" />
        </div>

        <div className="dropzone-icon-ring">
          <ScannerUploadIcon />
        </div>
        <span className="dropzone-title">Drop suspect screenshot to scan</span>
        <span className="dropzone-sub">or click to browse from device (Ctrl+V to paste)</span>
        <div className="dropzone-metadata-row">
          <span className="dropzone-pill">PNG / JPG / WebP &lt; 8MB</span>
          <span className="dropzone-pill pill-security">Ephemeral Zero-Persistence</span>
        </div>
      </button>

      <div className="station-presets-row">
        <span className="presets-label">Instant Demo:</span>
        {QUICK_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="preset-chip-btn"
            disabled={disabled}
            onClick={() => void loadPreset(p)}
          >
            <span className="preset-chip-dot" aria-hidden="true" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {error && <p className="field-error-msg">{error}</p>}
    </div>
  )
}
