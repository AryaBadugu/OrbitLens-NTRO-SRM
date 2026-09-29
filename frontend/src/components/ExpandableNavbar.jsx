import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Cpu, Layers, Globe, Activity, ShieldCheck, ArrowRight,
  Zap, Map, X,
} from 'lucide-react';

/* ── Panel content for each expandable item ── */
const ENGINE_LINKS = [
  { label: 'Super-Resolution',    description: 'Swin2SR 4× resolution synthesis', icon: <Cpu  size={14} className="text-cyan-400" /> },
  { label: 'Uncertainty Mapping', description: 'Monte Carlo stochastic passes',    icon: <Zap  size={14} className="text-emerald-400" /> },
  { label: 'Wireframe Extraction',description: 'Canny edge structural geometry',   icon: <Layers size={14} className="text-teal-400" /> },
];
const TELEMETRY_LINKS = [
  { label: 'Metadata Ingestion',  description: 'GeoTIFF stream-reads & CRS extraction', icon: <Globe    size={14} className="text-indigo-400" /> },
  { label: 'Performance Metrics', description: 'PSNR, SSIM, and SAM scoring',           icon: <Activity size={14} className="text-cyan-400" /> },
  { label: 'System Parameters',  description: 'Local edge node hardware telemetry',     icon: <Cpu      size={14} className="text-emerald-400" /> },
];

const NAV_ITEMS = [
  {
    id: 'engine',
    label: 'Core Engine',
    panel: (
      <div className="grid grid-cols-3 gap-3">
        {ENGINE_LINKS.map(link => (
          <div key={link.label} className="flex flex-col gap-1.5 bg-white/3 rounded-lg p-3 ring-1 ring-white/8">
            <span className="flex items-center gap-1.5 font-semibold text-white text-xs">
              {link.icon} {link.label}
            </span>
            <span className="text-zinc-400 text-[11px] leading-relaxed font-mono">{link.description}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    panel: (
      <div className="grid grid-cols-3 gap-3">
        {TELEMETRY_LINKS.map(link => (
          <div key={link.label} className="flex flex-col gap-1.5 bg-white/3 rounded-lg p-3 ring-1 ring-white/8">
            <span className="flex items-center gap-1.5 font-semibold text-white text-xs">
              {link.icon} {link.label}
            </span>
            <span className="text-zinc-400 text-[11px] leading-relaxed font-mono">{link.description}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'compliance',
    label: 'Compliance',
    panel: (
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 font-semibold text-white text-sm">
            <ShieldCheck size={14} className="text-emerald-400" />
            SIH PS 26142 Compliant
          </span>
          <span className="text-zinc-400 text-[11px] font-mono leading-relaxed max-w-sm">
            Meets NTRO tactical intelligence and geospatial metadata standards. PSNR / SSIM / SAM verified.
          </span>
        </div>
        <NavLink to="/architecture" className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap flex-shrink-0">
          View Architecture <ArrowRight size={12} />
        </NavLink>
      </div>
    ),
  },
];

export default function ExpandableNavbar({ isConnected, gpuStatus, modelStatus }) {
  const [openId, setOpenId] = useState(null);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleItem = (id) => setOpenId(prev => (prev === id ? null : id));
  const activeItem = NAV_ITEMS.find(n => n.id === openId);
  return (
    <div ref={ref} className="w-full fixed top-0 left-0 z-50">
      {/* ── Global Header Alignment ── */}
      <div className="flex items-center justify-between w-full px-6 py-4 absolute top-0 left-0 z-50 pointer-events-auto bg-black/40 backdrop-blur-md border-b border-white/10">
        {/* Left side: OrbitLens logo */}
        <NavLink to="/" className="text-white font-bold tracking-widest text-lg no-underline hover:opacity-90 transition-opacity">
          OrbitLens
        </NavLink>

        {/* Center: The ExpandableNavbar nav items (dead-centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {/* SPA page links */}
          <NavLink to="/" end className={({ isActive }) => `ntro-nav-pill${isActive ? ' active' : ''}`}>Intelligence</NavLink>
          <NavLink to="/architecture" className={({ isActive }) => `ntro-nav-pill${isActive ? ' active' : ''}`}>Architecture</NavLink>

          {/* Expandable items */}
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`ntro-nav-pill${openId === item.id ? ' active' : ''}`}
              style={{ border: 'none', background: openId === item.id ? 'rgba(255,255,255,.07)' : 'transparent', cursor: 'pointer' }}
            >
              {item.label}
              <svg
                width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round"
                style={{ marginLeft: 3, transform: openId === item.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease', opacity: 0.6 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          ))}
        </div>

        {/* Right side: API Status chips */}
        <div className="ntro-nav-right flex items-center gap-2">
          <div className={`ntro-status-badge${isConnected ? '' : ' offline'}`}>
            <span className="ntro-status-dot" />
            {isConnected ? `API — ${gpuStatus}` : 'Backend Offline'}
          </div>
          <div className="ntro-status-badge" style={{ background: 'rgba(0,212,255,.08)', borderColor: 'rgba(0,212,255,.22)', color: '#00d4ff' }}>
            <span className="ntro-status-dot" style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
            {modelStatus}
          </div>
        </div>
      </div>

      {/* ── Expandable panel dropdown ── */}
      <div
        className="absolute top-full left-0 right-0 z-[999]"
        style={{
          maxHeight: openId ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
          width: '100%',
          background: 'rgba(4,6,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: openId ? '1px solid rgba(150,175,230,.1)' : 'none',
        }}
      >
        {activeItem && (
          <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '16px 32px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted-2)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
                {activeItem.label}
              </span>
              <button
                onClick={() => setOpenId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: '2px' }}
              >
                <X size={12} />
              </button>
            </div>
            {activeItem.panel}
          </div>
        )}
      </div>
    </div>
  );
}
