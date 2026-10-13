import { useState } from 'react'

export interface ExampleItem {
  id: string
  label: string
  category: string
  status: string
  src: string
  scoreBadge?: string
}

const EXAMPLES: ExampleItem[] = [
  {
    id: 'tricky-wording',
    label: 'Tricky wording',
    category: 'Confirmshaming',
    status: 'High Deception',
    scoreBadge: '82/100',
    src: '/examples/example-tricky-wording.png',
  },
  {
    id: 'fake-urgency',
    label: 'Fake urgency',
    category: 'False Urgency',
    status: 'Fabricated Countdown',
    scoreBadge: '78/100',
    src: '/examples/example-fake-urgency.png',
  },
  {
    id: 'dark-checkout',
    label: 'Sneaky checkout',
    category: 'Sneak into Basket',
    status: 'Hidden Preselections',
    scoreBadge: '89/100',
    src: '/examples/example-dark-checkout.png',
  },
  {
    id: 'sneaky-consent',
    label: 'Sneaky consent',
    category: 'Privacy Zuckering',
    status: 'Pre-Ticked Tracking',
    scoreBadge: '74/100',
    src: '/examples/example-sneaky-consent.png',
  },
  {
    id: 'hidden-nudges',
    label: 'Hidden nudges',
    category: 'Interface Interference',
    status: 'Visual Asymmetry',
    scoreBadge: '68/100',
    src: '/examples/example-hidden-nudges.png',
  },
  {
    id: 'clean-cart',
    label: 'An honest cart',
    category: 'Ethical Baseline',
    status: 'Control Exhibit',
    scoreBadge: '0/100 Clean',
    src: '/examples/example-clean-cart.png',
  },
]

interface Props {
  onSelect: (label: string, src: string) => void
  activeSrc: string | null
  disabled?: boolean
}

export function Examples({ onSelect, activeSrc, disabled = false }: Props) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? EXAMPLES : EXAMPLES.slice(0, 4)

  return (
    <section className="examples-section" id="examples">
      <div className="examples-head">
        <div className="examples-title-group">
          <div className="archive-badge-wrap">
            <span className="archive-dot" aria-hidden="true" />
            <span className="mono-sub">CASE EXHIBITS // THE ARCHIVE</span>
          </div>
          <h2>Suspect Exhibits on File</h2>
          <p className="examples-subhead">
            Curated specimens of deceptive UX and honest baselines. Click any card to launch an instant forensic audit.
          </p>
        </div>
        <button
          type="button"
          className="link-more-pill"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
        >
          <span>{showAll ? 'Collapse Archive' : 'Explore All 6 Specimens'}</span>
          <svg className="link-arrow" viewBox="0 0 18 14" aria-hidden="true" fill="none">
            <path
              d="M1 7h14M11 2.5L15.5 7 11 11.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="example-grid">
        {visible.map((ex, idx) => {
          const isHonest = ex.id === 'clean-cart'
          return (
            <button
              key={ex.id}
              type="button"
              className={`example-card${activeSrc === ex.src ? ' active' : ''}${isHonest ? ' honest-card' : ''}`}
              disabled={disabled}
              onClick={() => onSelect(ex.label, ex.src)}
            >
              <div className="example-card-inner">
                <div className="example-thumb-frame">
                  <img src={ex.src} alt={`Exhibit: ${ex.label}`} loading="lazy" className="example-thumb-img" />
                  <div className="example-hover-lens" aria-hidden="true">
                    <span className="lens-pill">Inspect Exhibit ↗</span>
                  </div>
                  <span className={`example-score-badge ${isHonest ? 'score-clean' : 'score-flagged'}`}>
                    {ex.scoreBadge}
                  </span>
                </div>
                <div className="example-meta-block">
                  <div className="example-meta-header">
                    <span className="example-num">#{String(idx + 1).padStart(2, '0')}</span>
                    <span className="example-category-pill">{ex.category}</span>
                  </div>
                  <h3 className="example-label">{ex.label}</h3>
                  <span className="example-status-sub">{ex.status}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
