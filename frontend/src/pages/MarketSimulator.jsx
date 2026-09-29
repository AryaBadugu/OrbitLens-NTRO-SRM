import { useMemo, useState } from 'react'
import { Activity, CloudRain, RotateCcw, Sparkles, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

import { useCommodity } from '../context/CommodityContext'

export default function MarketSimulator() {
  const { commodityInfo } = useCommodity()
  const [rain, setRain] = useState(30)
  const [arrivals, setArrivals] = useState(-15)
  const [heat, setHeat] = useState(1)

  const base = 3125
  const predicted = Math.round(base * (1 + rain * 0.0015 - arrivals * 0.002 + heat * 0.012))

  const series = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        d: `Season ${i + 1}`,
        base: base + Math.round(i * 18),
        scenario: Math.round(base + Math.round(i * 18) + (predicted - base) * (i / 7)),
      })),
    [predicted]
  )

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      <div>
        <div className="eyebrow">COBWEB SIMULATION ENGINE</div>
        <h1 className="page-title">{commodityInfo.emoji} {commodityInfo.name} Price Simulator</h1>
        <p className="page-desc max-w-2xl">
          Stress-test market equilibrium cobweb models for {commodityInfo.name} by adjusting rainfall deviation, arrival shifts, and heat anomalies.
        </p>
      </div>

      <div className="two-grid">
        {/* Controls */}
        <section className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div>
              <div className="section-title">{commodityInfo.name} Cobweb Model</div>
              <div className="source-note mt-0.5">Cobweb Equation Levers for {commodityInfo.name}</div>
            </div>
            <span className="chip chip-slate">SIMULATION MODEL</span>
          </div>

          <Slider
            label="Rainfall Anomaly"
            value={rain}
            setValue={setRain}
            min={-50}
            max={100}
            suffix="%"
            icon={<CloudRain className="text-[#087F5B]" size={16} />}
          />
          <Slider
            label="Arrival Shift"
            value={arrivals}
            setValue={setArrivals}
            min={-40}
            max={40}
            suffix="%"
            icon={<Activity className="text-blue-600" size={16} />}
          />
          <Slider
            label="Temperature Anomaly"
            value={heat}
            setValue={setHeat}
            min={-3}
            max={5}
            suffix="°C"
            icon={<TrendingUp className="text-amber-600" size={16} />}
          />

          <div className="flex gap-2 mt-6">
            <button className="btn-primary flex-1 flex items-center justify-center gap-1.5">
              <Sparkles size={15} /> Run Simulation
            </button>
            <button
              onClick={() => {
                setRain(30)
                setArrivals(-15)
                setHeat(1)
              }}
              className="btn-secondary"
              title="Reset Controls"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </section>

        {/* Chart Output */}
        <section className="panel panel-pad">
          <div className="flex justify-between items-center">
            <div className="section-title">Projected Cobweb Response</div>
            <span className="chip chip-amber">MODEL FORECAST</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-[#F8FAF7] border border-[#DCE5DE] p-3.5">
              <div className="eyebrow">Baseline Price</div>
              <div className="metric mt-1 text-[#102018]">₹{base.toLocaleString('en-IN')}/q</div>
              <div className="source-note mt-0.5">Historical Average</div>
            </div>
            <div className="rounded-xl bg-[#EBFBEE] border border-[#C3FACD] p-3.5">
              <div className="eyebrow text-[#087F5B]">Simulated Price</div>
              <div className="metric mt-1 text-[#087F5B]">₹{predicted.toLocaleString('en-IN')}/q</div>
              <div className="text-xs font-bold text-[#087F5B] mt-0.5">
                {((predicted / base - 1) * 100).toFixed(1)}% vs baseline
              </div>
            </div>
          </div>

          <div className="chart-wrap mt-4" style={{ minHeight: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series}>

                <CartesianGrid vertical={false} stroke="#E9ECEF" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#52635A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#52635A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #DCE5DE', fontSize: 12 }} />
                <Line type="monotone" dataKey="base" stroke="#52635A" strokeDasharray="4 4" strokeWidth={2} name="Baseline" />
                <Line type="monotone" dataKey="scenario" stroke="#087F5B" strokeWidth={2.5} name="Simulated Scenario" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Signals Summary */}
      <div className="three-grid">
        <Signal
          title="Supply Pressure Index"
          value={arrivals < 0 ? 'High Risk' : 'Normal'}
          text="Reduced arrivals amplify cobweb price dynamics."
        />
        <Signal
          title="Environmental Pressure"
          value={rain > 20 ? 'Elevated' : 'Normal'}
          text="Rainfall deviation translated into yield adjustment."
        />
        <Signal
          title="Cobweb Model Basis"
          value="System Difference Equations"
          text="Explicit mathematical simulation of farmer planting decisions."
        />
      </div>
    </div>
  )
}

function Slider({ label, value, setValue, min, max, suffix, icon }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-[#102018] flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </span>
        <b className="text-xs text-[#087F5B] bg-[#EBFBEE] px-2 py-0.5 rounded font-extrabold">
          {value > 0 ? `+${value}` : value}{suffix}
        </b>
      </div>
      <input
        className="w-full mt-2.5 accent-[#087F5B]"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-[#52635A] mt-1 font-semibold">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}

function Signal({ title, value, text }) {
  return (
    <div className="panel panel-pad">
      <div className="eyebrow">{title}</div>
      <div className="metric mt-2 text-[#102018]">{value}</div>
      <p className="text-xs text-[#52635A] mt-1 leading-relaxed">{text}</p>
    </div>
  )
}
