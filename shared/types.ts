export type Severity = 'high' | 'medium' | 'low'

/** Bounding box in percent of image width/height, origin top-left. */
export interface BBox {
  x: number
  y: number
  w: number
  h: number
}

export interface Finding {
  id: string
  pattern: string
  severity: Severity
  evidence: string
  explanation: string
  recommendation: string
  bbox: BBox | null
}

export interface Analysis {
  score: number
  summary: string
  findings: Finding[]
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
  }
}
