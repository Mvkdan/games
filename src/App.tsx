import React, { useState } from 'react';
import GameMenu from './components/GameMenu';
import BouncingBallGame from './components/BouncingBallGame';
import TikTokBattleGame from './components/TikTokBattleGame';

function App() {
  const [currentGame, setCurrentGame] = useState<'menu' | 'bouncing' | 'battle'>('menu');

  return (
    <div className="min-h-screen bg-black text-white">
      {currentGame === 'menu' && (
        <GameMenu onGameSelect={setCurrentGame} />
      )}
      {currentGame === 'bouncing' && (
        <BouncingBallGame onBack={() => setCurrentGame('menu')} />
      )}
      {currentGame === 'battle' && (
        <TikTokBattleGame onBack={() => setCurrentGame('menu')} />
      )}
    </div>
  );
}

export default App;