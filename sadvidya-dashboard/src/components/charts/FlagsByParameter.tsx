/** Stacked bars: how many flags each article collected, split by parameter. */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PARAMETERS } from '../../config/scoring'
import { countFlags } from '../../lib/scoring'
import type { ScoredReport } from '../../lib/insights'
import { AXIS, GRID, shortDate, tooltipStyle } from './chartTheme'

export default function FlagsByParameter({ reports }: { reports: ScoredReport[] }) {
  const data = reports.map((r) => {
    const counts = countFlags(r.flags)
    const row: Record<string, string | number> = { label: shortDate(r.date), title: r.title }
    for (const p of PARAMETERS) row[p.label] = counts[p.key].flagged
    return row
  })

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -22 }} barCategoryGap="28%">
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" stroke={AXIS} tickLine={false} axisLine={{ stroke: AXIS }} />
          <YAxis allowDecimals={false} stroke={AXIS} tickLine={false} axisLine={false} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(label, payload) =>
              payload?.[0] ? `${payload[0].payload.title} · ${label}` : label
            }
          />
          <Legend
            wrapperStyle={{ fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 12, paddingTop: 6 }}
          />
          {PARAMETERS.map((p, i) => (
            <Bar
              key={p.key}
              dataKey={p.label}
              stackId="flags"
              fill={p.color}
              // 2px gap between stacked segments, and rounded ends on the top one.
              stroke="#FDFBF6"
              strokeWidth={2}
              radius={i === PARAMETERS.length - 1 ? [4, 4, 0, 0] : undefined}
              maxBarSize={44}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
