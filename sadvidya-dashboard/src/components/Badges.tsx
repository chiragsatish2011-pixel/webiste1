/** Milestone badges: earned ones in colour, locked ones greyed with a hint. */
import { motion } from 'framer-motion'
import type { Badge } from '../lib/insights'

export default function Badges({ badges }: { badges: Badge[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {badges.map((badge, i) => (
        <motion.li
          key={badge.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          title={badge.hint}
          className={`rounded-card border p-4 text-center ${
            badge.earned
              ? 'border-terracotta/25 bg-peach/45'
              : 'border-ink/10 bg-sand/40 opacity-60 grayscale'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            {badge.icon}
          </span>
          <p className="mt-1 font-heading text-[13px] font-medium leading-snug">{badge.name}</p>
          <p className="mt-1 text-[11px] leading-snug text-ink/60">
            {badge.earned ? 'Earned' : badge.hint}
          </p>
        </motion.li>
      ))}
    </ul>
  )
}
