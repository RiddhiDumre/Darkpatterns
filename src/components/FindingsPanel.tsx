import { useEffect, useMemo, useRef } from 'react'
import type { Finding } from '../../shared/types'

interface Props {
  findings: Finding[]
  summary?: string
  activeId: string | null
  onActivate: (id: string) => void
}

const SEVERITY_ORDER = {
  high: 3,
  medium: 2,
  low: 1,
}

function formatHighlightedText(text: string) {
  if (!text) return null
  if (text.includes('**')) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <mark key={idx} className="editorial-text-highlight">
            {part.slice(2, -2)}
          </mark>
        )
      }
      return part
    })
  }

  const keywordsRegex =
    /(emotional guilt|guilt-tripping|personal flaw|humiliating|false urgency|fake countdown|sneaking fees|hidden fee|preselected|forced subscription|impossible to cancel|low-contrast|hidden link|asymmetric|deceptive|manipulative)/gi
  const parts = text.split(keywordsRegex)
  if (parts.length > 1) {
    return parts.map((part, idx) => {
      if (keywordsRegex.test(part)) {
        return (
          <mark key={idx} className="editorial-text-highlight">
            {part}
          </mark>
        )
      }
      return part
    })
  }

  return text
}

export function FindingsPanel({ findings, summary, activeId, onActivate }: Props) {
  const activeRef = useRef<HTMLLIElement>(null)

  const sortedFindings = useMemo(() => {
    return [...findings].sort((a, b) => {
      const weightA = SEVERITY_ORDER[a.severity] || 0
      const weightB = SEVERITY_ORDER[b.severity] || 0
      return weightB - weightA
    })
  }, [findings])

  useEffect(() => {
    if (activeId) {
      activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  if (findings.length === 0) {
    return (
      <div className="editorial-findings-container">
        <div className="editorial-all-clear">
          <div className="all-clear-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="editorial-mono-label">[VERDICT: CLEAN]</span>
          <h3 className="all-clear-title">Nothing Suspicious Detected</h3>
          <p className="all-clear-description">
            {summary ||
              'All scanned elements provide neutral, transparent choices. No deceptive urgency, hidden costs, or manipulative tricks were found.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="editorial-findings-container">
      <div className="editorial-findings-header">
        <div className="editorial-header-left">
          <span className="editorial-mono-label">[EVIDENCE DOSSIER]</span>
          <h2 className="editorial-findings-title">
            {findings.length} {findings.length === 1 ? 'Pattern Detected' : 'Patterns Detected'}
          </h2>
        </div>
        <span className="editorial-header-annotation">Click item to pinpoint</span>
      </div>

      <ol className="editorial-findings-list">
        {sortedFindings.map((f, i) => {
          const isActive = activeId === f.id
          const formattedIndex = String(i + 1).padStart(2, '0')

          return (
            <li
              key={f.id}
              ref={isActive ? activeRef : null}
              className={`editorial-finding-item${isActive ? ' is-active' : ''}`}
              onMouseEnter={() => onActivate(f.id)}
              onClick={() => onActivate(f.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onActivate(f.id)
                }
              }}
              role="button"
              aria-pressed={isActive}
            >
              <div className="finding-top-row">
                <div className="finding-number-title">
                  <span className="finding-oversized-num" aria-hidden="true">
                    {formattedIndex}
                  </span>
                  <div className="finding-heading-meta">
                    <h3 className="finding-pattern-title">{f.pattern}</h3>
                    {f.guideline && (
                      <span className="finding-guideline-mono">{f.guideline}</span>
                    )}
                  </div>
                </div>

                {f.severity && (
                  <span className={`finding-severity-tag sev-${f.severity}`}>
                    {f.severity.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="finding-body">
                <p className="finding-explanation-text">
                  {formatHighlightedText(f.explanation)}
                </p>

                {f.evidence && (
                  <div className="finding-evidence-quote-box">
                    <span className="evidence-quote-label">Observed Evidence:</span>
                    <blockquote className="evidence-quote-text">
                      &ldquo;{f.evidence}&rdquo;
                    </blockquote>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
