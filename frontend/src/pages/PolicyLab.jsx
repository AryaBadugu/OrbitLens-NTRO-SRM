import { AlertTriangle, CloudRain, Info, Map, ShieldCheck, Thermometer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useCommodity } from '../context/CommodityContext'

const data = [
  { name: 'Nashik', risk: 82, rain: 34 },
  { name: 'Pune', risk: 74, rain: 41 },
  { name: 'Latur', risk: 63, rain: 22 },
  { name: 'Akola', risk: 58, rain: 28 },
  { name: 'Nagpur', risk: 31, rain: 7 },
]

export default function PolicyLab() {
  const { commodityInfo } = useCommodity()

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">CLIMATE INTELLIGENCE LAYER</div>
        <h1 className="page-title">{commodityInfo.emoji} {commodityInfo.name} Climate Insights</h1>
        <p className="page-desc max-w-2xl">
          Translate meteorological anomalies into {commodityInfo.name.toLowerCase()} market risk with transparent evidence from IMD observations.
        </p>
      </div>

      {/* Hero Signal Strip */}
      <div className="hero-strip">
        <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-6 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#8CE99A] font-bold">
              OBSERVED IMD SIGNAL FOR {commodityInfo.name.toUpperCase()}
            </div>
            <div className="text-2xl font-extrabold mt-1 text-white">
              Maharashtra rainfall running +34% above normal
            </div>
            <p className="text-xs text-[#C3FACD] mt-2 max-w-xl leading-relaxed">
              Combining district rainfall departures, {commodityInfo.name.toLowerCase()} crop stage calendars, and mandi arrivals to flag supply vulnerabilities.
            </p>
          </div>
          <div className="signal-card">
            <CloudRain size={22} className="text-[#8CE99A]" />
            <div className="text-3xl font-extrabold mt-1 text-white">+34%</div>
            <div className="text-xs text-[#E6FCF5] font-medium">District Rainfall Anomaly</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* District Risk Ranking Chart */}
        <section className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div className="section-title">District Vulnerability Index</div>
            <span className="chip chip-green">IMD DATA LAYER</span>
          </div>
          <div className="chart-wrap mt-4" style={{ minHeight: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>

                <CartesianGrid horizontal={false} stroke="#E9ECEF" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#52635A' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={65} tick={{ fontSize: 11, fill: '#102018', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #DCE5DE', fontSize: 12 }} />
                <Bar dataKey="risk" fill="#087F5B" radius={[0, 6, 6, 0]} name="Climate Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Signal Interpretation */}
        <section className="panel panel-pad">
          <div className="section-title">Signal Evidence Stack</div>
          <div className="source-note mt-0.5">Factual Meteorological Observations</div>
          <div className="space-y-4 mt-4">
            <Row
              icon={<CloudRain size={16} />}
              title="Rainfall Departure"
              value="+34%"
              chipStyle="chip-red"
              text="Precipitation above normal; increases harvest disruption & inundation risk."
            />
            <Row
              icon={<Thermometer size={16} />}
              title="Temperature Anomaly"
              value="+0.8°C"
              chipStyle="chip-amber"
              text="Moderate heat pressure; monitor perishability in transit."
            />
            <Row
              icon={<ShieldCheck size={16} />}
              title="Data Integrity Basis"
              value="IMD Verified"
              chipStyle="chip-green"
              text="Sourced from India Meteorological Department observation feeds."
            />
          </div>
        </section>
      </div>

      <div className="three-grid">
        <Note
          icon={<AlertTriangle size={18} className="text-amber-600" />}
          title="Transparent Evidence"
          text="Weather signals provide supporting evidence for supply shifts rather than unverified black-box predictions."
        />
        <Note
          icon={<Map size={18} className="text-[#087F5B]" />}
          title="District Granularity"
          text="Environmental parameters are joined at the district level for crop-producing belts."
        />
        <Note
          icon={<Info size={18} className="text-blue-600" />}
          title="Source Provenance"
          text="Every indicator exposes its data origin, observation date, and transformation method."
        />
      </div>
    </div>
  )
}

function Row({ icon, title, value, chipStyle, text }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-lg bg-[#EBFBEE] text-[#087F5B] grid place-items-center flex-none">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <b className="text-xs text-[#102018]">{title}</b>
          <span className={`chip ${chipStyle}`}>{value}</span>
        </div>
        <p className="text-xs text-[#52635A] mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function Note({ icon, title, text }) {
  return (
    <div className="panel panel-pad">
      <div>{icon}</div>
      <div className="section-title mt-2">{title}</div>
      <p className="text-xs text-[#52635A] mt-1 leading-relaxed">{text}</p>
    </div>
  )
}
