import React from 'react';
import {
  Cpu, Layers, Globe, Zap, Activity, Terminal, CheckCircle2,
} from 'lucide-react';

/* ─── Static real architecture params ─── */
const ARCH_PARAMS = [
  { key: 'PRIMARY INFERENCE',   value: 'NVIDIA RTX 3050 (Local Edge Node)',        color: '#5df0a8' },
  { key: 'AVG LATENCY',         value: '~290ms – 450ms per tile',                   color: '#00d4ff' },
  { key: 'AI BACKBONE',         value: 'SwinIR / BSRGAN (4× Resolution Synthesis)', color: '#5df0a8' },
  { key: 'UNCERTAINTY ENGINE',  value: '10× Monte Carlo Stochastic Passes',         color: '#00d4ff' },
  { key: 'DATA SOURCE',         value: 'Copernicus Sentinel-2 L2A (10m/px)',        color: '#5df0a8' },
  { key: 'WEB FRAMEWORK',       value: 'FastAPI (Python) + React (Vite)',            color: '#00d4ff' },
  { key: 'METRICS',             value: 'PSNR · SSIM · SAM (Spectral Angle)',       color: '#5df0a8' },
  { key: 'GEO SUPPORT',         value: 'GeoTIFF CRS via rasterio (EPSG:4326)',     color: '#00d4ff' },
];

/* ─── Architecture card data ─── */
const ARCH_CARDS = [
  {
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    title: 'Swin2SR & BSRGAN',
    desc: 'Sub-pixel attention backbone. 4× resolution synthesis (10m → 2.5m). Swin Transformer V2 with residual feature aggregation.',
    tag: 'TRANSFORMER',
    tagColor: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    title: 'Monte Carlo Uncertainty',
    desc: '10 stochastic forward passes with MC Dropout active. Pixel-wise variance mapped to JET heatmap for analyst confidence scoring.',
    tag: 'UNCERTAINTY',
    tagColor: 'text-cyan-300 bg-cyan-500/10 ring-cyan-500/20',
    glow: 'rgba(0,212,255,0.10)',
  },
  {
    icon: <Layers className="w-5 h-5 text-teal-400" />,
    title: 'Canny Wireframe Layer',
    desc: 'Tight threshold (100/200) Canny edge detection on BSRGAN output. Neon-cyan tactical wireframe for structural geometry extraction.',
    tag: 'STRUCTURAL',
    tagColor: 'text-teal-300 bg-teal-500/10 ring-teal-500/20',
    glow: 'rgba(45,211,138,0.10)',
  },
  {
    icon: <Globe className="w-5 h-5 text-indigo-400" />,
    title: 'GeoTIFF CRS Ingestion',
    desc: 'rasterio stream-reads uploaded GeoTIFFs and extracts the Coordinate Reference System (EPSG). Metadata forwarded to frontend HUD.',
    tag: 'GEO-METADATA',
    tagColor: 'text-indigo-300 bg-indigo-500/10 ring-indigo-500/20',
    glow: 'rgba(99,102,241,0.10)',
  },
];

/* ─── Pipeline stages ─── */
const PIPELINE_STAGES = [
  { step: '01', label: 'Tile Ingestion',       detail: 'PNG / TIFF uploaded via FastAPI multipart endpoint. CRS extracted if GeoTIFF.' },
  { step: '02', label: 'Pre-processing',        detail: 'Bicubic resize to model input dimensions. Normalise to [0, 1] float32 tensor.' },
  { step: '03', label: 'BSRGAN 4× SR Pass',    detail: 'Single deterministic forward pass through BSRGAN on CUDA. Output: 4× tensor.' },
  { step: '04', label: 'MC Dropout (×10)',      detail: 'Dropout layers kept active. 10 stochastic passes averaged. Variance extracted per pixel.' },
  { step: '05', label: 'Analytical Layers',     detail: 'Canny Wireframe + VARI Vegetation Index computed from SR numpy array.' },
  { step: '06', label: 'Metric Computation',    detail: 'PSNR, SSIM, SAM computed against bicubic baseline. Latency timestamped.' },
  { step: '07', label: 'Base64 Serialisation',  detail: 'All outputs PNG-encoded → base64 → JSON payload returned to React frontend.' },
];

