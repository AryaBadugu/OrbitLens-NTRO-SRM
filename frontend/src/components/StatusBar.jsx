import React, { useState, useEffect } from 'react';
import { FiCpu, FiHardDrive, FiClock } from 'react-icons/fi';
import './StatusBar.css';

export default function StatusBar({ systemStatus = "System Operational", gpuStatus = "Checking...", modelStatus = "Not loaded" }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="tactical-statusbar font-mono">
      <div className="status-left">
        <span className="status-indicator"></span>
        <span className="system-state">{systemStatus}</span>
      </div>

      <div className="status-center">
        <div className="info-chip">
          <FiCpu className="chip-icon" />
          <span>GPU: {gpuStatus}</span>
        </div>
        <div className="info-chip">
          <FiHardDrive className="chip-icon" />
          <span>MODEL: {modelStatus}</span>
        </div>
      </div>

      <div className="status-right">
        <FiClock className="chip-icon" />
        <span>{timeStr}</span>
      </div>
    </footer>
  );
}
