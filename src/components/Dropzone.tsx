import { useEffect, useRef, useState } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_BYTES = 8 * 1024 * 1024

interface Props {
  onImage: (dataUrl: string, file: File) => void
  onSelectSample?: (samplePath: string) => void
  disabled?: boolean
}

function BigUploadIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="big-upload-icon-svg"
    >
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <polyline points="16 9 12 5 8 9" />
      <line x1="12" y1="5" x2="12" y2="15" />
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
      setError('Unsupported format. Please upload a PNG, JPEG, WebP, or GIF screenshot.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('File is over 8 MB. Please upload a smaller screenshot.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onImage(String(reader.result), file)
    reader.onerror = () => setError('Could not read file. Try another screenshot.')
    reader.readAsDataURL(file)
  }

  // Handle direct image URL input
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim() || disabled) return

    setLoadingUrl(true)
    setError(null)

    try {
      const res = await fetch(urlInput.trim())
      if (!res.ok) throw new Error(`Could not fetch image (HTTP ${res.status})`)
      const blob = await res.blob()
      if (!ACCEPT.includes(blob.type)) {
        throw new Error('URL does not return a supported image (PNG, JPEG, WebP, or GIF).')
      }
      const file = new File([blob], 'url-screenshot.png', { type: blob.type })
      handleFile(file)
      setUrlInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image from URL. Check CORS or link.')
    } finally {
      setLoadingUrl(false)
    }
  }

  // Direct clipboard paste anywhere
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
    <div className="big-input-zone-container">
      {/* Extended Hero Input Dropzone Card */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload screenshot for dark pattern analysis. Drop a screenshot here or press Enter to browse files."
        className={`big-input-dropcard extended-dropcard${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
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
        {/* Subtle architectural corner markers */}
        <span className="editorial-corner-mark top-left" aria-hidden="true" />
        <span className="editorial-corner-mark top-right" aria-hidden="true" />
        <span className="editorial-corner-mark bottom-left" aria-hidden="true" />
        <span className="editorial-corner-mark bottom-right" aria-hidden="true" />

        <div className="extended-drop-inner">
          <div className="extended-icon-orb" aria-hidden="true">
            <BigUploadIcon />
          </div>

          <div className="extended-content-block">
            <h3 className="extended-primary-heading">
              Drop any screenshot here
            </h3>
            <p className="extended-subheading">
              or <span className="extended-browse-text">browse files</span> from your computer
            </p>

            <div className="extended-badges-row">
              <span className="extended-badge-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                PNG, JPEG, WebP up to 8MB
              </span>
              <span className="extended-badge-pill">
                <kbd className="big-input-kbd">⌘V</kbd> / <kbd className="big-input-kbd">Ctrl+V</kbd> paste anywhere
              </span>
            </div>
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

      {/* Direct URL / Link Input Field */}
      <form onSubmit={handleUrlSubmit} className="direct-url-input-form extended-url-form">
        <div className="direct-url-input-wrap extended-url-wrap">
          <span className="direct-url-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </span>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or enter public image URL to scan directly…"
            className="direct-url-input-field"
            disabled={disabled || loadingUrl}
          />
          <button
            type="submit"
            className="direct-url-submit-btn extended-url-btn"
            disabled={disabled || loadingUrl || !urlInput.trim()}
          >
            {loadingUrl ? 'Fetching…' : 'Scan URL ↗'}
          </button>
        </div>
      </form>

      {/* Quick Example Presets with descriptive pills */}
      {onSelectSample && (
        <div className="extended-sample-section">
          <div className="extended-sample-header">
            <span className="sample-chips-label">Or test drive a sample specimen:</span>
          </div>
          <div className="extended-sample-grid">
            <button
              type="button"
              className="extended-sample-card"
              onClick={() => onSelectSample('/mobile-checkout-specimen.png')}
            >
              <span className="sample-card-icon" aria-hidden="true">📱</span>
              <div className="sample-card-text">
                <span className="sample-card-title">Mobile Checkout</span>
                <span className="sample-card-desc">Fake urgency timer & auto-checked warranty</span>
              </div>
            </button>

            <button
              type="button"
              className="extended-sample-card"
              onClick={() => onSelectSample('/examples/example-dark-checkout.png')}
            >
              <span className="sample-card-icon" aria-hidden="true">⚡</span>
              <div className="sample-card-text">
                <span className="sample-card-title">Urgent Booking</span>
                <span className="sample-card-desc">Manufactured scarcity & countdown pressure</span>
              </div>
            </button>

            <button
              type="button"
              className="extended-sample-card"
              onClick={() => onSelectSample('/examples/example-tricky-wording.png')}
            >
              <span className="sample-card-icon" aria-hidden="true">🔒</span>
              <div className="sample-card-text">
                <span className="sample-card-title">Sneaky Consent</span>
                <span className="sample-card-desc">Pre-checked tracking & deceptive decline</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="editorial-dropzone-error" role="alert">
          <span className="error-indicator" aria-hidden="true">&times;</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
