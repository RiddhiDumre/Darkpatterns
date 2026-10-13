import { useEffect, useRef, useState } from 'react'
import type { Analysis } from '../../shared/types'

interface Props {
  analysis: Analysis
  activeId: string | null
  onActivate: (id: string) => void
}

export function BulbIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18.5h6M10 21.5h4" />
      <path d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.7.5 1.1 1.3 1.1 2.2h5.6c0-.9.4-1.7 1.1-2.2A6.5 6.5 0 0 0 12 2.5z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="chev-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
      <path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FindingsPanel({ analysis, activeId, onActivate }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const activeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (activeId) activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeId])

  if (analysis.findings.length === 0) {
    return (
      <div className="all-clear">
        <span className="all-clear-bulb">
          <BulbIcon size={24} />
        </span>
        <div>
          <strong>No dark patterns detected</strong>
          <p>{analysis.summary}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="findings-col">
      <p className="results-summary">{analysis.summary}</p>
      <ol className="findings">
        {analysis.findings.map((f, i) => {
          const open = openId === f.id
          return (
            <li
              key={f.id}
              ref={activeId === f.id ? activeRef : null}
              className={`find-card${activeId === f.id ? ' active' : ''}`}
              onMouseEnter={() => onActivate(f.id)}
            >
              <button
                type="button"
                className="find-head"
                aria-expanded={open}
                onClick={() => {
                  setOpenId(open ? null : f.id)
                  onActivate(f.id)
                }}
              >
                <span className={`find-num sev-${f.severity}`}>{i + 1}</span>
                <span className="find-titles">
                  <span className="find-name">{f.pattern}</span>
                  <span className={`pill sev-${f.severity}`}>{f.severity}</span>
                </span>
                <span className={`chev${open ? ' open' : ''}`}>
                  <ChevronIcon />
                </span>
              </button>
              <div className="find-body">
                <p className="find-desc">{f.explanation}</p>
                {f.evidence && (
                  <div className="tip">
                    <span className="tip-icon">
                      <BulbIcon />
                    </span>
                    <span>“{f.evidence}”</span>
                  </div>
                )}
                {open && (
                  <div className="find-fix">
                    <strong>Suggested fix:</strong> {f.recommendation || 'No specific fix suggested.'}
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
