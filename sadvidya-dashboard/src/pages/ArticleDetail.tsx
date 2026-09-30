/**
 * ARTICLE — one report, written as a clean report card in simple English.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ConfirmButton from '../components/ConfirmButton'
import Diya from '../components/Diya'
import ReviewTable from '../components/ReviewTable'
import ScoreInfo from '../components/ScoreInfo'
import { PARAMETERS, PARAM_BY_KEY } from '../config/scoring'
import { useData } from '../context/DataContext'
import { downloadJson, slugify } from '../lib/backup'
import { compareToAverage, parameterAverages } from '../lib/insights'
import { scoreReport } from '../lib/scoring'
import type { Flag, Language, Report } from '../types'

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { reports, allReports, loading, editReport, removeReport } = useData()

  const reportId = Number(id)
  const report = allReports.find((r) => r.id === reportId)

  // Edit mode holds a draft copy until Save is pressed.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<{ title: string; date: string; language: Language; flags: Flag[] } | null>(
    null,
  )

  // Reset the draft whenever the report or the edit mode changes.
  useEffect(() => {
    if (report && editing) {
      setDraft({
        title: report.title,
        date: report.date,
        language: report.language,
        flags: report.flags.map((f) => ({ ...f })),
      })
    }
  }, [editing, report])

  if (loading) return <p className="text-center text-ink/50">Loading…</p>

  if (!report) {
    return (
      <div className="card card-pad text-center">
        <p className="h-display text-lg">That article is not here.</p>
        <Link to="/articles" className="btn-primary mt-4">
          Back to Articles
        </Link>
      </div>
    )
  }

  const card = scoreReport(report)
  // Compare against my average across the reports currently in view.
  const averages = parameterAverages(reports.length > 0 ? reports : [report])

  const clean = card.parameters.filter((p) => p.flaggedCount === 0)
  const weakest = [...card.parameters].sort(
    (a, b) => a.score - b.score || b.flaggedCount - a.flaggedCount,
  )[0]

  async function saveEdits() {
    if (!draft) return
    const changes: Partial<Report> = {
      title: draft.title.trim() || report!.title,
      date: draft.date || report!.date,
      language: draft.language,
      flags: draft.flags,
      overallStatus: draft.flags.length === 0 ? 'CLEAN' : 'FLAGGED',
    }
    await editReport(reportId, changes)
    setEditing(false)
  }

  return (
    <article>
      {/* Header */}
      <header className="relative card card-pad pt-12">
        <span className="section-number" aria-hidden="true">
          01
        </span>
        <div className="relative flex flex-wrap items-center gap-6">
          <Diya score={card.overall} size={84} />
          <div className="min-w-0 flex-1">
            <p className="label-caps">{report.date} · {report.language} · {report.overallStatus}</p>
            <h1 className="h-display mt-1 text-2xl sm:text-3xl">{report.title}</h1>
            <p className="mt-2 text-[13px] text-ink/60">
              {card.totalFlagged} flagged · {card.totalUnsure} unsure
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-start justify-end gap-2">
              <p className="font-heading text-5xl font-semibold text-terracotta">
                {card.overall.toFixed(1)}
              </p>
              <ScoreInfo className="mt-2" />
            </div>
            <p className="font-heading text-sm text-olive">out of 10 · {card.grade}</p>
          </div>
        </div>
      </header>

      {/* Edit mode */}
      {editing && draft ? (
        <section className="mt-8 card card-pad">
          <h2 className="h-display text-lg">Edit this report</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-[12px] text-ink/65">
              Title
              <input
                className="input mt-1"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="text-[12px] text-ink/65">
              Date
              <input
                type="date"
                className="input mt-1"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </label>
            <label className="text-[12px] text-ink/65">
              Language
              <select
                className="input mt-1"
                value={draft.language}
                onChange={(e) => setDraft({ ...draft, language: e.target.value as Language })}
              >
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
              </select>
            </label>
          </div>

          <div className="mt-6">
            <ReviewTable flags={draft.flags} onChange={(flags) => setDraft({ ...draft, flags })} />
          </div>

          <div className="mt-6 flex gap-2">
            <button type="button" className="btn-primary" onClick={() => void saveEdits()}>
              Save changes
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Parameter cards */}
          <section className="mt-8">
            <h2 className="h-display text-lg">The four parameters</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {card.parameters.map((p, i) => {
                const config = PARAM_BY_KEY[p.key]
                const trend = compareToAverage(p.score, averages[p.key])
                return (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="card card-pad"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="h-display text-[15px]">{config.label}</p>
                      <p className="font-heading text-xl" style={{ color: config.color }}>
                        {p.score.toFixed(1)}
                        <span className="ml-1 text-[11px] text-olive">/ 10</span>
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: config.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${p.score * 10}%` }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                      />
                    </div>

                    <p className="mt-3 text-[13px] leading-relaxed text-ink/70">{config.meaning}</p>
                    <p className="mt-2 text-[12px] text-ink/60">
                      {p.flaggedCount} flagged
                      {p.unsureCount > 0 && ` · ${p.unsureCount} unsure`} ·{' '}
                      <span title="Compared to your average">
                        {trend === 'up' ? '↑ above' : trend === 'down' ? '↓ below' : '= at'} your
                        average ({averages[p.key].toFixed(1)})
                      </span>
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* What went well / what to work on */}
          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="card card-pad bg-sage/35">
              <p className="label-caps">What went well</p>
              {clean.length === 0 ? (
                <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
                  Every parameter picked up at least one flag this time — but the score is a
                  starting point, not a verdict. Fix the strongest pattern first.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-ink/75">
                  {clean.map((p) => (
                    <li key={p.key}>
                      <strong>{p.label}: clean.</strong> {encouragementFor(p.key)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card card-pad bg-peach/35">
              <p className="label-caps">What to work on</p>
              {weakest.flaggedCount === 0 ? (
                // A clean report has no weak spot — say so instead of naming one.
                <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
                  Nothing to fix in this one. Keep the habit that produced it: the next article is
                  where it gets tested.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
                    <strong>{PARAM_BY_KEY[weakest.key].label}</strong> is your weakest here (
                    {weakest.score.toFixed(1)} / 10, {weakest.flaggedCount} flag
                    {weakest.flaggedCount === 1 ? '' : 's'}).
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
                    {PARAM_BY_KEY[weakest.key].tip}
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Flags grouped by parameter */}
          <section className="mt-8">
            <h2 className="h-display text-lg">Every flag</h2>
            {report.flags.length === 0 ? (
              <p className="card card-pad mt-4 text-[13px] text-ink/70">
                This report was CLEAN — no flags at all. 🪔
              </p>
            ) : (
              <div className="mt-4 space-y-6">
                {PARAMETERS.map((config) => {
                  const rows = report.flags.filter((f) => f.parameter === config.key)
                  if (rows.length === 0) return null
                  return (
                    <div key={config.key}>
                      <p className="flex items-center gap-2 font-heading text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: config.color }}
                          aria-hidden="true"
                        />
                        {config.label}
                        <span className="text-olive">({rows.length})</span>
                      </p>
                      <ul className="mt-3 space-y-3">
                        {rows.map((flag) => (
                          <li key={flag.id} className="card card-pad">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-heading text-[12px] text-olive">
                                Line {flag.line ?? '—'}
                              </span>
                              <span
                                className={flag.status === 'FLAGGED' ? 'badge-flagged' : 'badge-unsure'}
                              >
                                {flag.status}
                              </span>
                              {flag.term && (
                                <span className="deva text-[12px] text-ink/70">term: {flag.term}</span>
                              )}
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl bg-sand/50 p-3">
                                <p className="label-caps">English</p>
                                <p className="mt-1 text-[14px] leading-relaxed">{flag.english}</p>
                              </div>
                              <div className="rounded-xl bg-peach/35 p-3">
                                <p className="label-caps">{report.language}</p>
                                <p className="deva mt-1 text-[15px]">{flag.hindi}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-[13px] leading-relaxed text-ink/75">
                              <span className="label-caps mr-2">Why</span>
                              {flag.reason}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Actions */}
          <section className="mt-10 flex flex-wrap gap-2 border-t border-ink/10 pt-6">
            <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>
              Edit report
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                downloadJson({ ...report, scorecard: card }, `${slugify(report.title)}.json`)
              }
            >
              Export this article as JSON
            </button>
            <ConfirmButton
              label="Delete report"
              confirmLabel="Yes, delete it"
              onConfirm={() => {
                void removeReport(reportId).then(() => navigate('/articles'))
              }}
            />
            <Link to="/articles" className="btn-quiet ml-auto">
              ← All articles
            </Link>
          </section>
        </>
      )}
    </article>
  )
}

/** A line of encouragement for a parameter that collected no flags. */
function encouragementFor(key: string): string {
  switch (key) {
    case 'meaningDrift':
      return 'Your Hindi carried the English idea exactly, with nothing softened or sharpened.'
    case 'naturalPhrasing':
      return 'The sentences moved in Hindi order, not English order.'
    case 'termConsistency':
      return 'Every name and Sanskrit-rooted term was handled the same way throughout.'
    case 'voiceConviction':
      return 'The tone stayed yours — firm where the English was firm.'
    default:
      return 'Well held.'
  }
}
