import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import PlanetBackground from './components/PlanetBackground';
import ExpandableNavbar from './components/ExpandableNavbar';
import UploadZone from './components/UploadZone';
import Viewer from './components/Viewer';
import Sidebar from './components/Sidebar';
import PipelinePage from './pages/PipelinePage';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000';

/* ── SVG Icons ── */
const IconBolt = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>
  </svg>
);
const IconGlobe = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/>
    <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>
  </svg>
);
const IconShield = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const IconCpu = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x={4} y={4} width={16} height={16} rx={2}/>
    <rect x={8} y={8} width={8} height={8}/><line x1={12} y1={2} x2={12} y2={4}/>
    <line x1={12} y1={20} x2={12} y2={22}/><line x1={2} y1={12} x2={4} y2={12}/>
    <line x1={20} y1={12} x2={22} y2={12}/>
  </svg>
);
const IconLayers = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconUpload = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1={12} y1={12} x2={12} y2={21}/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

/* ── Dashboard Page: Isolated component so reveal observer re-runs on mount ── */
function DashboardPage({
  tiles, selectedTile, uploadedFile, metadata, metrics, isProcessing,
  lowResUrl, highResUrl, uncertaintyUrl, edgeUrl, vegetationUrl,
  onSelectTile, onFileSelect, onEnhance,
}) {
  /* Re-run reveal observer every time this page mounts */
  useEffect(() => {
    const run = () => {
      const els = document.querySelectorAll('[data-reveal]:not(.in)');
      if (!els.length) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      els.forEach(el => obs.observe(el));
      return () => obs.disconnect();
    };
    // Small rAF delay so DOM has painted before observer starts
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, []);

  const activeName = selectedTile ? selectedTile.name : uploadedFile ? uploadedFile.name : null;
  const hasTarget  = Boolean(selectedTile || uploadedFile || lowResUrl);

  return (
    <>
      {/* ── Hero section ── */}
      <header className="ntro-hero">
        <span className="ntro-eyebrow" data-reveal style={{'--rd':'0ms'}}>
          SIH 2026 · Problem Statement 26142 · NTRO
        </span>
        <h1 className="ntro-hero-title" data-reveal style={{'--rd':'80ms'}}>
          Tactical Geospatial Intelligence.
        </h1>
        <p className="ntro-hero-sub" data-reveal style={{'--rd':'180ms'}}>
          Next-generation spatial reconstruction and uncertainty quantification for medium-resolution satellite imagery. Engineered for secure, low-latency edge deployments.
        </p>
        <div className="ntro-mission-badges" data-reveal style={{'--rd':'280ms'}}>
          {[
            { icon: <IconBolt/>, label: '4× BSRGAN Upscaling' },
            { icon: <IconShield/>, label: 'MC Dropout Uncertainty' },
            { icon: <IconLayers/>, label: 'Canny Structural Edge' },
            { icon: <IconGlobe/>, label: 'GeoTIFF CRS Support' },
            { icon: <IconCpu/>, label: 'Edge-Accelerated Inference' },
          ].map(({ icon, label }) => (
            <span className="ntro-mission-badge" key={label}>{icon}{label}</span>
          ))}
        </div>
      </header>

      {/* ── Intelligence Engine ── */}
      <section className="ntro-intel-section">
        <div className="ntro-intel-section-inner">
          <div className="ntro-section-head" data-reveal style={{'--rd':'0ms'}}>
            <span className="ntro-eyebrow">Intelligence Engine</span>
            <h2>Tactical Geospatial Analysis Platform</h2>
            <p>Upload a satellite tile or select a preloaded Sentinel-2 scene to run the full Swin2SR pipeline.</p>
          </div>

          <div
            className="ntro-dashboard-container"
            data-reveal
            style={{'--rd':'80ms'}}
          >
            {/* Left Panel (Sidebar/Controls): 320px seamless sidebar */}
            <aside className="ntro-aura-sidebar">
              <div className="ntro-sidebar-header">
                <div className="ntro-sidebar-title font-mono">
                  <IconLayers />
                  <span>MISSION CONTROLS</span>
                </div>
                <span className="ntro-sidebar-badge font-mono">ACTIVE</span>
              </div>

              <div className="ntro-sidebar-body">
                {/* Target Tile Upload */}
                <div className="ntro-sidebar-section">
                  <div className="ntro-section-label font-mono">
                    <IconUpload />
                    <span>TARGET TILE UPLOAD</span>
                  </div>
                  <UploadZone onFileSelect={onFileSelect} compact />
                </div>

                {/* Preloaded Scenes */}
                {tiles.length > 0 && (
                  <div className="ntro-sidebar-section ntro-scenes-section">
                    <div className="ntro-section-label font-mono">
                      <IconGlobe />
                      <span>PRELOADED SCENES ({tiles.length})</span>
                    </div>
                    <Sidebar
                      selectedTile={selectedTile}
                      onSelectTile={onSelectTile}
                      onFileSelect={onFileSelect}
                      tiles={tiles}
                      compact
                    />
                  </div>
                )}

                {/* Active Tile Telemetry */}
                {Object.keys(metadata).length > 0 && (
                  <div className="ntro-sidebar-section ntro-meta-section">
                    <div className="ntro-section-label font-mono">
                      <IconShield />
                      <span>ACTIVE TELEMETRY</span>
                    </div>
                    <div className="ntro-meta-compact-list font-mono">
                      {Object.entries(metadata).slice(0, 5).map(([k, v]) => (
                        <div key={k} className="ntro-meta-compact-row">
                          <span className="ntro-meta-compact-key">{k.replace(/_/g, ' ')}</span>
                          <span className="ntro-meta-compact-val">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Stage (Right Panel) */}
            <main className="ntro-aura-stage">
              {hasTarget ? (
                <Viewer
                  lowResUrl={lowResUrl}
                  highResUrl={highResUrl}
                  uncertaintyUrl={uncertaintyUrl}
                  edgeUrl={edgeUrl}
                  vegetationUrl={vegetationUrl}
                  tileName={activeName || 'UPLOADED TARGET TILE'}
                  onRequestEnhance={onEnhance}
                  isProcessing={isProcessing}
                  metrics={metrics}
                  metadata={metadata}
                />
              ) : (
                <div className="ntro-stage-empty font-mono">
                  <div className="ntro-empty-icon">
                    <IconUpload />
                  </div>
                  <h3>NO TARGET TILE LOADED</h3>
                  <p>Select a preloaded Sentinel-2 scene from the sidebar or upload a custom satellite tile to activate inference.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Root App ── */
export default function App() {
  const location = useLocation();

  /* ── Connection / model state ── */
  const [isConnected, setIsConnected] = useState(false);
  const [gpuStatus, setGpuStatus]     = useState('CUDA Accelerated');
  const [modelStatus, setModelStatus] = useState('Swin2SR Active');

  /* ── Tile / file state ── */
  const [selectedTile, setSelectedTile]  = useState(null);
  const [uploadedFile, setUploadedFile]  = useState(null);
  const [tiles, setTiles]                = useState([]);
  const [metrics, setMetrics]            = useState({});
  const [metadata, setMetadata]          = useState({});

  /* ── Enhancement state ── */
  const [isProcessing, setIsProcessing]     = useState(false);
  const [lowResUrl, setLowResUrl]           = useState(null);
  const [highResUrl, setHighResUrl]         = useState(null);
  const [uncertaintyUrl, setUncertaintyUrl] = useState(null);
  const [edgeUrl, setEdgeUrl]               = useState(null);
  const [vegetationUrl, setVegetationUrl]   = useState(null);

  /* ── Health check + tiles ── */
  useEffect(() => {
    const tryHealth = (url) =>
      axios.get(url).then(res => {
        setIsConnected(true);
        setGpuStatus(res.data.gpu ? 'CUDA Accelerated' : 'CPU Fallback');
        setModelStatus(res.data.model || 'Swin2SR Active');
      });

    tryHealth(`${API_BASE}/api/health`).catch(() =>
      tryHealth(`${API_BASE}/health`).catch(() => setIsConnected(false))
    );

    axios.get(`${API_BASE}/api/tiles`)
      .then(res => { if (Array.isArray(res.data) && res.data.length > 0) setTiles(res.data); })
      .catch(() => {});
  }, []);

  /* ── Reset ── */
  const resetEnhancement = () => {
    setHighResUrl(null); setUncertaintyUrl(null);
    setEdgeUrl(null); setVegetationUrl(null); setMetrics({});
  };

  /* ── Select preloaded tile ── */
  const handleSelectTile = (tile) => {
    setSelectedTile(tile);
    setUploadedFile(null);
    resetEnhancement();
    setLowResUrl(`${API_BASE}/api/tiles/${tile.id}/preview`);
    setMetadata({
      crs: 'EPSG:4326', resolution: tile.original_resolution || '10m / px',
      enhanced_resolution: tile.enhanced_resolution || '2.5m / px',
      dimensions: '256 × 256 px', bands: 'RGB (Sentinel-2 L2A)',
      source: tile.region_label || tile.region || 'Sentinel-2 L1C',
    });
  };

  /* ── Core enhancement POST ── */
  const executeEnhancement = useCallback(async (fileBlob, filename = 'target_tile.png') => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', fileBlob, filename);
      let res;
      try {
        res = await axios.post(`${API_BASE}/api/enhance`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000,
        });
      } catch {
        res = await axios.post(`${API_BASE}/enhance`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000,
        });
      }
      if (res?.data?.status === 'success') {
        setHighResUrl(res.data.enhanced_base64 || `${API_BASE}${res.data.enhanced_path}`);
        if (res.data.original_base64) setLowResUrl(res.data.original_base64);
        const heatmap = res.data.heatmap_base64 || res.data.uncertainty_base64 ||
          (res.data.uncertainty_path ? `${API_BASE}${res.data.uncertainty_path}` : null);
        if (heatmap) setUncertaintyUrl(heatmap);
        const edge = res.data.edge_image || res.data.edge_base64;
        if (edge) setEdgeUrl(edge);
        const veg = res.data.vegetation_image || res.data.vegetation_base64;
        if (veg) setVegetationUrl(veg);
        const m = res.data.metrics || {};
        setMetrics(m);
        setMetadata(prev => ({
          ...prev,
          crs: res.data.crs_info || m.crs || m.crs_info || prev.crs || 'EPSG:4326 (WGS 84)',
          resolution: m.input_resolution || prev.resolution || '10m / pixel',
          enhanced_resolution: m.enhanced_resolution || '2.5m / pixel',
          dimensions: m.dimensions_in ? `${m.dimensions_in} → ${m.dimensions_out}` : prev.dimensions,
        }));
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Enhancement failed';
      setMetrics({ error: detail });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /* ── File select → immediate enhance ── */
  const handleFileSelect = (file) => {
    setUploadedFile(file);
    setSelectedTile(null);
    resetEnhancement();
    setLowResUrl(URL.createObjectURL(file));
    const isTiff = /\.tiff?$/i.test(file.name);
    setMetadata({
      crs: isTiff ? 'Reading GeoTIFF CRS…' : 'EPSG:4326 (WGS 84)',
      resolution: '10m / px (Raw)',
      enhanced_resolution: '2.5m / px (Swin2SR)',
      dimensions: file.name,
      bands: file.type || 'RGB Satellite Tile',
      source: 'User Upload (Target Tile)',
    });
    executeEnhancement(file, file.name);
  };

  /* ── Re-run enhance button ── */
  const handleEnhance = useCallback(async () => {
    if (isProcessing) return;
    if (uploadedFile) {
      await executeEnhancement(uploadedFile, uploadedFile.name);
    } else if (selectedTile) {
      try {
        setIsProcessing(true);
        const res = await fetch(`${API_BASE}/api/tiles/${selectedTile.id}/preview`);
        if (!res.ok) throw new Error('Failed to fetch tile preview');
        const blob = await res.blob();
        await executeEnhancement(blob, `${selectedTile.filename || selectedTile.id + '.jpg'}`);
      } catch (err) {
        setIsProcessing(false);
        setMetrics({ error: err.message });
      }
    }
  }, [isProcessing, uploadedFile, selectedTile, executeEnhancement]);

  return (
    <>
      {/* ── WebGL planet — lives outside Routes, never remounts ── */}
      <PlanetBackground />

      {/* ── ExpandableNavbar component ── */}
      <ExpandableNavbar
        isConnected={isConnected}
        gpuStatus={gpuStatus}
        modelStatus={modelStatus}
      />

      {/* ── Page shell (below fixed nav, above planet canvas) ── */}
      <div className="ntro-app">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                tiles={tiles}
                selectedTile={selectedTile}
                uploadedFile={uploadedFile}
                metadata={metadata}
                metrics={metrics}
                isProcessing={isProcessing}
                lowResUrl={lowResUrl}
                highResUrl={highResUrl}
                uncertaintyUrl={uncertaintyUrl}
                edgeUrl={edgeUrl}
                vegetationUrl={vegetationUrl}
                onSelectTile={handleSelectTile}
                onFileSelect={handleFileSelect}
                onEnhance={handleEnhance}
              />
            }
          />
          <Route path="/architecture" element={<PipelinePage />} />
          <Route path="/pipeline" element={<Navigate to="/architecture" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* ── Footer ── */}
        <footer className="ntro-footer">
          <div>
            <div className="ntro-footer-brand">
              <span className="ntro-footer-brand-mark">▲</span>
              <span style={{letterSpacing:'.1em', fontWeight:800}}>TEAM GITGROW · NTRO</span>
            </div>
            <div className="ntro-footer-tagline">Tactical Geospatial Intelligence Platform · SIH 2026 PS 26142</div>
          </div>
          <div className="ntro-footer-links">
            <NavLink to="/">Command Center</NavLink>
            <NavLink to="/architecture">Architecture</NavLink>
          </div>
          <div className="ntro-copyright font-mono">
            © 2026 Team GitGrow — Tactical Geospatial Intelligence.
          </div>
        </footer>
      </div>
    </>
  );
}
