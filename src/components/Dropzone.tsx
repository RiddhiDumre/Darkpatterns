import { useEffect, useRef, useState } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_BYTES = 8 * 1024 * 1024

interface Props {
  onImage: (dataUrl: string, file: File) => void
  disabled?: boolean
}

function EditorialUploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="editorial-upload-icon"
    >
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <polyline points="16 9 12 5 8 9" />
      <line x1="12" y1="5" x2="12" y2="15" />
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
      setError('Unsupported format. Please upload a PNG, JPEG, WebP or GIF screenshot.')
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
    <div className="editorial-dropzone-wrapper">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload screenshot for dark pattern analysis. Drop a screenshot here or press Enter to browse files."
        className={`editorial-dropzone${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
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
        {/* Geometric corner markers inspired by editorial layout */}
        <span className="editorial-corner-mark top-left" aria-hidden="true" />
        <span className="editorial-corner-mark top-right" aria-hidden="true" />
        <span className="editorial-corner-mark bottom-left" aria-hidden="true" />
        <span className="editorial-corner-mark bottom-right" aria-hidden="true" />

        <div className="editorial-dropzone-inner">
          <div className="editorial-icon-badge" aria-hidden="true">
            <EditorialUploadIcon />
          </div>

          <div className="editorial-dropzone-text-group">
            <p className="editorial-drop-primary">
              Drop a screenshot here <span className="editorial-drop-secondary">or click to browse</span>
            </p>
            <p className="editorial-drop-format">
              PNG, JPEG, WebP up to 8MB &middot; Paste supported (Ctrl+V / &thinsp;&#8984;V)
            </p>
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

      {error && (
        <div className="editorial-dropzone-error" role="alert">
          <span className="error-indicator" aria-hidden="true">&times;</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
