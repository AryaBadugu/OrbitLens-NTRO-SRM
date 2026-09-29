import React from 'react';
import { MdRadar } from 'react-icons/md';
import { FiActivity, FiShield } from 'react-icons/fi';
import './Header.css';

export default function Header({ isConnected = false }) {
  return (
    <header className="tactical-header">
      <div className="header-left">
        <div className="header-logo">
          <MdRadar className="radar-icon" />
          <span className="logo-text font-mono">NTRO SRM</span>
        </div>
        <div className="header-divider"></div>
        <span className="header-subtitle font-mono">
          <FiShield className="shield-icon" /> TACTICAL SUPER RESOLUTION MAPPING
        </span>
      </div>

      <div className="header-right font-mono">
        <div className="status-pill">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
          <span className="status-label">
            {isConnected ? 'API ONLINE' : 'API OFFLINE'}
          </span>
        </div>
        <div className="classification-badge">
          CLASSIFIED // NTRO TECH DEMO
        </div>
      </div>
    </header>
  );
}
