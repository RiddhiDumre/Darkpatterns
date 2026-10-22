import { useEffect } from 'react'

interface Props {
  isReady: boolean
  stepText: string
  previewUrl: string | null
  onCancel: () => void
  onTransitionComplete: () => void
}

export function AnalysisLoadingOverlay({
  isReady,
  stepText,
  previewUrl,
  onCancel,
  onTransitionComplete,
}: Props) {
  useEffect(() => {
    if (isReady) {
      // Smooth brief settle then transition directly to display findings
      const timer = setTimeout(() => {
        onTransitionComplete()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isReady, onTransitionComplete])

  return (
    <div className="clean-analysis-overlay" role="dialog" aria-modal="true" aria-label="Analyzing screenshot for dark patterns">
      <div className="clean-analysis-card">
        {/* Radar Spinner & Header */}
        <div className="clean-analysis-header">
          <div className="clean-analysis-spinner" aria-hidden="true" />
          <div className="clean-analysis-headings">
            <h3 className="clean-analysis-title">Auditing screenshot…</h3>
            <p className="clean-analysis-step">{stepText}</p>
          </div>
        </div>

        {/* Thumbnail preview with scanline effect */}
        {previewUrl && (
          <div className="clean-analysis-preview-frame">
            <img src={previewUrl} alt="Uploaded screenshot being audited" className="clean-analysis-thumb" />
            <div className="clean-analysis-scanline" aria-hidden="true" />
          </div>
        )}

        <div className="clean-analysis-footer">
          <button
            type="button"
            className="clean-analysis-cancel-btn"
            onClick={onCancel}
          >
            Cancel analysis
          </button>
        </div>
      </div>
    </div>
  )
}
