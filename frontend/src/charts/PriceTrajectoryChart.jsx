import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatRupees } from '../utils/formatters.js'

export default function PriceTrajectoryChart({ baseline, scenario }) {
  const data = baseline.map((b, i) => ({
    season: `S${b.season}`,
    Baseline: b.price,
    Scenario: scenario[i]?.price ?? null,
  }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5efe8" />
        <XAxis dataKey="season" tick={{ fontSize: 12 }} stroke="#7fa88f" />
        <YAxis tick={{ fontSize: 12 }} stroke="#7fa88f" tickFormatter={(v) => `₹${Math.round(v)}`} width={70} />
        <RTooltip formatter={(v) => formatRupees(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Baseline" stroke="#8ec49d" strokeWidth={2} dot={false} strokeDasharray="4 3" />
        <Line type="monotone" dataKey="Scenario" stroke="#2f6c45" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
