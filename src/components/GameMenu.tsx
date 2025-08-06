import React from 'react';
import { Play, Users } from 'lucide-react';

interface GameMenuProps {
  onGameSelect: (game: 'bouncing' | 'battle') => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onGameSelect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-12 text-white">TikTok Games</h1>
        
        <div className="space-y-8">
          <button
            onClick={() => onGameSelect('bouncing')}
            className="block w-80 p-6 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center justify-center space-x-4">
              <Play size={32} />
              <div className="text-left">
                <h2 className="text-xl font-bold">Bouncing Ball</h2>
                <p className="text-sm text-gray-600">Jeu original de balle rebondissante</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onGameSelect('battle')}
            className="block w-80 p-6 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center justify-center space-x-4">
              <Users size={32} />
              <div className="text-left">
                <h2 className="text-xl font-bold">TikTok Battle</h2>
                <p className="text-sm text-gray-600">Combat entre abonnés TikTok</p>
              </div>
            </div>
          </button>
        </div>

        <p className="mt-8 text-gray-500 text-sm">GitHub: Kyle8973</p>
      </div>
    </div>
  );
};

export default GameMenu;