const COLORS = { risk_averse: '#8ec49d', trend_chasing: '#c08a3e', msp_informed: '#265639' }
const LABELS = { risk_averse: 'Risk-Averse', trend_chasing: 'Trend-Chasing', msp_informed: 'MSP-Informed' }

export default function FarmerMixBarChart({ mix }) {
  return (
    <div className="space-y-4">
      {Object.entries(mix).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-mandi-700">{LABELS[key]}</span>
            <span className="font-semibold text-mandi-800">{value}%</span>
          </div>
          <div className="w-full h-3 bg-mandi-50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: COLORS[key] }} />
          </div>
        </div>
      ))}
    </div>
  )
}
