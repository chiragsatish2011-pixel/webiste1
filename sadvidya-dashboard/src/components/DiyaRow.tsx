/**
 * The hero: one diya per article, in date order. Hovering shows the details,
 * clicking opens that article.
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Diya from './Diya'
import type { ScoredReport } from '../lib/insights'
import { average } from '../lib/scoring'

export default function DiyaRow({ reports }: { reports: ScoredReport[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const avg = average(reports.map((r) => r.overall))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-4 sm:gap-x-3">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative"
            onMouseEnter={() => setHovered(report.id ?? null)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              to={`/articles/${report.id}`}
              className="block rounded-2xl px-1 pt-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
              onFocus={() => setHovered(report.id ?? null)}
              onBlur={() => setHovered(null)}
              aria-label={`${report.title}, ${report.date}, score ${report.overall} out of 10`}
            >
              <Diya score={report.overall} size={62} />
              <p className="mt-1 text-center font-heading text-[11px] text-ink/55">
                {report.overall.toFixed(1)}
              </p>
            </Link>

            {/* Hover card */}
            <AnimatePresence>
              {hovered === report.id && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 z-20 w-52 -translate-x-1/2 card p-3 text-center"
                >
                  <p className="font-heading text-[13px] font-medium leading-snug">{report.title}</p>
                  <p className="mt-1 text-[11px] text-ink/60">
                    {report.date} · {report.language}
                  </p>
                  <p className="mt-1 font-heading text-sm text-terracotta">
                    {report.overall.toFixed(1)} / 10 · {report.grade}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-center font-heading text-sm text-olive">
        {reports.length} {reports.length === 1 ? 'diya' : 'diyas'} lit · average flame{' '}
        {avg.toFixed(1)}/10
      </p>
    </div>
  )
}
