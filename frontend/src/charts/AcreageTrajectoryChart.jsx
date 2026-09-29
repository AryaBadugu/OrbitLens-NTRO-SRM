import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatHectares } from '../utils/formatters.js'

export default function AcreageTrajectoryChart({ baseline, scenario }) {
  const data = baseline.map((b, i) => ({
    season: `S${b.season}`,
    Baseline: b.acreage,
    Scenario: scenario[i]?.acreage ?? null,
  }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5efe8" />
        <XAxis dataKey="season" tick={{ fontSize: 12 }} stroke="#7fa88f" />
        <YAxis tick={{ fontSize: 12 }} stroke="#7fa88f" tickFormatter={(v) => formatHectares(v)} width={70} />
        <RTooltip formatter={(v) => formatHectares(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="Baseline" stroke="#8ec49d" fill="#e5efe8" strokeWidth={2} />
        <Area type="monotone" dataKey="Scenario" stroke="#c08a3e" fill="#f2e9d8" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
