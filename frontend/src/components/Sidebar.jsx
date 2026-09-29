import React, { useRef } from 'react';
import { FiGrid, FiUploadCloud, FiLayers } from 'react-icons/fi';
import './Sidebar.css';

const DEMO_TILES_SAMPLE = [
  { id: 'harbor_01', name: 'Harbor Facility', region: 'Maritime Sector A', res: '10m', category: 'maritime' },
  { id: 'airfield_01', name: 'Tactical Airfield', region: 'Sector Bravo', res: '10m', category: 'military' },
  { id: 'urban_01', name: 'Urban Grid', region: 'Delhi NCR', res: '10m', category: 'urban' },
  { id: 'border_01', name: 'Border Outpost', region: 'Northern Frontier', res: '10m', category: 'border' },
  { id: 'freeway_01', name: 'Transport Corridor', region: 'Highway 44', res: '10m', category: 'infrastructure' },
  { id: 'disaster_01', name: 'Flood Zone', region: 'Assam Valley', res: '10m', category: 'disaster' },
  { id: 'urban_02', name: 'Industrial Complex', region: 'Mumbai Suburbs', res: '10m', category: 'urban' },
  { id: 'border_02', name: 'Mountain Pass', region: 'Himalayan Ridge', res: '10m', category: 'border' },
  { id: 'agri_01', name: 'Crop Yield Area', region: 'Punjab Plains', res: '10m', category: 'agriculture' },
  { id: 'maritime_02', name: 'Naval Base', region: 'Eastern Command', res: '10m', category: 'military' }
];

export default function Sidebar({ selectedTile, onSelectTile, onFileSelect, tiles = DEMO_TILES_SAMPLE }) {
  const tileList = (tiles && tiles.length > 0) ? tiles : DEMO_TILES_SAMPLE;
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (onFileSelect) {
        onFileSelect(selected);
      }
    }
    // Reset value so re-selecting same file fires event
    if (e.target) e.target.value = '';
  };

  return (
    <aside className="tactical-sidebar">
      <div className="sidebar-header font-mono">
        <FiGrid className="sidebar-icon" />
        <span>TARGET GALLERY</span>
        <span className="count-badge">{tileList.length}</span>
      </div>

      <div className="tile-list">
        {tileList.map((tile) => (
          <div
            key={tile.id}
            id={`tile-card-${tile.id}`}
            className={`tile-card ${selectedTile?.id === tile.id ? 'active' : ''}`}
            onClick={() => onSelectTile && onSelectTile(tile)}
          >
            <div className="tile-thumbnail">
              <FiLayers className="thumb-icon" />
            </div>
            <div className="tile-info">
              <div className="tile-name">{tile.name}</div>
              <div className="tile-meta font-mono">
                <span>{tile.region}</span>
                <span className="res-badge">{tile.res || '10m'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <input 
          type="file" 
          id="upload-target-tile-input"
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".jpg,.jpeg,.png,.tif,.tiff,.geotiff,.bmp,.webp" 
          onChange={handleFileChange} 
        />
        <button 
          id="upload-target-tile-btn"
          className="upload-trigger-btn font-mono" 
          onClick={handleUploadClick}
          title="Upload local satellite tile or image for GPU super-resolution"
        >
          <FiUploadCloud /> UPLOAD TARGET TILE
        </button>
      </div>
    </aside>
  );
}
