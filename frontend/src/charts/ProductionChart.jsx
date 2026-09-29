import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatTonnes } from '../utils/formatters.js'

export default function ProductionChart({ baseline, scenario }) {
  const data = baseline.map((b, i) => ({
    season: `S${b.season}`,
    Baseline: b.production,
    Scenario: scenario[i]?.production ?? null,
    Demand: scenario[i]?.demand ?? null,
  }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5efe8" />
        <XAxis dataKey="season" tick={{ fontSize: 12 }} stroke="#7fa88f" />
        <YAxis tick={{ fontSize: 12 }} stroke="#7fa88f" tickFormatter={(v) => formatTonnes(v)} width={70} />
        <RTooltip formatter={(v) => formatTonnes(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Baseline" fill="#b9dbc2" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Scenario" fill="#3f8759" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
