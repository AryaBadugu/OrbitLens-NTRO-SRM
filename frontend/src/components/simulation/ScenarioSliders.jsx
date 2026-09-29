import Tooltip from '../common/Tooltip.jsx'

function SliderRow({ label, value, min, max, step = 1, unit = '%', onChange, tooltip }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-mandi-700 flex items-center">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </span>
        <span className="text-sm font-semibold text-mandi-800">
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-mandi-600"
      />
      <div className="flex justify-between text-[10px] text-mandi-400 mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function ScenarioSliders({ params, onChange }) {
  return (
    <div>
      <SliderRow
        label="Rainfall deviation"
        value={params.rainfall_deviation}
        min={-50} max={50}
        onChange={(v) => onChange('rainfall_deviation', v)}
        tooltip="How far rainfall deviates from normal. Both deficits and surpluses reduce simulated yield."
      />
      <SliderRow
        label="MSP change"
        value={params.msp_change}
        min={-20} max={50}
        onChange={(v) => onChange('msp_change', v)}
        tooltip="Percent change to the Minimum Support Price used as a floor by MSP-informed farmers."
      />
      <SliderRow
        label="Demand shift"
        value={params.demand_shift}
        min={-30} max={30}
        onChange={(v) => onChange('demand_shift', v)}
        tooltip="An exogenous shift in demand (e.g. export demand, festival demand, substitution effects)."
      />
    </div>
  )
}
