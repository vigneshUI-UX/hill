import React from 'react';
import '../styles/Game.css';

export default function HUD({ stage, distance, speed }) {
  return (
    <>
      <div className="hud-overlay">
        <div className="stage-badge">
          STAGE {stage} / 4
        </div>
        <div className="hud-right">
          <div className="hud-stat-box">
            DISTANCE <span className="stat-value">{Math.floor(distance)} m</span>
          </div>
          <div className="hud-stat-box">
            SPEED <span className="stat-value">{Math.floor(speed)} km/h</span>
          </div>
          <div className="hud-stat-box">
            NITRO <span className="stat-value">100%</span>
          </div>
        </div>
      </div>

      <div className="bottom-controls-bar">
        <span className="control-pill">← → Drive</span>
        <span className="control-pill">Tilt</span>
        <span className="control-pill">Flip</span>
        <span className="control-pill highlight">SPACE</span>
        <span className="control-pill">Restart</span>
      </div>
    </>
  );
}