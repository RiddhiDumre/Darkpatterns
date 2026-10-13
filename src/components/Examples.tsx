import { useState } from 'react'

export interface ExampleItem {
  id: string
  label: string
  src: string
}

const EXAMPLES: ExampleItem[] = [
  { id: 'sneaky-consent', label: 'Sneaky consent', src: '/examples/example-sneaky-consent.png' },
  { id: 'fake-urgency', label: 'Fake urgency', src: '/examples/example-fake-urgency.png' },
  { id: 'tricky-wording', label: 'Tricky wording', src: '/examples/example-tricky-wording.png' },
  { id: 'hidden-nudges', label: 'Hidden nudges', src: '/examples/example-hidden-nudges.png' },
  { id: 'dark-checkout', label: 'Sneaky checkout', src: '/examples/example-dark-checkout.png' },
  { id: 'clean-cart', label: 'An honest cart', src: '/examples/example-clean-cart.png' },
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
    <section className="examples" id="examples">
      <div className="examples-head">
        <div>
          <span className="mono-sub">CASE PRECEDENTS // ARCHIVE</span>
          <h2>Suspect Exhibits on File</h2>
        </div>
        <button type="button" className="link-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer' : 'See all examples'}
          <svg className="link-arrow" viewBox="0 0 18 14" aria-hidden="true" fill="none">
            <path d="M1 7h14M11 2.5L15.5 7 11 11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="example-grid">
        {visible.map((ex) => (
          <button
            key={ex.id}
            type="button"
            className={`example-card${activeSrc === ex.src ? ' active' : ''}`}
            disabled={disabled}
            onClick={() => onSelect(ex.label, ex.src)}
          >
            <span className="example-thumb">
              <img src={ex.src} alt={`Example screenshot: ${ex.label}`} loading="lazy" />
            </span>
            <span className="example-label">{ex.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
