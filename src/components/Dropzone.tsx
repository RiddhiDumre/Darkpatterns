import { useEffect, useRef, useState } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_BYTES = 8 * 1024 * 1024

interface Props {
  onImage: (dataUrl: string, file: File) => void
  onSelectSample?: (samplePath: string) => void
  disabled?: boolean
}

function UploadIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="clean-upload-svg"
    >
      <path d="M4 16.5v2.25A2.25 2.25 0 0 0 6.25 21h11.5A2.25 2.25 0 0 0 20 18.75V16.5" />
      <polyline points="7.5 9.75 12 5.25 16.5 9.75" />
      <line x1="12" y1="5.25" x2="12" y2="15.75" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function EyeTargetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  )
}

export function Dropzone({ onImage, onSelectSample, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [loadingUrl, setLoadingUrl] = useState(false)

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    if (!ACCEPT.includes(file.type)) {
      setError('Please upload a PNG, JPEG, WebP, or GIF screenshot.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('File is over 8 MB. Please choose a smaller image.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onImage(String(reader.result), file)
    reader.onerror = () => setError('Could not read file. Please try another screenshot.')
    reader.readAsDataURL(file)
  }

  // Handle direct image URL input
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetUrl = urlInput.trim()
    if (!targetUrl || disabled) return

    setLoadingUrl(true)
    setError(null)

    try {
      const res = await fetch(targetUrl)
      if (!res.ok) throw new Error(`Could not fetch image (${res.status})`)
      const blob = await res.blob()
      if (!ACCEPT.includes(blob.type)) {
        throw new Error('Link must point directly to a PNG, JPEG, or WebP image.')
      }
      const file = new File([blob], 'scanned-screenshot.png', { type: blob.type })
      handleFile(file)
      setUrlInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch image. Check the URL.')
    } finally {
      setLoadingUrl(false)
    }
  }

  // Global clipboard paste support
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
    <div className="clean-dropzone-stack">
      {/* Primary Drop Canvas */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Drop screenshot or click to browse files"
        className={`clean-dropzone-canvas${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!disabled) {
            handleFile(e.dataTransfer.files?.[0])
          }
        }}
      >
        <div className="clean-dropzone-content">
          <div className="clean-upload-badge" aria-hidden="true">
            <UploadIcon />
          </div>

          <div className="clean-dropzone-headings">
            <h3 className="clean-dropzone-title">
              Drop screenshot here, or browse files
            </h3>
            <p className="clean-dropzone-desc">
              Supports PNG, JPG, WebP · <kbd className="clean-kbd">⌘V</kbd> paste anywhere
            </p>
          </div>

          <div className="clean-upload-cta-row">
            <button
              type="button"
              className="clean-browse-cta-btn"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              Choose Screenshot
            </button>
          </div>

          <div className="clean-trust-badge-row">
            <span className="clean-trust-pill">
              <BoltIcon /> Instant Vision Scan
            </span>
            <span className="clean-trust-pill">
              <EyeTargetIcon /> Region Highlights
            </span>
            <span className="clean-trust-pill">
              <ShieldCheckIcon /> Zero Data Retention
            </span>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        aria-hidden="true"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {/* Secondary URL Input Bar */}
      <form onSubmit={handleUrlSubmit} className="clean-url-bar">
        <span className="clean-url-icon" aria-hidden="true">
          <LinkIcon />
        </span>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste direct image URL to scan…"
          className="clean-url-input"
          disabled={disabled || loadingUrl}
        />
        <button
          type="submit"
          className="clean-url-btn"
          disabled={disabled || loadingUrl || !urlInput.trim()}
        >
          {loadingUrl ? 'Loading…' : 'Scan URL'}
        </button>
      </form>

      {/* Curated Sample Specimen Chips */}
      {onSelectSample && (
        <div className="clean-sample-row">
          <span className="clean-sample-label">Or test an example:</span>
          <div className="clean-sample-chips">
            <button
              type="button"
              className="clean-sample-chip"
              onClick={() => onSelectSample('/mobile-checkout-specimen.png')}
            >
              <span className="chip-badge">Checkout</span>
              <span className="chip-desc">Sneak-in fee & urgency</span>
            </button>
            <button
              type="button"
              className="clean-sample-chip"
              onClick={() => onSelectSample('/examples/example-dark-checkout.png')}
            >
              <span className="chip-badge">Booking</span>
              <span className="chip-desc">Fake scarcity counter</span>
            </button>
            <button
              type="button"
              className="clean-sample-chip"
              onClick={() => onSelectSample('/examples/example-tricky-wording.png')}
            >
              <span className="chip-badge">Consent</span>
              <span className="chip-desc">Guilt-trip decline</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="clean-dropzone-error" role="alert">
          <span className="error-dot" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
