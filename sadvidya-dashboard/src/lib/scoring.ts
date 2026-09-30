/**
 * The scoring algorithm.
 * Every number it uses comes from src/config/scoring.ts.
 */
import {
  GRADES,
  MAX_SCORE,
  PARAMETERS,
  PARAM_BY_KEY,
} from '../config/scoring'
import type { Flag, ParameterKey, ParameterScore, Report, Scorecard } from '../types'

/** Round to one decimal place (9.049 -> 9.0, 8.75 -> 8.8). */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Score for a single parameter: 10 minus the flags it collected, never below 0. */
export function parameterScore(key: ParameterKey, flaggedCount: number): number {
  const { deductionPerFlag } = PARAM_BY_KEY[key]
  return round1(Math.max(0, MAX_SCORE - flaggedCount * deductionPerFlag))
}

/** Grade label for an overall score. */
export function gradeFor(score: number): string {
  // GRADES is ordered high -> low, so the first match wins.
  return GRADES.find((g) => score >= g.min)?.label ?? GRADES[GRADES.length - 1].label
}

/** Count FLAGGED and UNSURE items per parameter. */
export function countFlags(flags: Flag[]): Record<ParameterKey, { flagged: number; unsure: number }> {
  const counts = Object.fromEntries(
    PARAMETERS.map((p) => [p.key, { flagged: 0, unsure: 0 }]),
  ) as Record<ParameterKey, { flagged: number; unsure: number }>

  for (const flag of flags) {
    const bucket = counts[flag.parameter]
    if (!bucket) continue // ignore a flag with an unknown parameter
    if (flag.status === 'FLAGGED') bucket.flagged += 1
    else bucket.unsure += 1
  }
  return counts
}

/**
 * Turn a report into a full scorecard.
 * A CLEAN report (no flags at all) scores 10.0 everywhere.
 */
export function scoreReport(report: Pick<Report, 'flags' | 'overallStatus'>): Scorecard {
  const flags = report.flags ?? []
  const counts = countFlags(flags)

  const parameters: ParameterScore[] = PARAMETERS.map((p) => ({
    key: p.key,
    label: p.label,
    score: parameterScore(p.key, counts[p.key].flagged),
    flaggedCount: counts[p.key].flagged,
    unsureCount: counts[p.key].unsure,
  }))

  // Weighted average of the four parameter scores.
  const overall = round1(
    parameters.reduce((sum, p) => sum + p.score * PARAM_BY_KEY[p.key].weight, 0),
  )

  return {
    overall,
    grade: gradeFor(overall),
    parameters,
    totalFlagged: parameters.reduce((s, p) => s + p.flaggedCount, 0),
    totalUnsure: parameters.reduce((s, p) => s + p.unsureCount, 0),
  }
}

/** Average of a list of numbers, rounded to 1 decimal. 0 for an empty list. */
export function average(values: number[]): number {
  if (values.length === 0) return 0
  return round1(values.reduce((a, b) => a + b, 0) / values.length)
}
