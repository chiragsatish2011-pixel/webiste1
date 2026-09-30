/**
 * HOME — "Progress Garden".
 * The diya row, four stat cards, three charts, the common-mistakes panel
 * and the milestone badges.
 */
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Badges from '../components/Badges'
import DiyaRow from '../components/DiyaRow'
import EmptyGarden from '../components/EmptyGarden'
import ScoreInfo from '../components/ScoreInfo'
import Section from '../components/Section'
import StatCard from '../components/StatCard'
import FlagsByParameter from '../components/charts/FlagsByParameter'
import ParameterRadar from '../components/charts/ParameterRadar'
import ScoreJourney from '../components/charts/ScoreJourney'
import { TARGET_SCORE } from '../config/scoring'
import { useData } from '../context/DataContext'
import {
  badges,
  currentStreak,
  latestChange,
  reFlagCount,
  repeatOffenders,
  totalFlagsResolved,
  weakestParameters,
} from '../lib/insights'
import { average } from '../lib/scoring'

export default function Home() {
  const { reports, allReports, loading, languageFilter } = useData()

  if (loading) {
    return <p className="text-center text-ink/50">Lighting the lamps…</p>
  }

  if (reports.length === 0) {
    return <EmptyGarden filtered={allReports.length > 0} />
  }

  const { latest, delta } = latestChange(reports)
  const avg = average(reports.map((r) => r.overall))
  const streak = currentStreak(reports)
  const flagsResolved = totalFlagsResolved(reports)
  const weak = weakestParameters(reports)
  const offenders = repeatOffenders(reports)
  const refl = reFlagCount(reports)
  const earned = badges(reports)

  return (
    <div>
      {/* Hero */}
      <Section
        number="01"
        title="Progress Garden"
        subtitle={
          languageFilter === 'All'
            ? 'One diya for every article. The brighter and taller the flame, the closer your Hindi reads as Hindi.'
            : `Showing ${languageFilter} articles only.`
        }
      >
        <div className="card card-pad pt-14">
          <DiyaRow reports={reports} />
        </div>
      </Section>

      {/* Stat cards */}
      <Section number="02" title="Where you stand">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            index={0}
            label="Latest score"
            value={latest !== null ? latest.toFixed(1) : '—'}
            delta={delta}
            note={reports.at(-1)?.title}
            info={<ScoreInfo />}
          />
          <StatCard
            index={1}
            label="Average score"
            value={avg.toFixed(1)}
            note={`across ${reports.length} article${reports.length === 1 ? '' : 's'}`}
          />
          <StatCard
            index={2}
            label={`Streak above ${TARGET_SCORE}`}
            value={streak}
            note={streak === 0 ? 'next one starts the streak' : `article${streak === 1 ? '' : 's'} in a row`}
          />
          <StatCard
            index={3}
            label="Total flags resolved"
            value={flagsResolved}
            note="issues found and fixed"
          />
        </div>
      </Section>

      {/* Charts */}
      <Section
        number="03"
        title="Your score journey"
        subtitle={`Each point is one article. The dotted line is your target of ${TARGET_SCORE.toFixed(1)}.`}
      >
        <div className="card card-pad">
          <ScoreJourney reports={reports} />
        </div>
      </Section>

      <Section number="04" title="The four parameters" subtitle="Your average shape, and how the last three articles compare.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card card-pad">
            <p className="label-caps">Parameter radar</p>
            <ParameterRadar reports={reports} />
          </div>
          <div className="card card-pad">
            <p className="label-caps">Flags by parameter</p>
            <FlagsByParameter reports={reports} />
          </div>
        </div>
      </Section>

      {/* Common mistakes */}
      <Section number="05" title="Your common mistakes" subtitle="The habits worth fixing first.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card card-pad lg:col-span-2">
            <p className="label-caps">Weakest parameters</p>
            <ul className="mt-4 space-y-4">
              {weak.map((w, i) => (
                <motion.li
                  key={w.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex gap-3"
                >
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: w.color }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-heading text-sm">
                      {w.label}{' '}
                      <span className="text-olive">· average {w.score.toFixed(1)} / 10</span>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink/70">{w.sentence}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-ink/10 bg-sand/40 p-4">
              <p className="label-caps">Re-flag count</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink/75">
                {refl.total === 0 ? (
                  <>Your latest report had no flags at all. Nothing repeated.</>
                ) : (
                  <>
                    <strong>
                      {refl.count} of {refl.total}
                    </strong>{' '}
                    flags in your latest report repeat something already flagged in an earlier
                    article.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="card card-pad">
            <p className="label-caps">Repeat offenders</p>
            {offenders.length === 0 ? (
              <p className="mt-3 text-[13px] text-ink/60">
                Nothing has been flagged in two different articles yet. Good sign.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {offenders.slice(0, 8).map((o) => (
                  <li
                    key={`${o.kind}-${o.label}`}
                    className="flex items-start justify-between gap-2 border-b border-ink/10 pb-2 last:border-0"
                  >
                    <span className={o.kind === 'term' ? 'deva text-[13px]' : 'text-[13px] text-ink/75'}>
                      {o.label.length > 70 ? `${o.label.slice(0, 70)}…` : o.label}
                    </span>
                    <span className="shrink-0 font-heading text-[12px] text-terracotta">
                      {o.articles} articles
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {/* Badges */}
      <Section number="06" title="Milestones" subtitle="Small markers on the way.">
        <Badges badges={earned} />
      </Section>

      <div className="mt-12 text-center">
        <Link to="/articles" className="btn-ghost">
          See all articles
        </Link>
      </div>
    </div>
  )
}
