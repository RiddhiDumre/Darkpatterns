export interface CaseStudyItem {
  company: string
  patternBefore: string
  patternSquiggle: string
  patternAfter: string
  fine: string
  year: string
  iconBg: string
  iconChar: string
}

const SHAME_CASES: CaseStudyItem[] = [
  {
    company: 'Amazon Prime',
    patternBefore: '',
    patternSquiggle: 'Roach Motel',
    patternAfter: ' · 6-Step Hidden Cancellation Maze',
    fine: 'FTC Lawsuit 2023',
    year: '2023',
    iconBg: '#ff9900',
    iconChar: 'a',
  },
  {
    company: 'Epic Games',
    patternBefore: '',
    patternSquiggle: 'Sneak into Basket',
    patternAfter: ' & Tricky Dark UI Configuration',
    fine: '$520M FTC Penalty',
    year: '2022',
    iconBg: '#232323',
    iconChar: 'E',
  },
  {
    company: 'Ryanair',
    patternBefore: 'Camouflaged Seat Insurance & ',
    patternSquiggle: 'Misdirection',
    patternAfter: '',
    fine: 'EU ASA Ban',
    year: '2021',
    iconBg: '#073590',
    iconChar: 'R',
  },
  {
    company: 'Temu',
    patternBefore: 'Fake Spin-the-Wheel Urgency & ',
    patternSquiggle: 'Countdown Panic',
    patternAfter: '',
    fine: 'Consumer Watchlist',
    year: '2024',
    iconBg: '#fb7701',
    iconChar: 'T',
  },
  {
    company: 'LinkedIn',
    patternBefore: '',
    patternSquiggle: 'Friend Spam',
    patternAfter: ' & Deceptive Address Book Harvesting',
    fine: '$13M Settlement',
    year: '2015',
    iconBg: '#0077b5',
    iconChar: 'in',
  },
  {
    company: 'Match Group',
    patternBefore: 'Manufactured ',
    patternSquiggle: 'Fake Love Messages',
    patternAfter: ' on Free Accounts',
    fine: 'FTC Action',
    year: '2019',
    iconBg: '#ff4458',
    iconChar: 'M',
  },
]

export function CaseStudyMarquee() {
  // Duplicate array so marquee scrolls continuously and seamlessly
  const items = [...SHAME_CASES, ...SHAME_CASES]

  return (
    <div className="case-marquee-container" aria-label="Hall of Deceptive Patterns Hall of Fame">
      <div className="case-marquee-heading-wrap">
        <h3 className="case-marquee-title">
          <span className="case-title-highlight">DECEPTIVE PATTERN HALL OF SHAME</span>
        </h3>
      </div>
      <div className="case-marquee-track-wrapper">
        <div className="case-marquee-track">
          {items.map((item, index) => (
            <div key={`${item.company}-${index}`} className="case-doodle-frame-card">
              {/* Three Hand-Drawn Triangular Photo Corner Tabs (Top-Right open/rounded as requested) */}
              <div className="doodle-corner corner-top-left" aria-hidden="true" />
              <div className="doodle-corner corner-bottom-left" aria-hidden="true" />
              <div className="doodle-corner corner-bottom-right" aria-hidden="true" />

              {/* Inner Hand-Drawn Card Frame */}
              <div className="case-frame-inner-mat">
                <span className="case-icon-badge" style={{ backgroundColor: item.iconBg }}>
                  {item.iconChar}
                </span>
                <div className="case-text-group">
                  <div className="case-title-row">
                    <span className="case-company-name">{item.company}</span>
                    <span className="case-fine-badge">{item.fine}</span>
                  </div>
                  <span className="case-pattern-desc">
                    {item.patternBefore}
                    <span className="doodle-squiggle-under">
                      {item.patternSquiggle}
                      <svg className="squiggle-svg-under" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M 0 5 Q 12 1 25 5 Q 38 9 50 5 Q 62 1 75 5 Q 88 9 100 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    {item.patternAfter}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
