import { useMemo } from 'react'
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

export function FindingsPanel({ findings, summary, activeId, onActivate }: Props) {
  const sortedFindings = useMemo(() => {
    return [...findings].sort((a, b) => {
      const weightA = SEVERITY_ORDER[a.severity] || 0
      const weightB = SEVERITY_ORDER[b.severity] || 0
      return weightB - weightA
    })
  }, [findings])

  if (findings.length === 0) {
    return (
      <div className="bujo-notes-container">
        <h2 className="bujo-section-title">Notes:</h2>
        <ul className="bujo-bullet-list">
          <li className="bujo-bullet-item">
            <span className="bujo-bullet-marker" aria-hidden="true">&bull;</span>
            <span className="bujo-bullet-content">
              <strong>All clear</strong> &mdash; {summary || 'No sneaky tricks, fake countdowns, or manipulative choices found on this screen.'}
            </span>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className="bujo-notes-container">
      <h2 className="bujo-section-title">Dark patterns spotted:</h2>

      <ul className="bujo-bullet-list">
        {sortedFindings.map((f, i) => {
          const isActive = activeId === f.id
          // Strip markdown asterisks for clean bullet journal reading
          const cleanText = f.explanation.replace(/\*\*/g, '')

          return (
            <li
              key={f.id}
              className={`bujo-bullet-item${isActive ? ' is-active' : ''}`}
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
              <span className="bujo-bullet-marker" aria-hidden="true">
                {i + 1}.
              </span>
              <p className="bujo-bullet-content">
                <strong className="bujo-pattern-name">{f.pattern}</strong>
                <span className="bujo-dash"> &mdash; </span>
                <span className="bujo-explanation">{cleanText}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
