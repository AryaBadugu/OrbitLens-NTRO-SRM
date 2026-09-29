import { Users, ArrowDownRight, ArrowUpRight, GitBranch } from 'lucide-react'
import { useCommodity } from '../context/CommodityContext'

export default function FarmerBehaviour() {
  const { commodityInfo } = useCommodity()

  const stages = [
    [`High Current ${commodityInfo.name} Price`, `Farmers increase ${commodityInfo.name.toLowerCase()} planting acreage for next season`, '+12% Intention'],
    ['Higher Acreage', `Harvest production rises sharply across ${commodityInfo.name.toLowerCase()} producing belts`, '+8% Production'],
    ['Market Glut', `${commodityInfo.name} arrivals exceed demand, triggering price pressure`, '−6% Price Drop'],
    ['Lower Price Signal', `Acreage intention contracts for subsequent ${commodityInfo.name.toLowerCase()} season`, '−9% Acreage'],
  ]

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">BEHAVIORAL SUPPLY RESPONSE</div>
        <h1 className="page-title">{commodityInfo.emoji} {commodityInfo.name} Supply Behaviour</h1>
        <p className="page-desc max-w-2xl">
          Visualizing the cobweb feedback loop between current {commodityInfo.name.toLowerCase()} mandi prices, farmer planting decisions, and future market supply.
        </p>
      </div>

      <div className="hero-strip">
        <div className="flex items-start gap-3">
          <GitBranch size={22} className="text-[#8CE99A] flex-none mt-0.5" />
          <div>
            <div className="text-xl font-extrabold text-white">The {commodityInfo.name} Cobweb Market Feedback Loop</div>
            <p className="text-xs text-[#C3FACD] mt-1.5 max-w-2xl leading-relaxed">
              Today's {commodityInfo.name.toLowerCase()} price signals influence farmer acreage decisions for the upcoming season, which determines future production levels and feeds back into market clearing prices.
            </p>
          </div>
        </div>
      </div>

      <section className="panel panel-pad">
        <div className="section-title">Feedback Loop Sequence</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          {stages.map(([a, b, c], i) => (
            <div className="rounded-xl border border-[#DCE5DE] bg-[#F8FAF7] p-4 flex flex-col justify-between" key={a}>
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#EBFBEE] text-[#087F5B] grid place-items-center mb-2.5 font-bold">
                  {i % 2 === 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="text-xs font-bold text-[#102018]">{a}</div>
                <div className="text-xs text-[#52635A] mt-1 leading-relaxed">{b}</div>
              </div>
              <div className="mt-3">
                <span className="chip chip-green">{c}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="two-grid">
        <section className="panel panel-pad">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-[#087F5B]" />
            <div className="section-title">Behavioral Archetypes</div>
          </div>
          <div className="space-y-2.5 text-xs text-[#102018]">
            <div className="bullet"><b>Trend-Chasing Archetype</b>: Expands acreage heavily following high price seasons.</div>
            <div className="bullet"><b>Risk-Averse Archetype</b>: Maintains steady acreage with cautious response to price spikes.</div>
            <div className="bullet"><b>MSP-Informed Archetype</b>: Aligns planting decisions with official minimum support price floors.</div>
          </div>
        </section>

        <section className="panel panel-pad">
          <div className="eyebrow">Cobweb Dynamics</div>
          <div className="text-lg font-extrabold text-[#102018] mt-2">Delayed Supply Response</div>
          <p className="text-xs text-[#52635A] mt-2 leading-relaxed">
            Because agricultural crops have multi-month growing periods, price adjustments cannot occur instantaneously, creating cyclic price volatility that can be predicted and mitigated.
          </p>
        </section>
      </div>
    </div>
  )
}
