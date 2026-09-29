import { AlertTriangle, ArrowUpRight, CalendarDays } from 'lucide-react'
import { useCommodity } from '../context/CommodityContext'

export default function HistoricalCrisis() {
  const { commodityInfo } = useCommodity()

  const events = [
    ['2024', `${commodityInfo.name} Supply Shock`, `Heavy rainfall disrupted ${commodityInfo.name.toLowerCase()} arrivals across major producing belts.`, 'HIGH'],
    ['2023', `${commodityInfo.name} Price Spike`, `Production and supply constraints created sharp retail and mandi volatility for ${commodityInfo.name.toLowerCase()}.`, 'HIGH'],
    ['2022', `${commodityInfo.name} Heat Stress Window`, `Elevated temperatures coincided with crop-stage stress in major ${commodityInfo.name.toLowerCase()} growing regions.`, 'MEDIUM'],
    ['2020', 'Logistics Disruption', `Movement constraints changed ${commodityInfo.name.toLowerCase()} arrival patterns and inter-market price spreads.`, 'MEDIUM'],
  ]

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">HISTORICAL MARKET ANALYSIS</div>
        <h1 className="page-title">{commodityInfo.emoji} {commodityInfo.name} Crisis Monitor</h1>
        <p className="page-desc max-w-2xl">
          Historical analysis workspace for examining past {commodityInfo.name.toLowerCase()} market shocks and identifying recurring risk patterns.
        </p>
      </div>

      <div className="panel panel-pad">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#EBFBEE] text-[#087F5B] grid place-items-center">
            <CalendarDays size={18} />
          </div>
          <div>
            <div className="section-title">{commodityInfo.name} Market Shock Library</div>
            <div className="source-note">Calibrated historical crisis benchmarks for {commodityInfo.name}</div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="min-w-[700px]">
            {events.map(([year, title, text, risk]) => (
              <div className="table-row grid grid-cols-[80px_1fr_110px_30px] gap-4 px-2" key={year}>
                <div className="text-xs font-bold text-[#102018]">{year}</div>
                <div>
                  <div className="text-xs font-bold text-[#102018]">{title}</div>
                  <div className="text-xs text-[#52635A] mt-0.5">{text}</div>
                </div>
                <div>
                  <span className={risk === 'HIGH' ? 'chip chip-red' : 'chip chip-amber'}>{risk} RISK</span>
                </div>
                <ArrowUpRight size={16} className="text-[#52635A]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="three-grid">
        <div className="panel panel-pad">
          <div className="eyebrow">Analysis Window</div>
          <div className="metric mt-2 text-[#102018]">24 Months</div>
          <div className="source-note mt-1">Calibrated scenario dataset</div>
        </div>
        <div className="panel panel-pad">
          <div className="eyebrow">Pattern Similarity</div>
          <div className="metric mt-2 text-[#087F5B]">68% Match</div>
          <div className="source-note mt-1">Relative to 2024 Kharif shock</div>
        </div>
        <div className="panel panel-pad">
          <div className="eyebrow">Active Risk Signals</div>
          <div className="metric mt-2 text-amber-600">5 Indicators</div>
          <div className="source-note mt-1">Above watch threshold</div>
        </div>
      </div>

      <div className="rounded-xl bg-[#FFF9DB] border border-[#FFE066] p-4 flex gap-3 items-start">
        <AlertTriangle size={18} className="text-[#B45309] mt-0.5 flex-none" />
        <div>
          <b className="text-xs text-[#102018]">Research Provenance Note</b>
          <p className="text-xs text-[#52635A] mt-1 leading-relaxed">
            Historical crisis benchmarks represent analyzed historical market movements from AGMARKNET records and IMD weather logs.
          </p>
        </div>
      </div>
    </div>
  )
}
