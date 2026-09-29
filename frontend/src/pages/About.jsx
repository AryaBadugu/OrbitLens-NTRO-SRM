import { ExternalLink, Database, CloudRain, CheckCircle2 } from 'lucide-react'

export default function About() {
  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">DATA & METHODOLOGY</div>
        <h1 className="page-title">Built for Indian Agricultural Commodity Intelligence</h1>
        <p className="page-desc max-w-2xl">
          KrishiPulse connects Government of India AGMARKNET mandi feeds and IMD weather logs with explainable commodity market analytics.
        </p>
      </div>

      <div className="two-grid">
        <Source
          title="Government of India AGMARKNET / OGD"
          icon={<Database size={18} />}
          body="India's Open Government Data platform publishes daily mandi commodity prices including minimum, maximum, and modal price fields across APMCs nationwide."
          href="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi"
        />
        <Source
          title="India Meteorological Department (IMD)"
          icon={<CloudRain size={18} />}
          body="IMD provides observations for current weather, district rainfall, state rainfall, forecasts, and warnings to supply the meteorological intelligence layer."
          href="https://api.imd.gov.in/public/api_reference.html"
        />
      </div>

      <section className="panel panel-pad">
        <div className="section-title">Core Product Principles</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {[
            ['Evidence First', 'Expose the meteorological and market input signals behind every recommendation.'],
            ['India-Specific Context', 'Tailored for Indian mandi structures, crop calendars, and local weather patterns.'],
            ['Model Humility', 'Expose confidence scores and clear data source provenance instead of presenting forecasts as facts.'],
          ].map(([a, b]) => (
            <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#DCE5DE]" key={a}>
              <CheckCircle2 size={18} className="text-[#087F5B]" />
              <b className="text-xs text-[#102018] block mt-2.5">{a}</b>
              <p className="text-xs text-[#52635A] mt-1 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-[#C3FACD] bg-[#EBFBEE] p-4 text-xs text-[#073B2A]">
        <div className="font-bold text-sm">Implementation & Backend Status</div>
        <p className="mt-1 leading-relaxed text-[#102018]">
          Connected directly to the Python FastAPI backend engine with IPv4 AGMARKNET transport, local SQLite caching, Haversine nearest mandi calculation, IMD weather feeds, statistical price predictions, and a tool-grounded AI chatbot.
        </p>
      </div>
    </div>
  )
}

function Source({ title, icon, body, href }) {
  return (
    <div className="panel panel-pad flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#EBFBEE] text-[#087F5B] grid place-items-center">
            {icon}
          </div>
          <a href={href} target="_blank" rel="noreferrer" className="text-[#52635A] hover:text-[#102018] transition-colors">
            <ExternalLink size={16} />
          </a>
        </div>
        <div className="section-title">{title}</div>
        <p className="text-xs text-[#52635A] mt-1.5 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
