import { Database, CloudRain, BrainCircuit, ArrowRight, ShieldCheck } from 'lucide-react'

const steps = [
  ['01', 'Market Data Pipeline', Database, 'Government AGMARKNET daily mandi prices, modal prices, arrivals, and market metadata.'],
  ['02', 'IMD Weather Layer', CloudRain, 'District rainfall departures, temperature, humidity, forecasts, and weather alerts.'],
  ['03', 'Feature Integration', BrainCircuit, 'Aligning crop season, delays, anomalies, and market variables on a unified timeline.'],
  ['04', 'Commodity Intelligence', ShieldCheck, 'Explaining price movements, estimating risk, and generating data-backed forecasts.'],
]

export default function HowItWorks() {
  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">PRODUCT ARCHITECTURE</div>
        <h1 className="page-title">How It Works</h1>
        <p className="page-desc max-w-2xl">
          KrishiPulse is built as a robust data pipeline first and an intelligent agricultural interface second.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {steps.map(([n, t, Icon, text], i) => (
          <div className="panel panel-pad relative flex flex-col justify-between" key={n}>
            <div>
              <div className="eyebrow">{n}</div>
              <div className="w-9 h-9 rounded-lg bg-[#EBFBEE] text-[#087F5B] grid place-items-center mt-2.5">
                <Icon size={18} />
              </div>
              <div className="section-title mt-3">{t}</div>
              <p className="text-xs text-[#52635A] mt-1.5 leading-relaxed">{text}</p>
            </div>
            {i < 3 && (
              <ArrowRight className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 bg-[#F7F9F6] text-[#52635A] rounded-full p-0.5" size={18} />
            )}
          </div>
        ))}
      </div>

      <section className="panel panel-pad">
        <div className="section-title">Data Schema Contracts</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {[
            ['Market Observation Schema', 'arrival_date · mandi · district · state · commodity · min_price · max_price · modal_price'],
            ['IMD Weather Schema', 'fetched_at · district · rainfall_mm · temperature_c · humidity_pct · warning_level'],
            ['Derived Intelligence Signal', 'rainfall_anomaly · temperature_anomaly · lagged_modal_price · arrival_contraction_pct'],
          ].map(([a, b]) => (
            <div className="rounded-xl bg-[#F8FAF7] border border-[#DCE5DE] p-4" key={a}>
              <b className="text-xs text-[#102018]">{a}</b>
              <p className="font-mono text-[11px] text-[#52635A] mt-2 leading-relaxed bg-white p-2 rounded border border-slate-100">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
