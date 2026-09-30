/** One of the four stat cards on the Home page. */
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  /** A small line under the value. */
  note?: ReactNode
  /** Change against the previous article: positive, negative or nothing. */
  delta?: number | null
  /** Order in the row, used to stagger the entrance. */
  index?: number
  info?: ReactNode
}

export default function StatCard({ label, value, note, delta, index = 0, info }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="card card-pad"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="label-caps">{label}</p>
        {info}
      </div>
      <p className="mt-2 flex items-baseline gap-2 font-heading text-3xl font-semibold text-ink">
        {value}
        {delta !== null && delta !== undefined && delta !== 0 && (
          <span
            className={`font-heading text-sm ${delta > 0 ? 'text-[#12805A]' : 'text-terracotta'}`}
            title={`${delta > 0 ? 'Up' : 'Down'} ${Math.abs(delta)} from the previous article`}
          >
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
          </span>
        )}
      </p>
      {note && <p className="mt-1 text-[13px] text-ink/60">{note}</p>}
    </motion.div>
  )
}
