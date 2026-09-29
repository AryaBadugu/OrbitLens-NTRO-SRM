import { useMemo, useState, useEffect } from 'react'
import { Download, Filter, MapPin, Search, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { api } from '../services/api'

import { useCommodity } from '../context/CommodityContext'

export default function HistoricalData({ globalSearch = '' }) {
  const { selectedCommodity, setSelectedCommodity, commodityInfo, commodities, commodityKeys } = useCommodity()
  const [commodity, setCommodity] = useState(commodityInfo.name)
  const [state, setState] = useState('All')
  const [search, setSearch] = useState(globalSearch || '')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCommodity(commodityInfo.name)
  }, [commodityInfo.name])

  useEffect(() => {
    setSearch(globalSearch || '')
  }, [globalSearch])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const commArg = commodity === 'All' ? null : commodity
      const stateArg = state === 'All' ? null : state
      const res = await api.marketPrices(commArg, stateArg, null, null, 100)
      if (res && Array.isArray(res.records)) {
        setRecords(res.records)
      }
    } catch (err) {
      console.warn('Failed to fetch Mandi Explorer records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [commodity, state])

  const rows = useMemo(
    () =>
      (records || []).filter((r) =>
        r &&
        `${r.commodity || ''} ${r.market || ''} ${r.district || ''} ${r.state || ''}`
          .toLowerCase()
          .includes((search || '').toLowerCase())
      ),
    [records, search]
  )

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">MARKET DATA</div>
        <h1 className="page-title">Mandi Explorer</h1>
        <p className="page-desc max-w-2xl">
          Search and compare Indian agricultural markets, normalized arrivals, and climate-linked price signals in real time.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="panel panel-pad">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="search-box flex-1">
            <Search size={16} className="text-[#52635A] flex-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search market, commodity or district..."
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              className="select"
              value={commodity}
              onChange={(e) => {
                const val = e.target.value
                setCommodity(val)
                if (val !== 'All') {
                  setSelectedCommodity(val)
                }
              }}
            >
              <option value="All">All Commodities</option>
              {commodityKeys.map((k) => (
                <option key={k} value={commodities[k].name}>
                  {commodities[k].label}
                </option>
              ))}
            </select>

            <select
              className="select"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="All">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Punjab">Punjab</option>
            </select>

            <button onClick={fetchRecords} className="btn-secondary flex items-center gap-1.5">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="two-grid">
        <div className="panel panel-pad">
          <div className="section-title">Government Mandi Coverage</div>
          <div className="metric mt-2 text-[#102018]">4,367 Mandis</div>
          <div className="source-note mt-1">Synchronized with Government of India AGMARKNET / OGD Feeds</div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-[#087F5B] rounded-full" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#52635A] font-semibold">
            <span>Data Synchronization Coverage</span>
            <b>85% Active Feeds</b>
          </div>
        </div>

        <div className="panel panel-pad">
          <div className="section-title">Climate-Sensitive Focus Commodities</div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {commodityKeys.map((k) => (
              <button
                key={k}
                onClick={() => setSelectedCommodity(k)}
                className={`chip cursor-pointer transition-colors ${selectedCommodity === k ? 'chip-green font-bold' : 'chip-slate'}`}
              >
                {commodities[k].emoji} {commodities[k].name}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#52635A] mt-3 leading-relaxed">
            Prioritizing high environmental sensitivity crops where rainfall anomalies, temperature spikes, or harvest delays dictate price movements.
          </p>
        </div>
      </div>

      {/* Main Records Table */}
      <section className="panel panel-pad">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="section-title">Normalized Market Records</div>
            <div className="source-note mt-0.5">Showing {rows.length} verified observations</div>
          </div>
          <span className="chip chip-green">OGD LIVE / CACHED</span>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="min-w-[850px]">
            <div className="grid grid-cols-[1.3fr_1.1fr_1.1fr_0.9fr_0.9fr_0.9fr] px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-[#52635A]">
              <span>Commodity</span>
              <span>Market</span>
              <span>District / State</span>
              <span>Min Price</span>
              <span>Max Price</span>
              <span>Modal Price</span>
            </div>

            {rows.map((r, idx) => (
              <div className="table-row grid-cols-[1.3fr_1.1fr_1.1fr_0.9fr_0.9fr_0.9fr] px-3" key={r?.id || idx}>
                <span className="font-bold text-xs text-[#102018]">{r?.commodity || ''} <span className="text-[10px] text-[#52635A] font-normal">({r?.variety || ''})</span></span>
                <span className="text-xs text-[#102018] font-semibold flex gap-1 items-center">
                  <MapPin size={11} className="text-[#087F5B]" />{r?.market || ''}
                </span>
                <span className="text-xs text-[#52635A]">{r?.district || ''}, {r?.state || ''}</span>
                <span className="text-xs text-[#52635A]">₹{r?.min_price || 0}</span>
                <span className="text-xs text-[#52635A]">₹{r?.max_price || 0}</span>
                <span className="text-xs font-extrabold text-[#087F5B]">₹{r?.modal_price || 0} / q</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
