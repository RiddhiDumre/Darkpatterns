import type { Analysis, Finding } from '../../shared/types'

export const FEATURED_HERO_FINDINGS: Finding[] = [
  {
    id: 'feat-1',
    pattern: 'False Urgency',
    severity: 'high',
    evidence: 'Only 2 left in stock & Sale ends in 02:14:33',
    explanation:
      'Fabricates artificial inventory scarcity and a ticking 2-hour timer to create panic and rush the purchase decision before the user can compare options.',
    translation: 'Buy this right now without thinking, before you realize you do not actually need it.',
    recommendation: 'Display authentic inventory counts without ticking countdown clocks designed to trigger FOMO.',
    guideline: 'CCPA 2023 Guideline 5(b): False Urgency',
    bbox: { x: 7.2, y: 24.2, w: 23.5, h: 14.0 },
  },
  {
    id: 'feat-2',
    pattern: 'Preselection',
    severity: 'high',
    evidence: 'Add 2-year protection plan - $9.95/month (Default checked)',
    explanation:
      'Pre-checks an optional recurring monthly warranty, silently tacking recurring fees onto the order total without affirmative consent.',
    translation: 'We pre-selected an extra recurring subscription for you and hope you do not notice it.',
    recommendation: 'Leave all optional protection plans and warranty add-ons unchecked by default.',
    guideline: 'CCPA 2023 Guideline 5(h): Preselection',
    bbox: { x: 7.2, y: 41.5, w: 38.0, h: 7.0 },
  },
  {
    id: 'feat-3',
    pattern: 'Confirmshaming',
    severity: 'medium',
    evidence: 'No, I enjoy risk (Decline button)',
    explanation:
      'Frames opting out of the protection plan as reckless personal behavior to guilt-trip users into buying coverage.',
    translation: 'Agree to our add-on or admit to being an irresponsible person.',
    recommendation: 'Use neutral, dignified decline options like "No thanks" or "Continue without coverage".',
    guideline: 'CCPA 2023 Guideline 5(c): Confirmshaming',
    bbox: { x: 37.0, y: 67.5, w: 16.0, h: 4.5 },
  },
  {
    id: 'feat-4',
    pattern: 'Interface Interference',
    severity: 'medium',
    evidence: 'Giant green "Yes, protect my order!" vs faint grey "No, I enjoy risk"',
    explanation:
      'Gives the costly add-on a massive vibrant green button while visually camouflaging the decline option as a low-contrast faint grey box.',
    translation: 'Follow the big shiny green rectangle. Pretend the grey button does not exist.',
    recommendation: 'Provide balanced visual weight and accessible contrast for both accept and decline actions.',
    guideline: 'CCPA 2023 Guideline 5(f): Interface Interference',
    bbox: { x: 5.9, y: 52.2, w: 33.5, h: 8.1 },
  },
]

export const FEATURED_HERO_ANALYSIS: Analysis = {
  score: 86,
  verdict: '4 manipulative patterns detected in checkout flow',
  summary:
    'This e-commerce checkout employs manufactured urgency countdowns, pre-checked monthly recurring warranties, and asymmetric confirmshaming buttons to manipulate user decisions.',
  findings: FEATURED_HERO_FINDINGS,
}
