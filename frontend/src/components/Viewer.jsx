import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Crosshair,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Cpu,
  Eye,
  Zap,
  Layers,
  Leaf,
  Download,
} from 'lucide-react';
import './Viewer.css';

/**
 * Viewer — Tactical satellite image comparison component.
 *
 * Stacks Raw and Enhanced images with 1:1 absolute positioning and CSS clip-path.
 *
 * Intelligence Mode (segmented control):
 *   VISUAL      – True-colour Swin2SR super-resolved output
 *   UNCERTAINTY – MC Dropout variance heatmap overlay (RGBA JET)
 *   STRUCTURAL  – Canny Wireframe edge-detection analytical layer
 *   TERRAIN     – VARI-proxy vegetation false-colour layer
 */

const MODES = [
  { id: 'VISUAL',       label: 'VISUAL',       icon: Eye,    title: 'True-colour Swin2SR Output' },
  { id: 'UNCERTAINTY',  label: 'UNCERTAINTY',  icon: Zap,    title: 'MC Dropout Variance Heatmap' },
  { id: 'STRUCTURAL',   label: 'STRUCTURAL',   icon: Layers, title: 'Canny Wireframe Edge Map' },
  { id: 'TERRAIN',      label: 'TERRAIN',      icon: Leaf,   title: 'VARI Vegetation Index' },
];

