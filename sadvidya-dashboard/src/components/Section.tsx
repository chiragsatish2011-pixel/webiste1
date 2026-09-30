/** A section with a large faded number behind the heading, like the Pipeline PDF. */
import type { ReactNode } from 'react'

interface SectionProps {
  /** The big faded number, e.g. "01". */
  number: string
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
}

export default function Section({ number, title, subtitle, right, children }: SectionProps) {
  return (
    <section className="relative mt-14 first:mt-0">
      <span className="section-number" aria-hidden="true">
        {number}
      </span>
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="h-display text-xl sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 max-w-xl text-sm text-ink/65">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}
