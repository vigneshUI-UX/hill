import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import FailureModal from './components/FailureModal';
import './styles/Game.css';

export default function App() {
  const [stats, setStats] = useState({ distance: 0, speed: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="game-container">
      <HUD stage={1} distance={stats.distance} speed={stats.speed} />
      <GameCanvas 
        onUpdateStats={setStats} 
        isGameOver={isGameOver} 
        setIsGameOver={setIsGameOver} 
        setFailureReason={setFailureReason}
      />
      {isGameOver && <FailureModal reason={failureReason} onRestart={handleRestart} />}
    </div>
  );
}