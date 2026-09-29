import React from 'react';
import { FiBarChart2, FiInfo, FiSliders, FiAlertTriangle, FiCpu } from 'react-icons/fi';
import './MetricsPanel.css';

export default function MetricsPanel({ metrics = {}, metadata = {} }) {
  const psnr = metrics.psnr != null ? `${Number(metrics.psnr).toFixed(2)} dB` : '-- dB';
  const ssim = metrics.ssim != null ? Number(metrics.ssim).toFixed(4) : '--';
  const infTime = metrics.inference_time_ms != null ? `${metrics.inference_time_ms} ms` : '-- ms';
  const device = metrics.device || 'CUDA (RTX 5050)';
  const model = metrics.model || 'Swin2SR Active';
  const hasError = metrics.error != null;
  // Real output resolution returned from the backend after tensor crop
  const outputRes = metrics.dimensions_out || '--';

  return (
    <aside className="tactical-metrics-panel">
      {/* Error banner */}
      {hasError && (
        <div className="error-banner font-mono">
          <FiAlertTriangle className="error-icon" />
          <span>{metrics.error}</span>
        </div>
      )}

      <div className="panel-section">
        <div className="section-title font-mono">
          <FiBarChart2 className="section-icon" />
          <span>ENHANCEMENT METRICS (REAL-TIME)</span>
        </div>

        <div className="metrics-grid font-mono">
          <div className="metric-card">
            <span className="metric-label">PSNR</span>
            <span className="metric-value highlight-cyan">{psnr}</span>
            <span className="metric-hint">Target &gt; 28 dB (skimage)</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">SSIM</span>
            <span className="metric-value highlight-green">{ssim}</span>
            <span className="metric-hint">Target &gt; 0.85 (skimage)</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">SAM SCORE</span>
            <span className="metric-value highlight-amber">
              {metrics.sam != null ? `${Number(metrics.sam).toFixed(4)}°` : '--'}
            </span>
            <span className="metric-hint">Spectral Angle preservation</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">GPU LATENCY</span>
            <span className="metric-value">{infTime}</span>
            <span className="metric-hint">Local PyTorch / CUDA</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">OUTPUT RES</span>
            <span className="metric-value highlight-amber">{outputRes}</span>
            <span className="metric-hint">Cropped SR Tensor</span>
          </div>
        </div>
      </div>

      <div className="panel-divider"></div>

      <div className="panel-section">
        <div className="section-title font-mono">
          <FiInfo className="section-icon" />
          <span>TILE METADATA</span>
        </div>

        <div className="meta-list font-mono">
          <div className="meta-row">
            <span className="meta-key">Coordinate System (CRS)</span>
            <span className="meta-val highlight-cyan">{metadata.crs || metadata.crs_info || metrics.crs || metrics.crs_info || 'EPSG:4326 (WGS 84)'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Native Resolution</span>
            <span className="meta-val">{metadata.resolution || '10m / pixel'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Tactical Resolution</span>
            <span className="meta-val highlight-cyan">{metadata.enhanced_resolution || '2.5m / pixel'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Input Tile Size</span>
            <span className="meta-val">{metadata.dimensions || '256 × 256 px'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Spectral Bands</span>
            <span className="meta-val">{metadata.bands || 'RGB (Sentinel-2 L2A)'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">Sensor Source</span>
            <span className="meta-val">{metadata.source || 'Sentinel-2 ESA'}</span>
          </div>
        </div>
      </div>

      <div className="panel-divider"></div>

      <div className="panel-section">
        <div className="section-title font-mono">
          <FiSliders className="section-icon" />
          <span>INFERENCE ENGINE STATUS</span>
        </div>

        <div className="settings-summary font-mono">
          <div className="setting-item">
            <span>Inference Device:</span>
            <span className="badge active">{device}</span>
          </div>
          <div className="setting-item">
            <span>Model Backbone:</span>
            <span className="badge cyan">{model}</span>
          </div>
          <div className="setting-item">
            <span>Resolution Target:</span>
            <span className="badge cyan">10m → 2.5m (×4 BSRGAN)</span>
          </div>
          <div className="setting-item">
            <span>Backend Engine:</span>
            <span className="badge">PyTorch Native CUDA</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
