import { useEffect, useState, useCallback } from 'react'

const HOME_QUOTES = [
  '"Aha! Look at this sneakiness right here..."',
  '"A countdown timer that resets on refresh? Groundbreaking."',
  '"Pre-checked warranty for $9.95? That\'s a toll booth, not protection."',
  '"Notice how microscopic the \'No thanks\' link is? Classic misdirection."',
  '"Guilt-tripping you as \'reckless\'? Textbook confirmshaming."',
  '"They hid the delivery surge fee until step 3. Shameless."',
  '"Drop any checkout screenshot. Let\'s see what they\'re hiding."',
  '"I smell dark patterns in this cart... let\'s inspect the evidence."',
  '"Visual hierarchy engineered to pickpocket you with a smile."',
  '"Look at that neon primary button vs the invisible cancel link."',
  '"A subscription hidden inside an order? Caught red-handed."',
  '"Feel free to drag these post-its around... redecorate my crime scene!"',
]

const AUDIT_QUOTES = [
  '"The forensic evidence is clear. Caught red-handed."',
  '"Notice where they placed the trap? Classic growth-hacking stunt."',
  '"Tap any finding card to highlight the exact deceptive element."',
  '"Zero respect for user consent. CCPA guidelines violated."',
  '"They thought nobody was paying attention. We noticed."',
  '"Microscopic opt-outs and false urgency... textbook dark UI."',
]

interface Props {
  isAuditMode?: boolean
  activePattern?: string | null
}

export function DetectiveMascot({ isAuditMode = false, activePattern }: Props) {
  const quotes = isAuditMode ? AUDIT_QUOTES : HOME_QUOTES
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  // Rotate quotes periodically
  const cycleNext = useCallback(() => {
    setFade(false)
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % quotes.length)
      setFade(true)
    }, 200)
  }, [quotes.length])

  useEffect(() => {
    const timer = setInterval(cycleNext, 4600)
    return () => clearInterval(timer)
  }, [cycleNext])

  // If a specific pattern is active, optionally comment on it
  let currentQuote = quotes[index % quotes.length]
  if (activePattern) {
    if (activePattern.toLowerCase().includes('urgency')) {
      currentQuote = '"False Urgency: Manufacturing fake panic since 1999."'
    } else if (activePattern.toLowerCase().includes('preselection')) {
      currentQuote = '"Preselection: Quietly opting you into recurring bills."'
    } else if (activePattern.toLowerCase().includes('interference')) {
      currentQuote = '"Interface Interference: Giant green button vs invisible decline."'
    } else if (activePattern.toLowerCase().includes('confirmshaming')) {
      currentQuote = '"Confirmshaming: Emotional manipulation dressed as copy."'
    } else if (activePattern.toLowerCase().includes('cost')) {
      currentQuote = '"Hidden Costs: Sneaking in fees after you are committed."'
    }
  }

  return (
    <aside
      className={`detective-doodle-wrapper${isAuditMode ? ' audit-mode' : ''}`}
      aria-label="Detective mascot commentary"
      onClick={cycleNext}
      title="Click to hear what the detective thinks"
    >
      <div className={`detective-speech-bubble${fade ? ' is-visible' : ' is-fading'}`}>
        <span className="speech-quote">{currentQuote}</span>
        <div className="speech-bubble-tail" />
      </div>
      <img
        src="/detective-doodle.png"
        alt="Detective cartoon looking for dark pattern evidence with magnifying glass"
        className="detective-doodle-img"
        loading="lazy"
      />
    </aside>
  )
}
