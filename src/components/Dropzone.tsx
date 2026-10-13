import { useRef, useState } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_BYTES = 8 * 1024 * 1024

interface Props {
  onImage: (dataUrl: string, file: File) => void
  compact?: boolean
  disabled?: boolean
}

function ImagePlusIcon() {
  return (
    <svg className="dz-icon" viewBox="0 0 72 64" aria-hidden="true" fill="none">
      <rect x="8" y="14" width="40" height="33" rx="7" stroke="#14141B" strokeWidth="3.5" />
      <circle cx="21" cy="26" r="4.5" stroke="#14141B" strokeWidth="3" />
      <path
        d="M11 43 l12 -13 8 8 6 -6 10 11"
        stroke="#14141B"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="47" cy="43" r="13" fill="#FF5C8A" stroke="#14141B" strokeWidth="3.5" />
      <path d="M47 37.5 v11 M41.5 43 h11" stroke="#14141B" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 10 l6 -6 M61 20 h9 M52 7 l2 -6" stroke="#14141B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Dropzone({ onImage, compact = false, disabled = false }: Props) {
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

  return (
    <div className="dropzone-wrap">
      <button
        type="button"
        className={`dropzone${compact ? ' compact' : ''}${dragging ? ' dragging' : ''}`}
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
        {!compact && <ImagePlusIcon />}
        <span className="dz-title">{compact ? 'Drop another screenshot' : 'Drop a screenshot here'}</span>
        {!compact && (
          <span className="dz-sub">
            or click to browse — PNG, JPG, WebP or GIF
            <br />
            (up to 8 MB)
          </span>
        )}
      </button>
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
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
