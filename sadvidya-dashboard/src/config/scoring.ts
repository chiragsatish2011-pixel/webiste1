/**
 * THE ONE PLACE TO ADJUST SCORING.
 * Change a deduction or a weight here and the whole dashboard follows.
 */
import type { ParameterKey } from '../types'

export interface ParameterConfig {
  key: ParameterKey
  /** Name shown on screen. */
  label: string
  /** Points removed from 10 for each FLAGGED item in this parameter. */
  deductionPerFlag: number
  /** Share of the overall score (all weights must add up to 1). */
  weight: number
  /** Plain-English meaning of the parameter. */
  meaning: string
  /** A practical tip shown when this is the weakest parameter. */
  tip: string
  /** Colour used in charts for this parameter. */
  color: string
}

/** Every parameter starts at this score before deductions. */
export const MAX_SCORE = 10

/** The dotted "target" line on the score journey chart. */
export const TARGET_SCORE = 8

/** The four fixed parameters, in report-card order. */
export const PARAMETERS: ParameterConfig[] = [
  {
    key: 'meaningDrift',
    label: 'Meaning Drift',
    deductionPerFlag: 2.0,
    weight: 0.35,
    meaning:
      'The Hindi says a nearby, softened, or sharpened idea instead of the English one.',
    tip: 'Read the English line, close it, then ask: does my Hindi claim exactly the same thing — no softer, no stronger?',
    color: '#C4623F',
  },
  {
    key: 'voiceConviction',
    label: 'Voice & Conviction',
    deductionPerFlag: 1.5,
    weight: 0.25,
    meaning: 'The tone has gone flat, generic, or overly formal.',
    tip: 'Read the Hindi aloud. If it sounds like a notice board rather than you speaking, rewrite it with the conviction the English had.',
    color: '#6B6B52',
  },
  {
    key: 'naturalPhrasing',
    label: 'Natural Phrasing',
    deductionPerFlag: 1.0,
    weight: 0.25,
    meaning: 'The Hindi sounds stiff or copies English sentence structure.',
    tip: 'Rebuild the sentence in Hindi word order instead of translating it left to right.',
    color: '#B98A6A',
  },
  {
    key: 'termConsistency',
    label: 'Term Consistency',
    deductionPerFlag: 1.0,
    weight: 0.15,
    meaning:
      'Names, scripture titles, and Sanskrit-rooted words (Akshardham, Vachanamrut, dehbhav) are handled inconsistently.',
    tip: 'Keep a short glossary of your key terms and use the same spelling for a term everywhere.',
    color: '#8C9A6E',
  },
]

/** Grade labels, checked from the top down. */
export const GRADES: { min: number; label: string }[] = [
  { min: 9, label: 'Written in Hindi' },
  { min: 7.5, label: 'Almost there' },
  { min: 6, label: 'Needs polish' },
  { min: 0, label: 'Reads like a translation' },
]

/** Quick lookup by key. */
export const PARAM_BY_KEY: Record<ParameterKey, ParameterConfig> = Object.fromEntries(
  PARAMETERS.map((p) => [p.key, p]),
) as Record<ParameterKey, ParameterConfig>

/** Parameter keys in display order. */
export const PARAMETER_KEYS = PARAMETERS.map((p) => p.key)
