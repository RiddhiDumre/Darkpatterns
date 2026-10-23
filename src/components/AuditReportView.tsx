import { useState } from 'react'
import type { Analysis, Finding } from '../../shared/types'

interface Props {
  imageSrc: string
  fileName?: string | null
  analysis: Analysis
  activeId: string | null
  onActivate: (id: string) => void
  onReset: () => void
  onNewUpload?: () => void
}

export function AuditReportView({
  imageSrc,
  fileName,
  analysis,
  activeId,
  onActivate,
  onReset,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const currentActive = activeId || hoveredId

  return (
    <section className="audit-report-container" aria-label="Dark pattern inspection report">
      {/* Top action navigation */}
      <div className="audit-top-nav">
        <button type="button" className="audit-back-btn" onClick={onReset}>
          &larr; Back to Home
        </button>
        <div className="audit-file-pill">
          <span className="audit-file-dot" />
          <span className="audit-file-name">{fileName || 'Uploaded screenshot'}</span>
        </div>
      </div>

      <div className="audit-main-grid">
        {/* LEFT COLUMN: Clean, Large, Legible Uploaded Screenshot with Interactive Bounding Boxes */}
        <div className="audit-image-left">
          <div className="audit-image-stage">
            <div className="audit-image-frame">
              <img
                src={imageSrc}
                alt={fileName || 'Audited screenshot'}
                className="audit-screen-img"
              />

              {/* Forensic Bounding Box Highlights */}
              {analysis.findings?.map((finding, idx) => {
                if (!finding.bbox) return null
                const isActive = currentActive === finding.id

                return (
                  <button
                    key={finding.id}
                    type="button"
                    className={`audit-screen-pin${isActive ? ' is-active' : ''} sev-${finding.severity}`}
                    style={{
                      left: `${finding.bbox.x}%`,
                      top: `${finding.bbox.y}%`,
                      width: `${finding.bbox.w}%`,
                      height: `${finding.bbox.h}%`,
                    }}
                    onClick={() => onActivate(finding.id)}
                    onMouseEnter={() => setHoveredId(finding.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-label={`Finding ${idx + 1}: ${finding.pattern}`}
                  >
                    <span className="audit-screen-pin-badge">{idx + 1}</span>
                    <span className="audit-screen-pin-title">{finding.pattern}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Forensic Notes Dossier */}
        <div className="audit-dossier-right">
          {/* Header & Verdict: Clean Open Editorial Layout */}
          <div className="audit-verdict-header">
            <h1 className="audit-verdict-title">
              What went <span className="audit-title-highlight">wrong</span> in this design.
            </h1>
            <p className="audit-verdict-summary">
              {analysis.summary ||
                'Here is a breakdown of the deceptive patterns, manipulative buttons, and psychological traps identified on this screen.'}
            </p>
          </div>

          {/* List of Clean, Concise Forensic Finding Cards */}
          <div className="audit-findings-list">
            {analysis.findings && analysis.findings.length > 0 ? (
              analysis.findings.map((finding: Finding, idx: number) => {
                const isActive = currentActive === finding.id
                return (
                  <div
                    key={finding.id}
                    className={`audit-note-card severity-${finding.severity}${isActive ? ' is-active' : ''}`}
                    onClick={() => onActivate(finding.id)}
                    onMouseEnter={() => setHoveredId(finding.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onActivate(finding.id)
                      }
                    }}
                  >
                    <div className="audit-note-header">
                      <span className="audit-note-num">{idx + 1}</span>
                      <div className="audit-note-title-wrap">
                        <h3 className="audit-note-pattern">{finding.pattern}</h3>
                      </div>
                      <span className={`audit-severity-pill sev-${finding.severity}`}>
                        {finding.severity}
                      </span>
                    </div>

                    {/* Concise, punchy explanation & evidence (no clutter/walls of text) */}
                    <div className="audit-note-body">
                      <p className="audit-concise-explanation">
                        {finding.explanation.replace(/\*\*/g, '')}
                      </p>

                      {finding.evidence && (
                        <div className="audit-evidence-inline">
                          <span className="audit-evidence-label">Offending UI:</span>
                          <span className="audit-evidence-tag">"{finding.evidence}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="audit-clean-card">
                <span className="audit-clean-icon">✨</span>
                <h3>No Deceptive Patterns Detected</h3>
                <p>
                  This screen passed the forensic check cleanly. No deceptive countdowns,
                  misleading opt-outs, or preselected charges were found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
