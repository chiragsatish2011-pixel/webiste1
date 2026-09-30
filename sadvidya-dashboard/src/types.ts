/**
 * All the shapes of data used in the dashboard.
 * Keeping them in one file makes it easy to see what a "report" actually is.
 */

/** The four fixed review parameters. These keys never change. */
export type ParameterKey =
  | 'meaningDrift'
  | 'naturalPhrasing'
  | 'termConsistency'
  | 'voiceConviction'

/** A flag is either a real issue (FLAGGED) or a judgement call (UNSURE). */
export type FlagStatus = 'FLAGGED' | 'UNSURE'

/** Languages the articles are translated into. */
export type Language = 'Hindi' | 'Gujarati'

/** One flag from a Flag Report. */
export interface Flag {
  /** Stable id so the review table can edit/delete rows. */
  id: string
  /** Line number in the article the flag points at. */
  line: number | null
  /** Which of the four parameters this flag belongs to. */
  parameter: ParameterKey
  status: FlagStatus
  /** The English source line. */
  english: string
  /** The Hindi (or Gujarati) translated line. */
  hindi: string
  /** Why it was flagged, in Claude's words. */
  reason: string
  /** Key term involved, e.g. "dehbhav". Empty when not term-related. */
  term: string
}

/** One uploaded Flag Report = one article review. */
export interface Report {
  /** Auto-increment key from IndexedDB. Absent until saved. */
  id?: number
  title: string
  /** ISO date, YYYY-MM-DD. */
  date: string
  language: Language
  /** CLEAN means the report had zero flags. */
  overallStatus: 'CLEAN' | 'FLAGGED'
  flags: Flag[]
  /** True for rows added by "Load demo data", so they can be removed in one click. */
  isDemo?: boolean
  /** When the report was saved into the dashboard (ISO timestamp). */
  createdAt: string
  /** Original PDF file name, when it came from a PDF. */
  sourceFile?: string
}

/** Per-parameter result of the scoring algorithm. */
export interface ParameterScore {
  key: ParameterKey
  label: string
  score: number
  /** Number of FLAGGED items (these cost points). */
  flaggedCount: number
  /** Number of UNSURE items (tracked, but cost nothing). */
  unsureCount: number
}

/** Full scorecard for one report. */
export interface Scorecard {
  overall: number
  grade: string
  parameters: ParameterScore[]
  totalFlagged: number
  totalUnsure: number
}
