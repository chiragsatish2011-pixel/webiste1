/**
 * Everything the Home page needs to say something useful about the whole set
 * of reports: trends, weak spots, repeat offenders, streaks and badges.
 */
import { PARAMETERS, PARAM_BY_KEY, TARGET_SCORE } from '../config/scoring'
import type { ParameterKey, Report } from '../types'
import { average, countFlags, scoreReport } from './scoring'

/** A report plus its computed scorecard, which most views want together. */
export interface ScoredReport extends Report {
  overall: number
  grade: string
}

/** Attach scores to reports and keep them oldest-first. */
export function scoreAll(reports: Report[]): ScoredReport[] {
  return [...reports]
    .sort((a, b) => a.date.localeCompare(b.date) || (a.id ?? 0) - (b.id ?? 0))
    .map((r) => {
      const card = scoreReport(r)
      return { ...r, overall: card.overall, grade: card.grade }
    })
}

/** Average score per parameter across a set of reports. */
export function parameterAverages(reports: Report[]): Record<ParameterKey, number> {
  const result = {} as Record<ParameterKey, number>
  for (const p of PARAMETERS) {
    result[p.key] = average(reports.map((r) => scoreReport(r).parameters.find((x) => x.key === p.key)!.score))
  }
  return result
}

/** How many of the most recent reports in a row scored at or above the target. */
export function currentStreak(scored: ScoredReport[], target = TARGET_SCORE): number {
  let streak = 0
  for (let i = scored.length - 1; i >= 0; i -= 1) {
    if (scored[i].overall >= target) streak += 1
    else break
  }
  return streak
}

/** The three weakest parameters (lowest average score first), with a plain sentence each. */
export function weakestParameters(reports: Report[], limit = 3) {
  const averages = parameterAverages(reports)
  const flagTotals = totalFlagsByParameter(reports)

  return PARAMETERS.map((p) => ({
    key: p.key,
    label: p.label,
    score: averages[p.key],
    flags: flagTotals[p.key],
    sentence: sentenceFor(p.key, flagTotals[p.key]),
    color: p.color,
  }))
    .sort((a, b) => a.score - b.score || b.flags - a.flags)
    .slice(0, limit)
}

/** Total FLAGGED items per parameter across all reports. */
export function totalFlagsByParameter(reports: Report[]): Record<ParameterKey, number> {
  const totals = Object.fromEntries(PARAMETERS.map((p) => [p.key, 0])) as Record<ParameterKey, number>
  for (const report of reports) {
    const counts = countFlags(report.flags)
    for (const p of PARAMETERS) totals[p.key] += counts[p.key].flagged
  }
  return totals
}

/** One simple sentence explaining what a parameter's flags mean for me. */
function sentenceFor(key: ParameterKey, flags: number): string {
  const plural = flags === 1 ? 'flag' : 'flags'
  switch (key) {
    case 'meaningDrift':
      return `${flags} ${plural} for Meaning Drift — your Hindi sometimes lands near the English idea instead of on it.`
    case 'naturalPhrasing':
      return `${flags} ${plural} for Natural Phrasing — your Hindi often follows English word order.`
    case 'termConsistency':
      return `${flags} ${plural} for Term Consistency — the same term is being spelled or handled two different ways.`
    case 'voiceConviction':
      return `${flags} ${plural} for Voice & Conviction — the tone flattens out where the English was firm.`
  }
}

export interface RepeatOffender {
  /** The term, or a short version of the reason when there was no term. */
  label: string
  /** Number of different articles it was flagged in. */
  articles: number
  /** Total number of times it was flagged. */
  times: number
  kind: 'term' | 'reason'
}

/** Shrink a reason to a comparable fingerprint (lowercase words, no punctuation). */
function reasonKey(reason: string): string {
  return reason
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6)
    .join(' ')
}

/**
 * Terms (and failing that, reasons) that were flagged in two or more
 * different articles. These are the habits worth fixing first.
 */
export function repeatOffenders(reports: Report[], minArticles = 2): RepeatOffender[] {
  const byKey = new Map<string, { label: string; kind: 'term' | 'reason'; articles: Set<string>; times: number }>()

  for (const report of reports) {
    const articleId = String(report.id ?? report.title)
    for (const flag of report.flags) {
      const term = flag.term.trim()
      const key = term ? `term:${term.toLowerCase()}` : `reason:${reasonKey(flag.reason)}`
      if (key === 'reason:') continue // nothing to compare on

      const entry = byKey.get(key) ?? {
        label: term || flag.reason.trim(),
        kind: term ? ('term' as const) : ('reason' as const),
        articles: new Set<string>(),
        times: 0,
      }
      entry.articles.add(articleId)
      entry.times += 1
      byKey.set(key, entry)
    }
  }

  return [...byKey.values()]
    .filter((e) => e.articles.size >= minArticles)
    .map((e) => ({ label: e.label, kind: e.kind, articles: e.articles.size, times: e.times }))
    .sort((a, b) => b.articles - a.articles || b.times - a.times)
}

