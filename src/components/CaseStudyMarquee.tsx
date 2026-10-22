export interface CaseStudyItem {
  company: string
  pattern: string
  fine: string
  year: string
  iconBg: string
  iconChar: string
}

const SHAME_CASES: CaseStudyItem[] = [
  {
    company: 'Amazon Prime',
    pattern: 'Roach Motel · 6-Step Hidden Cancellation',
    fine: 'FTC Lawsuit 2023',
    year: '2023',
    iconBg: '#ff9900',
    iconChar: 'a',
  },
  {
    company: 'Epic Games',
    pattern: 'Sneak into Basket & Tricky Button Config',
    fine: '$520M FTC Penalty',
    year: '2022',
    iconBg: '#232323',
    iconChar: 'E',
  },
  {
    company: 'Ryanair',
    pattern: 'Camouflaged Seat Insurance & Misdirection',
    fine: 'EU ASA Ban',
    year: '2021',
    iconBg: '#073590',
    iconChar: 'R',
  },
  {
    company: 'Temu',
    pattern: 'Fake Spin-the-Wheel Urgency & Countdown Panic',
    fine: 'Consumer Watchlist',
    year: '2024',
    iconBg: '#fb7701',
    iconChar: 'T',
  },
  {
    company: 'LinkedIn',
    pattern: 'Friend Spam & Address Book Harvesting',
    fine: '$13M Settlement',
    year: '2015',
    iconBg: '#0077b5',
    iconChar: 'in',
  },
  {
    company: 'Match Group',
    pattern: 'Fake Love Messages on Free Accounts',
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
      <div className="case-marquee-label">
        <span className="case-marquee-dot" />
        <span>Forensic Evidence Dossier · Hall of Shame</span>
      </div>
      <div className="case-marquee-track-wrapper">
        <div className="case-marquee-track">
          {items.map((item, index) => (
            <div key={`${item.company}-${index}`} className="case-doodle-frame-card">
              {/* Four Hand-Drawn Triangular Photo Corner Tabs */}
              <div className="doodle-corner corner-top-left" aria-hidden="true" />
              <div className="doodle-corner corner-top-right" aria-hidden="true" />
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
                  <span className="case-pattern-desc">{item.pattern}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
