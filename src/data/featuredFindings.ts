import type { Analysis } from '../../shared/types'
import type { ScribbleFinding } from '../components/Phone3DCanvas'

export const FEATURED_HERO_FINDINGS: ScribbleFinding[] = [
  {
    id: 'feat-1',
    pattern: 'False Urgency',
    severity: 'high',
    evidence: 'Only 2 left in stock — High demand & Sale ends in 02:14:33',
    explanation:
      'Fabricates artificial inventory scarcity and a ticking 2-hour countdown timer to create panic and rush the purchase decision before the user can compare options.',
    translation: 'Buy this right now without thinking, before you realize you do not actually need it.',
    recommendation: 'Display authentic inventory counts without ticking countdown clocks designed to trigger FOMO.',
    guideline: 'CCPA 2023 Guideline 5(b): False Urgency',
    bbox: { x: 6.2, y: 32.0, w: 87.7, h: 8.3 },
    patternTitle: 'False Urgency',
    explanationText: 'Resetting countdown timer to panic you into buying before comparing options',
    side: 'right',
  },
  {
    id: 'feat-2',
    pattern: 'Preselection',
    severity: 'high',
    evidence: 'Add 2-Year Extended Care Warranty (+$9.95/month, Pre-selected)',
    explanation:
      'Pre-checks an optional recurring monthly warranty, silently tacking recurring fees onto the order total without affirmative consent.',
    translation: 'We took the liberty of adding an extra recurring subscription to your order.',
    recommendation: 'Leave all optional protection plans and warranty add-ons unchecked by default.',
    guideline: 'CCPA 2023 Guideline 5(h): Preselection',
    bbox: { x: 6.2, y: 40.0, w: 87.7, h: 10.1 },
    patternTitle: 'Preselection',
    explanationText: 'Silently auto-checks an extra $9.95/mo recurring warranty fee',
    side: 'left',
  },
  {
    id: 'feat-3',
    pattern: 'Interface Interference',
    severity: 'medium',
    evidence: 'Complete Order — $59.94 (Oversized Primary Button)',
    explanation:
      'Gives the order button maximum visual prominence while camouflaging the decline option in microscopic low-contrast text.',
    translation: 'Follow the giant button. Pretend the faint text does not exist.',
    recommendation: 'Provide balanced visual weight and accessible contrast for both accept and decline actions.',
    guideline: 'CCPA 2023 Guideline 5(f): Interface Interference',
    bbox: { x: 6.2, y: 64.0, w: 87.7, h: 5.9 },
    patternTitle: 'Interface Interference',
    explanationText: 'Giant primary button vs camouflaged microscopic decline text',
    side: 'left',
  },
  {
    id: 'feat-4',
    pattern: 'Confirmshaming',
    severity: 'medium',
    evidence: 'No thanks, I will pay full price for future repairs (Decline link)',
    explanation:
      'Frames opting out of the protection plan as reckless personal behavior to guilt-trip users into buying coverage.',
    translation: 'Either buy our warranty or admit you make irresponsible life choices.',
    recommendation: 'Use neutral, dignified decline options like "No thanks" or "Continue without coverage".',
    guideline: 'CCPA 2023 Guideline 5(c): Confirmshaming',
    bbox: { x: 20.0, y: 72.0, w: 60.0, h: 3.8 },
    patternTitle: 'Confirmshaming',
    explanationText: 'Guilt-trips you as "reckless" for simply declining paid coverage',
    side: 'right',
  },
]

export const FEATURED_HERO_ANALYSIS: Analysis = {
  score: 88,
  verdict: '4 manipulative patterns detected on mobile checkout screen',
  summary:
    'This mobile checkout interface deploys manufactured urgency timers, pre-checked recurring monthly warranty fees, and asymmetric confirmshaming decline copy.',
  findings: FEATURED_HERO_FINDINGS,
}
