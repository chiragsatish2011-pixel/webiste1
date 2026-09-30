/** ARTICLES — searchable, sortable cards. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Diya from '../components/Diya'
import EmptyGarden from '../components/EmptyGarden'
import Section from '../components/Section'
import { useData } from '../context/DataContext'

type SortKey = 'date' | 'score' | 'title'

export default function Articles() {
  const { reports, allReports, loading } = useData()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('date')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? reports.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.flags.some(
              (f) =>
                f.term.toLowerCase().includes(q) ||
                f.reason.toLowerCase().includes(q) ||
                f.english.toLowerCase().includes(q) ||
                f.hindi.includes(query.trim()),
            ),
        )
      : reports

    const sorted = [...filtered]
    if (sort === 'date') sorted.sort((a, b) => b.date.localeCompare(a.date))
    if (sort === 'score') sorted.sort((a, b) => b.overall - a.overall)
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title))
    return sorted
  }, [reports, query, sort])

  if (loading) return <p className="text-center text-ink/50">Loading…</p>
  if (reports.length === 0) return <EmptyGarden filtered={allReports.length > 0} />

  return (
    <Section
      number="01"
      title="Articles"
      subtitle={`${reports.length} report${reports.length === 1 ? '' : 's'} saved. Search titles, terms, or any line of text.`}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search articles"
        />
        <div className="flex items-center gap-1">
          <span className="label-caps mr-1">Sort</span>
          {(['date', 'score', 'title'] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={sort === key ? 'btn bg-sand text-ink text-xs' : 'btn-quiet text-xs'}
            >
              {key === 'date' ? 'Newest' : key === 'score' ? 'Highest score' : 'Title'}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="card card-pad text-center text-ink/60">Nothing matched “{query}”.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((report) => (
            <li key={report.id}>
              <Link
                to={`/articles/${report.id}`}
                className="card card-pad flex h-full items-start gap-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="shrink-0">
                  <Diya score={report.overall} size={46} />
                </div>
                <div className="min-w-0">
                  <p className="h-display text-[15px] leading-snug">{report.title}</p>
                  <p className="mt-1 text-[12px] text-ink/55">
                    {report.date} · {report.language}
                  </p>
                  <p className="mt-2 font-heading text-lg text-terracotta">
                    {report.overall.toFixed(1)}
                    <span className="ml-1 text-[12px] text-olive">/ 10 · {report.grade}</span>
                  </p>
                  <p className="mt-1 text-[12px] text-ink/55">
                    {report.flags.filter((f) => f.status === 'FLAGGED').length} flagged ·{' '}
                    {report.flags.filter((f) => f.status === 'UNSURE').length} unsure
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