export default function PipelinePage() {
  return (
    <div className="sm:px-6 lg:px-8 [animation:fadeSlideIn_0.8s_ease-out_0.2s_both] max-w-7xl mx-auto px-4 py-8">
      {/* ── Outer Glassmorphism Shell ── */}
      <div className="overflow-hidden bg-neutral-950/60 border border-white/20 border-dashed rounded-2xl mt-4 relative backdrop-blur-xl shadow-2xl">

        {/* Layered background: radial beam + ambient orbs + subtle grid */}
        <div className="pointer-events-none absolute inset-0">
          {/* Main emerald/blue radial gradient */}
          <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(65%_65%_at_50%_50%,black,transparent)] bg-[radial-gradient(1200px_400px_at_50%_-10%,rgba(16,185,129,0.25),transparent),radial-gradient(1200px_600px_at_50%_120%,rgba(59,130,246,0.2),transparent)]" />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(75%_75%_at_50%_40%,black,transparent)] bg-[radial-gradient(circle,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:24px_24px]" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
          {/* Ambient glow orb – emerald top-left */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />
          {/* Ambient glow orb – cyan bottom-right */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/8 blur-[80px]" />
        </div>

        {/* ── Content ── */}
        <div className="relative flex flex-col px-6 pt-12 pb-14">

          {/* Section badge + header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-400/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-xl font-light tabular-nums text-emerald-300">01</span>
              <span className="text-emerald-300/40">/</span>
              <span className="uppercase text-[11px] tracking-widest font-mono">SYSTEM ARCHITECTURE</span>
            </div>
            <h2 className="[animation:fadeSlideIn_0.8s_ease-out_0.2s_both] text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight mb-3">
              Tactical Edge Inference Pipeline
            </h2>
            <p className="[animation:fadeSlideIn_0.8s_ease-out_0.3s_both] text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              A low-latency, RTX-accelerated stack combining Swin Transformer super-resolution, Monte Carlo uncertainty bounds, and spatial GeoTIFF projection.
            </p>
          </div>

          {/* ── Architecture Highlights – full width 4-col ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {ARCH_CARDS.map((card, i) => (
              <div
                key={i}
                className="relative bg-black/50 border border-white/10 rounded-xl p-4 backdrop-blur-md hover:border-white/25 transition-all duration-300 overflow-hidden group"
              >
                {/* Per-card ambient glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                  style={{ background: `radial-gradient(160px 120px at 50% 50%, ${card.glow}, transparent)` }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-white/5 ring-1 ring-white/10">{card.icon}</div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ring-1 ${card.tagColor}`}>
                      {card.tag}
                    </span>
                  </div>
                  <h4 className="text-white text-sm font-semibold mb-1">{card.title}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Bento: Terminal (left) + Pipeline + Compliance (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

            {/* LEFT: Static System Architecture Terminal */}
            <div className="overflow-hidden bg-neutral-950/90 rounded-2xl ring-1 ring-white/10 relative shadow-2xl flex flex-col">
              {/* Inner glow */}
              <div className="absolute -top-8 -right-8 bg-emerald-500/10 w-64 h-64 rounded-full blur-3xl pointer-events-none" />

              {/* macOS-style terminal chrome */}
              <div className="flex items-center gap-3 bg-[#1C1C1E] border-b border-white/10 px-4 py-3 flex-shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm" />
                <div className="flex items-center gap-2 ml-2">
                  <Terminal size={12} className="text-zinc-500" />
                  <span className="text-xs font-mono text-zinc-400">gitgrow@edge ~ system-parameters</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-full px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-300">LIVE</span>
                </div>
              </div>

              {/* Terminal telemetry rows */}
              <div className="px-5 py-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                    — System Architecture Parameters —
                  </div>
                  {ARCH_PARAMS.map(({ key, value, color }, i) => (
                    <div
                      key={i}
                      className="grid items-center py-2.5 border-b border-white/5 last:border-0"
                      style={{ gridTemplateColumns: '1fr auto', gap: '12px' }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-600 font-mono text-xs select-none flex-shrink-0">$</span>
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide truncate">
                          {key}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-right whitespace-nowrap" style={{ color }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] font-mono text-emerald-300">
                    All systems verified · SIH 2026 PS 26142 compliant
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Pipeline stages + Compliance stacked */}
            <div className="flex flex-col gap-5">

              {/* Inference Pipeline */}
              <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden ring-1 ring-white/10 flex-1">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                  <Activity size={13} className="text-cyan-400" />
                  <span className="text-xs font-mono text-zinc-300 uppercase tracking-widest">Inference Pipeline</span>
                </div>
                <div className="px-4 py-4 space-y-3.5">
                  {PIPELINE_STAGES.map(({ step, label, detail }) => (
                    <div key={step} className="flex gap-3 group">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] font-mono tabular-nums w-5 text-center rounded-sm bg-white/5 text-zinc-400 leading-4 py-0.5">{step}</span>
                        {step !== '07' && <div className="w-px flex-1 bg-white/8 min-h-[8px]" />}
                      </div>
                      <div className="pb-1">
                        <div className="text-xs font-semibold text-white mb-0.5 group-hover:text-emerald-300 transition-colors">{label}</div>
                        <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">{detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIH Compliance */}
              <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 ring-1 ring-emerald-500/10 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest">SIH Compliance</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    'PS 26142 — Satellite SR via ML',
                    'NTRO Tactical Intelligence Brief',
                    'GeoTIFF CRS Metadata Standard',
                    'Uncertainty Quantification (MC)',
                    'PSNR / SSIM / SAM Metric Stack',
                    'Edge Deployment Architecture',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-[11px] font-mono text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
