/**
 * Score over time, with a dotted target line at 8.0.
 * One series, so it needs no legend — the heading names it.
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TARGET_SCORE } from '../../config/scoring'
import type { ScoredReport } from '../../lib/insights'
import { AXIS, GRID, shortDate, tooltipStyle } from './chartTheme'

export default function ScoreJourney({ reports }: { reports: ScoredReport[] }) {
  const data = reports.map((r) => ({
    label: shortDate(r.date),
    title: r.title,
    score: r.overall,
  }))

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -18 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
          <XAxis dataKey="label" stroke={AXIS} tickLine={false} axisLine={{ stroke: AXIS }} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke={AXIS} tickLine={false} axisLine={false} />
          <ReferenceLine
            y={TARGET_SCORE}
            stroke="#6B6B52"
            strokeDasharray="5 5"
            label={{
              value: `target ${TARGET_SCORE.toFixed(1)}`,
              position: 'insideTopRight',
              fill: '#6B6B52',
              fontSize: 11,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [`${Number(value).toFixed(1)} / 10`, 'Score']}
            labelFormatter={(label, payload) =>
              payload?.[0] ? `${payload[0].payload.title} · ${label}` : label
            }
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#C4623F"
            strokeWidth={2}
            dot={{ r: 4, fill: '#C4623F', stroke: '#FDFBF6', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#C4623F', stroke: '#FDFBF6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