export default function Viewer({
  lowResUrl,
  highResUrl,
  uncertaintyUrl,
  edgeUrl,
  vegetationUrl,
  tileName = 'UNKNOWN TARGET',
  onRequestEnhance,
  isProcessing = false,
  metrics = {},
  metadata = {},
}) {
  const [activeMode, setActiveMode] = useState('VISUAL');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [sliderPosition, setSliderPosition] = useState(50);

  const sliderContainerRef = useRef(null);
  const isDraggingRef = useRef(false);

  const updateSliderFromClientX = useCallback((clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    const onGlobalMove = (e) => {
      if (isDraggingRef.current) {
        updateSliderFromClientX(e.clientX);
      }
    };
    const onGlobalUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('pointermove', onGlobalMove);
    window.addEventListener('pointerup', onGlobalUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
    };
  }, [updateSliderFromClientX]);

  const handleZoomIn    = useCallback(() => setZoomLevel((z) => Math.min(z + 0.25, 3)), []);
  const handleZoomOut   = useCallback(() => setZoomLevel((z) => Math.max(z - 0.25, 0.5)), []);
  const handleZoomReset = useCallback(() => setZoomLevel(1), []);

  const hasBothImages = Boolean(lowResUrl && highResUrl);
  const hasRawImage   = Boolean(lowResUrl);

  /** Resolve which URL drives the right-hand (enhanced) pane */
  const getRightPaneSrc = () => {
    switch (activeMode) {
      case 'UNCERTAINTY': return uncertaintyUrl || highResUrl;
      case 'STRUCTURAL':  return edgeUrl        || highResUrl;
      case 'TERRAIN':     return vegetationUrl  || highResUrl;
      default:            return highResUrl;
    }
  };

  /** Whether a layer is actually available (downloaded from backend) */
  const isModeAvailable = (modeId) => {
    if (!hasBothImages) return false;
    switch (modeId) {
      case 'UNCERTAINTY': return Boolean(uncertaintyUrl);
      case 'STRUCTURAL':  return Boolean(edgeUrl);
      case 'TERRAIN':     return Boolean(vegetationUrl);
      default:            return true;
    }
  };

  const rightSrc = getRightPaneSrc();

  const modeLabels = {
    VISUAL:      'SWIN2SR GPU 2.5m/px',
    UNCERTAINTY: 'MC DROPOUT VARIANCE',
    STRUCTURAL:  'CANNY WIREFRAME',
    TERRAIN:     'VARI VEGETATION INDEX',
  };

  return (
    <div className="viewer-root">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="viewer-toolbar">
        <div className="toolbar-left font-mono">
          <Crosshair size={14} className="toolbar-icon" />
          <span className="toolbar-target">TARGET: {tileName}</span>
          {isProcessing && (
            <span className="processing-badge">
              <span className="pulse-dot" /> GPU INFERENCE ACTIVE
            </span>
          )}
          {!isProcessing && hasBothImages && (
            <span className="live-badge">SWIN2SR ENHANCED (2.5m/px)</span>
          )}
        </div>

        <div className="toolbar-right">
          {/* ── Intelligence Mode Segmented Control ── */}
          <div
            className="intel-mode-control"
            role="group"
            aria-label="Intelligence Mode"
          >
            {MODES.map((m) => {
              const available = isModeAvailable(m.id);
              const isActive  = activeMode === m.id;
              const ModeIcon  = m.icon;
              return (
                <button
                  key={m.id}
                  id={`intel-mode-${m.id.toLowerCase()}`}
                  className={`intel-mode-btn font-mono ${isActive ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                  onClick={() => available && setActiveMode(m.id)}
                  disabled={!available}
                  title={available ? m.title : `Run enhancement to unlock ${m.label}`}
                >
                  <ModeIcon size={11} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tactical Export Button */}
          {hasBothImages && rightSrc && (
            <a
              id="btn-toolbar-export-tile"
              className="toolbar-export-btn font-mono"
              href={rightSrc}
              download="NTRO_Tactical_Tile.png"
              title={`Download active ${activeMode} layer (2.5m/px)`}
            >
              <Download size={12} />
              <span>EXPORT TILE</span>
            </a>
          )}

          <div className="toolbar-divider" />

          {/* Zoom controls */}
          <button className="toolbar-btn" onClick={handleZoomOut}  title="Zoom Out"><ZoomOut  size={14} /></button>
          <span   className="zoom-label font-mono">{Math.round(zoomLevel * 100)}%</span>
          <button className="toolbar-btn" onClick={handleZoomIn}   title="Zoom In"><ZoomIn   size={14} /></button>
          <button className="toolbar-btn" onClick={handleZoomReset} title="Reset Zoom"><Maximize2 size={14} /></button>
        </div>
      </div>

      {/* ── Mode Label Strip ──────────────────────────────────────── */}
      {hasBothImages && (
        <div className="mode-label-strip font-mono">
          <span className="mode-label-dot" />
          <span>{modeLabels[activeMode]}</span>
        </div>
      )}

      {/* ── Viewport ─────────────────────────────────────────────── */}
      <div className="viewer-viewport">
        {hasBothImages ? (
          /* Absolute-stacked 1:1 Comparison Slider with zero gaps */
          <div
            className="viewer-canvas"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div
              ref={sliderContainerRef}
              className="comparison-slider-container"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Dedicated Backdrop Image: raw satellite image with Tailwind classes */}
              <img
                src={lowResUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-[32px] opacity-40 scale-110 -z-10"
              />

              {/* Layer 1 (Bottom): Raw Original Input (Stacked 1:1) */}
              <img
                src={lowResUrl}
                alt="Raw Original Input 10m/px"
                className="slider-base-img"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  pointerEvents: 'none',
                  zIndex: 10,
                  filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.6))',
                }}
              />

              {/* Layer 2 (Top): Enhanced Output revealed via clip-path */}
              <div
                className="slider-reveal-layer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  WebkitClipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  zIndex: 10,
                }}
              >
                <img
                  src={activeMode === 'VISUAL' ? highResUrl : rightSrc}
                  alt={`${modeLabels[activeMode]} — Swin2SR Output`}
                  className="slider-enhanced-img"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    background: 'transparent',
                    zIndex: 1,
                    filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.6))',
                  }}
                />

                {/* UNCERTAINTY mode: overlay heatmap on top of SR image */}
                {activeMode === 'UNCERTAINTY' && uncertaintyUrl && (
                  <>
                    <img
                      src={highResUrl}
                      alt="Swin2SR Base"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                      }}
                    />
                    <img
                      src={uncertaintyUrl}
                      alt="Uncertainty Heatmap"
                      className="viewer-overlay heatmap-overlay"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        zIndex: 10,
                      }}
                    />
                  </>
                )}
              </div>

              {/* Seam Line & Drag Handle Knob (Exactly on Seam) */}
              <div
                className="slider-seam-line"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${sliderPosition}%`,
                  transform: 'translateX(-50%)',
                  width: '2px',
                  backgroundColor: 'var(--accent-primary, #00d4ff)',
                  boxShadow: '0 0 12px rgba(0, 212, 255, 0.9), 0 0 24px rgba(0, 212, 255, 0.4)',
                  zIndex: 20,
                  pointerEvents: 'none',
                }}
              >
                <div
                  className="slider-handle-knob font-mono"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary, #00d4ff)',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.95), 0 2px 10px rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#04060f',
                    cursor: 'ew-resize',
                    pointerEvents: 'auto',
                  }}
                  tabIndex={0}
                  role="slider"
                  aria-valuenow={Math.round(sliderPosition)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Image comparison split slider"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setSliderPosition((p) => Math.max(0, p - 2));
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setSliderPosition((p) => Math.min(100, p + 2));
                    }
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '-4px' }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Tactical Corner Labels */}
              <span className="corner-label left font-mono">◄ RAW ORIGINAL 10m/px</span>
              <span className="corner-label right font-mono">{modeLabels[activeMode]} ►</span>
            </div>
          </div>

        ) : hasRawImage ? (
          /* Raw Image Loaded — Showing Preview & Enhance Action */
          <div
            className="viewer-canvas"
            style={{
              transform: `scale(${zoomLevel})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img
                src={lowResUrl}
                alt="Target Raw Input"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
              />
              {isProcessing && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(10, 14, 23, 0.75)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '14px', borderRadius: '6px',
                }}>
                  <div className="idle-reticle" style={{ color: 'var(--accent-primary)' }}>
                    <Cpu size={52} />
                  </div>
                  <span className="font-mono" style={{ color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '1px', fontSize: '13px' }}>
                    RUNNING SWIN2SR TRANSFORMER ON CUDA ACCELERATED ENGINE...
                  </span>
                  <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    Computing sub-pixel attention & dynamic PSNR/SSIM/SAM metrics
                  </span>
                </div>
              )}
            </div>

            {!isProcessing && onRequestEnhance && (
              <div style={{ marginTop: '16px' }}>
                <button id="btn-enhance" className="enhance-btn font-mono" onClick={onRequestEnhance}>
                  <Sparkles size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  RUN SWIN2SR GPU ENHANCEMENT (10m → 2.5m)
                </button>
              </div>
            )}
          </div>

        ) : (
          /* Idle State */
          <div className="viewer-idle">
            <div className="idle-reticle">
              <Crosshair size={48} strokeWidth={1} />
            </div>
            <p className="idle-text font-mono">
              SELECT A TARGET TILE FROM THE GALLERY OR UPLOAD A CUSTOM IMAGE
            </p>
          </div>
        )}
      </div>

      {/* ── Aura Build Bento Telemetry HUD Bar ───────────────────── */}
      <div className="viewer-telemetry-hud font-mono">
        <div className="telemetry-items">
          {hasBothImages ? (
            <>
              <div className="hud-pill" title="Peak Signal-to-Noise Ratio (Target > 28 dB)">
                <span className="hud-label">PSNR</span>
                <span className="hud-val cyan">{metrics.psnr != null ? `${Number(metrics.psnr).toFixed(2)} dB` : '-- dB'}</span>
              </div>
              <div className="hud-pill" title="Structural Similarity Index (Target > 0.85)">
                <span className="hud-label">SSIM</span>
                <span className="hud-val green">{metrics.ssim != null ? Number(metrics.ssim).toFixed(4) : '--'}</span>
              </div>
              <div className="hud-pill" title="Spectral Angle Mapper (Color preservation)">
                <span className="hud-label">SAM</span>
                <span className="hud-val amber">{metrics.sam != null ? `${Number(metrics.sam).toFixed(4)}°` : '--'}</span>
              </div>
              <div className="hud-pill" title="GPU Forward-Pass Latency">
                <span className="hud-label">LATENCY</span>
                <span className="hud-val">{metrics.inference_time_ms != null ? `${metrics.inference_time_ms} ms` : '-- ms'}</span>
              </div>
              <div className="hud-pill" title="Ground Sampling Distance">
                <span className="hud-label">GSD</span>
                <span className="hud-val mint">10m → 2.5m</span>
              </div>
              {(metadata.crs || metrics.crs) && (
                <div className="hud-pill crs-pill" title="Spatial Coordinate Reference System">
                  <span className="hud-label">CRS</span>
                  <span className="hud-val">{metadata.crs || metrics.crs}</span>
                </div>
              )}
            </>
          ) : (
            <div className="hud-pill idle-hud">
              <span className="hud-dot" />
              <span className="hud-val">ENGINE READY · SWIN2SR + BSRGAN ON CUDA</span>
            </div>
          )}
        </div>

        {hasBothImages && rightSrc && (
          <a
            id="btn-export-tactical-tile"
            className="hud-export-btn font-mono"
            href={rightSrc}
            download={`NTRO_${activeMode}_Tile.png`}
            title={`Download active ${activeMode} layer (2.5m/px)`}
          >
            <Download size={13} />
            <span>EXPORT TILE ({activeMode})</span>
          </a>
        )}
      </div>
    </div>
  );
}
