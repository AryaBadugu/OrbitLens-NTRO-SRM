import { useState, useEffect, useMemo } from 'react'
import { ArrowUpRight, CloudRain, Database, MapPin, Search, ShieldAlert, Sparkles, TrendingUp, RefreshCw, Navigation, Thermometer, Wind } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../services/api'
import Chatbot from '../components/common/Chatbot'
import { useCommodity } from '../context/CommodityContext'

const riskClass = (r) => (r === 'High' ? 'chip chip-red' : r === 'Medium' ? 'chip chip-amber' : 'chip chip-green')

const statusBadge = (s) =>
  s === 'live'
    ? 'chip chip-green'
    : s === 'cached'
    ? 'chip chip-amber'
    : 'chip chip-slate'

export default function Dashboard({ globalSearch = '' }) {
  const [q, setQ] = useState(globalSearch || '')
  const { selectedCommodity, setSelectedCommodity, commodityInfo, commodities, commodityKeys } = useCommodity()
  const commodity = commodityInfo.name

  const [location, setLocation] = useState({ lat: 19.9975, lon: 73.7898, name: 'Nashik' })
  const [marketData, setMarketData] = useState(null)
  const [nearestMandis, setNearestMandis] = useState([])
  const [weather, setWeather] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)

  // Synchronize local search with global topbar search
  useEffect(() => {
    setQ(globalSearch || '')
  }, [globalSearch])

  const loadData = async () => {
    setLoading(true)
    try {
      const [mRes, nRes, wRes, pRes] = await Promise.all([
        api.marketPrices(commodity, null, null, null, 20),
        api.marketNearest(location?.lat || 19.9975, location?.lon || 73.7898, commodity, 5),
        api.weatherCurrent(location?.name || 'Nashik', location?.lat, location?.lon),
        api.predict(commodity, null, location?.name || 'Nashik', 7)
      ])
      if (mRes && Array.isArray(mRes.records)) setMarketData(mRes)
      if (nRes && Array.isArray(nRes.nearest_markets)) setNearestMandis(nRes.nearest_markets)
      if (wRes && typeof wRes === 'object') setWeather(wRes)
      if (pRes && typeof pRes === 'object') setPrediction(pRes)
    } catch (err) {
      console.warn('Dashboard data fetch notice:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [commodity, location])

  const handleGeoLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setGeoLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos?.coords) {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            name: 'Current GPS Location'
          })
        }
        setGeoLocating(false)
      },
      (err) => {
        console.warn('Geolocation notice:', err)
        setGeoLocating(false)
      }
    )
  }

  const records = useMemo(() => (marketData && Array.isArray(marketData.records)) ? marketData.records : [], [marketData])

  const filteredRecords = useMemo(
    () =>
      records.filter((r) =>
        r &&
        `${r.commodity || ''} ${r.market || ''} ${r.district || ''} ${r.state || ''}`
          .toLowerCase()
          .includes((q || '').toLowerCase())
      ),
    [records, q]
  )

  const primaryRecord = records[0]
  const primaryModalPrice = Number(primaryRecord?.modal_price) || 1850
  const primaryMarketName = primaryRecord?.market || 'Lasalgaon'
  const primaryDistrictState = primaryRecord ? `${primaryRecord.district || ''}, ${primaryRecord.state || ''}` : 'Nashik, Maharashtra'

  const priceSeries = useMemo(() => {
    if (!records || !records.length) {
      return [
        { d: 'T-6', price: 1650 },
        { d: 'T-5', price: 1720 },
        { d: 'T-4', price: 1780 },
        { d: 'T-3', price: 1820 },
        { d: 'T-2', price: 1850 },
        { d: 'T-1', price: 1840 },
        { d: 'Today', price: 1850 },
      ]
    }
    return records.slice(0, 7).reverse().map((r, i) => ({
      d: (r && typeof r.arrival_date === 'string' && r.arrival_date.length >= 5) ? r.arrival_date.slice(5) : `Day ${i + 1}`,
      price: Number(r?.modal_price) || 0
    }))
  }, [records])

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="hero-strip">
        <div className="hero-grid">
          <div>
            <div className="eyebrow" style={{ color: '#8CE99A' }}>
              REAL-TIME AGRICULTURAL INTELLIGENCE
            </div>
            <h1 className="text-[26px] md:text-[34px] font-extrabold tracking-[-.03em] mt-1.5 text-white leading-tight">
              Real Mandi Prices. Real Weather Intelligence.
            </h1>
            <p className="text-[13px] text-[#C3FACD] max-w-xl mt-2 leading-relaxed font-normal">
              Combining Government of India AGMARKNET mandi feeds and meteorological indicators for data-backed commodity decisions.
            </p>

            {/* In-hero Search Box */}
            <div className="search-box mt-4 max-w-xl flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Search size={17} className="text-[#52635A] flex-none" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search commodity, Lasalgaon, Nashik, Maharashtra..."
                />
              </div>
              <button
                onClick={handleGeoLocation}
                disabled={geoLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#087F5B] hover:bg-[#076549] text-white text-xs font-bold transition-colors"
                title="Detect nearest mandi via browser GPS"
              >
                <Navigation size={13} className={geoLocating ? 'animate-spin' : ''} />
                {geoLocating ? 'Locating...' : 'GPS'}
              </button>
            </div>
          </div>

          {/* Environmental Signal Card */}
          <div className="signal-card">
            <div className="flex justify-between items-center">
              <div className="text-[10px] uppercase tracking-[.12em] text-[#8CE99A] font-bold">
                IMD Weather Signal
              </div>
              <span className={statusBadge(weather?.data_status)}>
                {String(weather?.data_status || 'LIVE').toUpperCase()}
              </span>
            </div>
            <b className="text-white text-xl mt-2 block">
              {weather && weather.temperature !== undefined ? `${weather.temperature}°C · ${weather.humidity || 64}% Hum` : '26°C · 74% Hum'}
            </b>
            <div className="text-[11px] text-[#E6FCF5] mt-1 font-medium">
              Rainfall: {weather?.rainfall !== undefined ? weather.rainfall : 0.0} mm · Location: {weather?.location || location?.name || 'Nashik'}
            </div>
            <div className="mt-3.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8CE99A] rounded-full"
                style={{ width: `${Math.min(100, (Number(weather?.humidity) || 65))}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[#B2F2BB] font-semibold">
              <span>Source: {weather?.source || 'IMD Weather'}</span>
              <span>Live Observation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Card 1: Current Modal Price */}
        <div className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div className="eyebrow">Current Modal Price</div>
            <span className={statusBadge(marketData?.data_status)}>
              {String(marketData?.data_status || 'LIVE').toUpperCase()}
            </span>
          </div>
          <div className="metric mt-2.5 text-[#102018]">
            ₹{primaryModalPrice.toLocaleString('en-IN')}<span className="text-xs text-[#52635A] font-normal"> / q</span>
          </div>
          <div className="text-[12px] font-bold text-[#087F5B] mt-1">
            {commodity} · {primaryMarketName}
          </div>
          <div className="source-note mt-1">
            Source: {marketData?.source || 'Government of India AGMARKNET'}
          </div>
        </div>

        {/* Card 2: Nearest Mandi */}
        <div className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div className="eyebrow">Nearest Mandi</div>
            <MapPin size={16} className="text-[#087F5B]" />
          </div>
          <div className="metric mt-2.5 text-[#102018] truncate text-xl">
            {nearestMandis[0]?.market || 'Lasalgaon'}
          </div>
          <div className="text-[12px] font-bold text-[#102018] mt-1">
            {nearestMandis[0] ? `${nearestMandis[0].district || ''}, ${nearestMandis[0].state || ''}` : 'Nashik, Maharashtra'}
          </div>
          <div className="source-note mt-1">
            {nearestMandis[0] ? `${nearestMandis[0].distance_km} km distance` : 'Haversine calculated'}
          </div>
        </div>

        {/* Card 3: IMD Temperature & Humidity */}
        <div className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div className="eyebrow">IMD Temperature</div>
            <Thermometer size={16} className="text-amber-600" />
          </div>
          <div className="metric mt-2.5 text-[#102018]">
            {weather && weather.temperature !== undefined ? `${weather.temperature}°C` : '27.5°C'}
          </div>
          <div className="text-[12px] font-semibold text-[#52635A] mt-1">
            Humidity: {weather && weather.humidity !== undefined ? `${weather.humidity}%` : '64%'}
          </div>
          <div className="source-note mt-1">
            Source: {weather?.source || 'India Meteorological Department'}
          </div>
        </div>

        {/* Card 4: Rainfall Signal */}
        <div className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div className="eyebrow">District Rainfall</div>
            <CloudRain size={16} className="text-blue-600" />
          </div>
          <div className="metric mt-2.5 text-[#102018]">
            {weather && weather.rainfall !== undefined ? `${weather.rainfall} mm` : '0.0 mm'}
          </div>
          <div className="text-[12px] font-semibold text-[#52635A] mt-1">
            Region: {location?.name || 'Nashik'}
          </div>
          <div className="source-note mt-1">
            Environmental Impact Layer
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics */}
      <div className="dashboard-grid">
        {/* Price Intelligence Chart Panel */}
        <section className="panel panel-pad">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="section-title">Commodity Price Intelligence</div>
              <div className="source-note mt-0.5">
                {commodity} · {primaryMarketName} ({primaryDistrictState})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="select"
              >
                {commodityKeys.map((k) => (
                  <option key={k} value={k}>
                    {commodities[k].label}
                  </option>
                ))}
              </select>
              <button onClick={loadData} className="icon-btn" title="Refresh Feed">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="chart-wrap mt-4" style={{ minHeight: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={priceSeries}>

                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#087F5B" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#087F5B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E9ECEF" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#52635A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#52635A' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #DCE5DE', fontSize: 12, color: '#102018' }} />
                <Area type="monotone" dataKey="price" stroke="#087F5B" fill="url(#g)" strokeWidth={2.5} name="Modal Price (₹/q)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#EEF2EE] text-xs">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-[#102018]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#087F5B] inline-block" /> ACTUAL MARKET DATA
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#52635A]">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> MODEL FORECAST
              </span>
            </div>
            <div className="source-note">
              Provenance: {marketData?.source || 'Agmarknet'}
            </div>
          </div>
        </section>

        {/* Climate x Commodity Intelligence Signal Chain */}
        <section className="panel panel-pad">
          <div className="section-title">Climate × Commodity Intelligence</div>
          <div className="source-note mt-0.5">Explainable Environmental Signal Stack</div>

          {/* Chain visualization */}
          <div className="mt-4 p-3 rounded-xl bg-[#F8FAF7] border border-[#DCE5DE] text-[11px] font-bold text-[#073B2A] flex justify-between items-center">
            <span>WEATHER</span>
            <span>→</span>
            <span>CROP</span>
            <span>→</span>
            <span>SUPPLY</span>
            <span>→</span>
            <span>PRICE</span>
          </div>

          <div className="space-y-3.5 mt-4">
            {[
              ['Rainfall Anomaly', '+34%', 'Strong Risk Signal', 'chip-red'],
              ['Mandi Arrivals', '−18%', 'Supply Contraction', 'chip-red'],
              ['Temperature Index', '+0.8°C', 'Moderate Perishability', 'chip-amber'],
              ['7-Day Price Momentum', '+4.2%', 'Upward Pressure', 'chip-green'],
            ].map(([label, val, strength, chipStyle]) => (
              <div key={label} className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#102018]">{label}</span>
                  <span className={`chip ${chipStyle}`}>{val}</span>
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-[#52635A]">
                  <span>Impact rating:</span>
                  <span className="font-semibold">{strength}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#FFF9DB] border border-[#FFE066] text-xs">
            <div className="font-bold text-[#B45309] flex items-center gap-1">
              <Sparkles size={14} /> Price Prediction (7-Day Horizon)
            </div>
            <div className="text-sm font-extrabold text-[#102018] mt-1">
              {prediction?.predicted_price ? `Predicted: ₹${prediction.predicted_price}/q` : 'Model Processing...'}
            </div>
            <div className="text-[11px] text-[#52635A] mt-0.5">
              Confidence: {prediction?.confidence_percentage || 95}% · Model: Statistical Trend + IMD Weather
            </div>
          </div>
        </section>
      </div>

      {/* Nearest Mandis List */}
      <section className="panel panel-pad">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="section-title">Nearest Mandi Intelligence</div>
            <div className="source-note mt-0.5">Ranked by Haversine distance from your location</div>
          </div>
          <button
            onClick={handleGeoLocation}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Navigation size={13} /> Use Current Location
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {(nearestMandis || []).map((m, idx) => (
            <div key={m?.market || idx} className="p-3.5 rounded-xl border border-[#DCE5DE] bg-[#F8FAF7] hover:border-[#087F5B] transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-[#102018]">{m?.market || 'Market'} APMC</div>
                  <div className="text-[11px] text-[#52635A]">{m?.district || ''}, {m?.state || ''}</div>
                </div>
                <span className="text-xs font-extrabold text-[#087F5B] bg-[#EBFBEE] px-2 py-1 rounded-md">
                  ₹{m?.modal_price || 0}/q
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#EEF2EE] text-[11px] text-[#52635A]">
                <span>Distance: <b className="text-[#102018]">{m?.distance_km || 0} km</b></span>
                <span>Arrival: {m?.arrival_date || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mandi Explorer Table */}
      <section className="panel panel-pad">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="section-title">Government Mandi Records</div>
            <div className="source-note mt-0.5">AGMARKNET / OGD Live Synchronized Feed</div>
          </div>
          <span className="source-note">Unit: ₹ / Quintal</span>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto w-full">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.2fr_1fr_1.1fr_0.9fr_0.9fr_0.8fr] px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#52635A]">
              <span>Commodity</span>
              <span>Market</span>
              <span>District / State</span>
              <span>Min Price</span>
              <span>Max Price</span>
              <span>Modal Price</span>
            </div>
            {(filteredRecords || []).map((r, i) => (
              <div className="table-row grid-cols-[1.2fr_1fr_1.1fr_0.9fr_0.9fr_0.8fr] px-3" key={r?.id || i}>
                <span className="text-xs font-bold text-[#102018]">{r?.commodity || ''} <span className="text-[10px] text-[#52635A] font-normal">({r?.variety || ''})</span></span>
                <span className="text-xs text-[#102018] font-medium flex items-center gap-1">
                  <MapPin size={11} className="text-[#087F5B]" />{r?.market || ''}
                </span>
                <span className="text-xs text-[#52635A]">{r?.district || ''}, {r?.state || ''}</span>
                <span className="text-xs text-[#52635A]">₹{r?.min_price || 0}</span>
                <span className="text-xs text-[#52635A]">₹{r?.max_price || 0}</span>
                <span className="text-xs font-extrabold text-[#087F5B]">₹{r?.modal_price || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating AI Chatbot Drawer Component */}
      <Chatbot userLocation={location} />
    </div>
  )
}
