import { useEffect, useMemo, useRef, useState } from 'react'
import type { Finding } from '../../shared/types'

interface Props {
  findings: Finding[]
  summary: string
  activeId: string | null
  onActivate: (id: string) => void
}

const SEVERITY_ORDER = {
  high: 3,
  medium: 2,
  low: 1,
}

const PATTERN_TRANSLATIONS: Record<string, string> = {
  Confirmshaming: 'Accept this offer or formally confess to being an irresponsible human being.',
  'Interface Interference': 'We are hoping that if we make the exit button ugly and invisible enough, you will just give up and buy it.',
  'False Urgency': 'This artificial timer will mysteriously reset if you refresh the page.',
  'Sneak into Basket': 'We quietly slipped an extra charge into your bag hoping you would not notice.',
  'Hidden Costs': 'The real price only appears right when you are too tired to abandon checkout.',
  'Forced Continuity': 'Signing up took one millisecond; canceling requires three confirmation quizzes and a phone call.',
  Preselection: 'We assumed you consented to all marketing spam and recurring renewals on earth.',
  'Trick Questions': 'We phrased this double-negative so confusingly that even our lawyers are guessing.',
  'Sneaky Consent': 'We asked nicely while secretly checking the box to track your entire digital life.',
}

function formatHighlightedText(text: string) {
  if (!text) return null
  if (text.includes('**')) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <mark key={idx} className="point-highlight">
            {part.slice(2, -2)}
          </mark>
        )
      }
      return part
    })
  }

  // Fallback: highlight common manipulative tactics if no markdown bolding was present
  const keywordsRegex =
    /(emotional guilt|guilt-tripping|personal flaw|humiliating|false urgency|fake countdown|sneaking fees|hidden fee|preselected|forced subscription|impossible to cancel|low-contrast|hidden link|asymmetric|deceptive|manipulative|pity party)/gi
  const parts = text.split(keywordsRegex)
  if (parts.length > 1) {
    return parts.map((part, idx) => {
      if (keywordsRegex.test(part)) {
        return (
          <mark key={idx} className="point-highlight">
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
  const [fixViewMode, setFixViewMode] = useState<Record<string, 'after' | 'before'>>({})

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

  const toggleFix = (id: string, mode: 'after' | 'before') => {
    setFixViewMode((prev) => ({ ...prev, [id]: mode }))
  }

  if (findings.length === 0) {
    return (
      <div className="forensic-findings-panel">
        <div className="all-clear-box">
          <div className="all-clear-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="all-clear-title">Suspiciously wholesome</h3>
          <p className="all-clear-desc">
            {summary || 'No manipulative urgency, fake scarcity, or emotional hostage-taking detected. Either this company genuinely respects you, or their growth hacker called in sick today.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="forensic-findings-panel">
      <div className="findings-panel-header">
        <span className="findings-panel-title">
          {findings.length} Flagged {findings.length === 1 ? 'Trap' : 'Traps'}
        </span>
        <span className="findings-panel-sub">
          Ranked by shamelessness
        </span>
      </div>

      <ol className="findings-scroll-list">
        {sortedFindings.map((f, i) => {
          const isActive = activeId === f.id
          const currentFix = fixViewMode[f.id] || 'after'
          const translationText = f.translation || PATTERN_TRANSLATIONS[f.pattern] || ''
          return (
            <li
              key={f.id}
              ref={isActive ? activeRef : null}
              className={`finding-card${isActive ? ' active' : ''}`}
              onMouseEnter={() => onActivate(f.id)}
              onClick={() => onActivate(f.id)}
            >
              <div className="finding-header-row">
                <div className="finding-title-group">
                  <span className="finding-index-num">{i + 1}</span>
                  <h3 className="finding-pattern-name">{f.pattern}</h3>
                </div>
                <div className="finding-severity-inline">
                  <span className={`severity-dot sev-${f.severity}`} aria-hidden="true" />
                  <span className="severity-word">{f.severity} severity</span>
                </div>
              </div>

              {f.guideline && (
                <div className="finding-reference-tag">
                  <span>Reference: {f.guideline}</span>
                </div>
              )}

              {translationText && (
                <div className="finding-translation-callout">
                  <span className="translation-badge">Reality Check</span>
                  <span className="translation-text">“{translationText}”</span>
                </div>
              )}

              <p className="finding-explanation-text">{formatHighlightedText(f.explanation)}</p>

              {f.evidence && (
                <div className="finding-evidence-box">
                  <span className="evidence-box-label">Quoted from interface:</span>
                  <blockquote className="evidence-quote-content">
                    “{f.evidence}”
                  </blockquote>
                </div>
              )}

              {/* Interactive Before/After Visual Fix Specimen */}
              <div className="finding-fix-specimen">
                <div className="fix-specimen-toolbar">
                  <span className="fix-toolbar-title">Ethical Interface Alternative</span>
                  <div className="fix-toggle-pill">
                    <button
                      type="button"
                      className={`fix-toggle-btn${currentFix === 'before' ? ' active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFix(f.id, 'before')
                      }}
                    >
                      The Trap
                    </button>
                    <button
                      type="button"
                      className={`fix-toggle-btn${currentFix === 'after' ? ' active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFix(f.id, 'after')
                      }}
                    >
                      Honest Fix
                    </button>
                  </div>
                </div>

                <div className="fix-specimen-stage">
                  {currentFix === 'before' ? (
                    <div className="specimen-view state-flagged">
                      <div className="specimen-meta-row">
                        <span className="specimen-state-tag tag-flagged">As Flagged (Maximum Coercion)</span>
                      </div>
                      <div className="mock-ui-interactive flagged-mock">
                        <div className="mock-btn-flagged-primary">Accept & Surrender Dignity</div>
                        <div className="mock-btn-flagged-shame">“{f.evidence || 'Manipulative link'}”</div>
                      </div>
                    </div>
                  ) : (
                    <div className="specimen-view state-remedy">
                      <div className="specimen-meta-row">
                        <span className="specimen-state-tag tag-remedy">Honest Fix (Basic Decency)</span>
                      </div>
                      <div className="mock-ui-interactive remedy-mock">
                        <div className="mock-button-pair">
                          <div className="mock-btn-remedy-secondary">No thanks</div>
                          <div className="mock-btn-remedy-primary">Continue</div>
                        </div>
                        <div className="mock-remedy-guidance">{f.recommendation || 'Provide neutral choices with equal visual weight.'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
