import { farmerMixSum, isFarmerMixValid } from '../../utils/validation.js'
import Tooltip from '../common/Tooltip.jsx'

const ARCHETYPES = [
  { key: 'risk_averse', label: 'Risk-Averse', color: 'bg-mandi-400', tip: 'Reacts weakly, and to a smoothed (multi-season) price trend rather than the latest price.' },
  { key: 'trend_chasing', label: 'Trend-Chasing', color: 'bg-earth-500', tip: 'Reacts strongly and immediately to the previous season\'s price.' },
  { key: 'msp_informed', label: 'MSP-Informed', color: 'bg-mandi-700', tip: 'Plants based on expected profitability, using MSP as a price floor.' },
]

export default function FarmerMixEditor({ mix, onChange }) {
  const sum = farmerMixSum(mix)
  const valid = isFarmerMixValid(mix)

  const handleChange = (key, value) => {
    onChange({ ...mix, [key]: Number(value) })
  }

  return (
    <div>
      {ARCHETYPES.map(({ key, label, color, tip }) => (
        <div key={key} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-mandi-700 flex items-center">
              {label}
              <Tooltip text={tip} />
            </span>
            <span className="text-sm font-semibold text-mandi-800">{mix[key]}%</span>
          </div>
          <input
            type="range" min={0} max={100} value={mix[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full accent-mandi-600 mb-1.5"
          />
          <div className="w-full h-2 bg-mandi-50 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${mix[key]}%` }} />
          </div>
        </div>
      ))}
      <div className={`mt-4 text-xs font-medium ${valid ? 'text-mandi-500' : 'text-red-600'}`}>
        Total: {sum}% {valid ? '' : '— must equal 100% before running the simulation'}
      </div>
    </div>
  )
}
