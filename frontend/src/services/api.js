/**
 * SRM API Service — Handles all communication with the FastAPI backend
 * for the Super Resolution Mapping tactical dashboard.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling.
 * Returns null on failure instead of throwing — the UI handles graceful degradation.
 */
async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body.detail || detail;
      } catch (_) {}
      console.warn(`[SRM-API] ${path} → ${detail}`);
      return { error: detail };
    }
    return await res.json();
  } catch (err) {
    console.warn(`[SRM-API] ${path} unreachable:`, err?.message);
    return { error: err?.message || 'Network error' };
  }
}

export const srmApi = {
  /**
   * Health check — returns { status, gpu, device }
   */
  health: () => request('/api/health'),

  /**
   * List available demo tiles — returns array of tile objects
   */
  tiles: () => request('/api/tiles'),

  /**
   * Enhance an image via SwinIR 4x super resolution.
   * @param {File|Blob} file — image to enhance
   * @param {string} filename — original filename
   * @returns {{ status, enhanced_path, uncertainty_path, metrics }}
   */
  enhance: async (file, filename = 'tile.png') => {
    const formData = new FormData();
    formData.append('file', file, filename);

    try {
      const res = await fetch(`${API_BASE}/api/enhance`, {
        method: 'POST',
        body: formData,
        // No Content-Type header — browser sets multipart boundary automatically
      });

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          detail = body.detail || detail;
        } catch (_) {}
        return { error: detail };
      }

      const data = await res.json();

      // Prefix output paths with API base
      if (data.enhanced_path) {
        data.enhanced_url = `${API_BASE}${data.enhanced_path}`;
      }
      if (data.uncertainty_path) {
        data.uncertainty_url = `${API_BASE}${data.uncertainty_path}`;
      }

      return data;
    } catch (err) {
      return { error: err?.message || 'Enhancement request failed' };
    }
  },

  /**
   * Fetch a specific output file URL (enhanced image, heatmap, etc.)
   * @param {string} filename
   * @returns {string} full URL
   */
  outputUrl: (filename) => `${API_BASE}/outputs/${filename}`,
};

export default srmApi;
