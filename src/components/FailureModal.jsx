import React from 'react';
import '../styles/Game.css';

export default function FailureModal({ reason, onRestart }) {
  return (
    <div className="failure-overlay">
      <div className="failure-banner">
        <div className="badge-accident">⚠️ ACCIDENT DETECTED!</div>
        <h2>STAGE 1 FAILED</h2>
        <p>{reason || "Your vehicle flipped over or lost balance. Press space or click below to restart."}</p>
        <button className="restart-btn" onClick={onRestart}>
          🔄 RESTART STAGE / [SPACE]
        </button>
      </div>
    </div>
  );
}