/**
 * How many flags in the newest report repeat something already flagged earlier.
 * A flag counts as a repeat when its term, or its reason fingerprint, appeared before.
 */
export function reFlagCount(reports: Report[]): { count: number; total: number } {
  const scored = scoreAll(reports)
  if (scored.length < 2) return { count: 0, total: scored.at(-1)?.flags.length ?? 0 }

  const latest = scored.at(-1)!
  const earlier = scored.slice(0, -1)

  const seen = new Set<string>()
  for (const report of earlier) {
    for (const flag of report.flags) {
      if (flag.term.trim()) seen.add(`term:${flag.term.trim().toLowerCase()}`)
      const rk = reasonKey(flag.reason)
      if (rk) seen.add(`reason:${rk}`)
    }
  }

  let count = 0
  for (const flag of latest.flags) {
    const termKey = flag.term.trim() ? `term:${flag.term.trim().toLowerCase()}` : ''
    const rKey = reasonKey(flag.reason)
    if ((termKey && seen.has(termKey)) || (rKey && seen.has(`reason:${rKey}`))) count += 1
  }
  return { count, total: latest.flags.length }
}

export interface Badge {
  id: string
  name: string
  /** What it means, or how to unlock it when locked. */
  hint: string
  earned: boolean
  icon: string
}

/** Milestone badges. Locked ones keep their hint so I know what to aim at. */
export function badges(reports: Report[]): Badge[] {
  const scored = scoreAll(reports)
  const totalFlags = totalFlagsByParameter(reports)
  const streak = currentStreak(scored)
  const cleanCount = scored.filter((r) => r.flags.length === 0).length
  const above9 = scored.filter((r) => r.overall >= 9).length

  return [
    {
      id: 'first-report',
      name: 'First Diya Lit',
      hint: 'Save your first Flag Report.',
      earned: scored.length >= 1,
      icon: '🪔',
    },
    {
      id: 'first-clean',
      name: 'First Clean Report',
      hint: 'Get a report with zero flags.',
      earned: cleanCount >= 1,
      icon: '✨',
    },
    {
      id: 'five-articles',
      name: '5 Articles Done',
      hint: 'Review five articles.',
      earned: scored.length >= 5,
      icon: '📚',
    },
    {
      id: 'ten-articles',
      name: '10 Articles Done',
      hint: 'Review ten articles.',
      earned: scored.length >= 10,
      icon: '🏵️',
    },
    {
      id: 'three-above-8',
      name: '3 in a Row Above 8',
      hint: 'Score 8 or more on three articles in a row.',
      earned: streak >= 3,
      icon: '🔥',
    },
    {
      id: 'zero-drift',
      name: 'Zero Meaning Drift',
      hint: 'Finish an article with no Meaning Drift flags — and keep it that way overall.',
      earned: scored.length >= 3 && totalFlags.meaningDrift === 0,
      icon: '🎯',
    },
    {
      id: 'written-in-hindi',
      name: 'Written in Hindi',
      hint: 'Score 9 or above on any article.',
      earned: above9 >= 1,
      icon: '🌸',
    },
    {
      id: 'consistent-terms',
      name: 'Glossary Keeper',
      hint: 'Go three articles in a row with no Term Consistency flags.',
      earned:
        scored.length >= 3 &&
        scored.slice(-3).every((r) => countFlags(r.flags).termConsistency.flagged === 0),
      icon: '📖',
    },
  ]
}

/** Latest score with the change from the article before it. */
export function latestChange(scored: ScoredReport[]): { latest: number | null; delta: number | null } {
  if (scored.length === 0) return { latest: null, delta: null }
  const latest = scored.at(-1)!.overall
  if (scored.length === 1) return { latest, delta: null }
  return { latest, delta: Math.round((latest - scored.at(-2)!.overall) * 10) / 10 }
}

/** Total FLAGGED items across every report ("flags resolved" once reviewed). */
export function totalFlagsResolved(reports: Report[]): number {
  return Object.values(totalFlagsByParameter(reports)).reduce((a, b) => a + b, 0)
}

/** Label describing a parameter compared with my all-time average. */
export function compareToAverage(score: number, avg: number): 'up' | 'down' | 'same' {
  const diff = Math.round((score - avg) * 10) / 10
  if (diff > 0.05) return 'up'
  if (diff < -0.05) return 'down'
  return 'same'
}

export { PARAM_BY_KEY }
