import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Video, Square } from 'lucide-react';
import VideoRecorder from './VideoRecorder';

interface BouncingBallGameProps {
  onBack: () => void;
}

const BouncingBallGame: React.FC<BouncingBallGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [bounceCount, setBounceCount] = useState(0);
  const [gameState, setGameState] = useState<'warning' | 'playing' | 'ended'>('warning');
  const [showRecorder, setShowRecorder] = useState(false);

  const gameStateRef = useRef({
    ballPos: [400, 300],
    ballVelocity: [5, 5],
    ballRadius: 20,
    ballColor: '#ffff00',
    bounceCount: 0,
    speedIncrease: 1.015
  });

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const CIRCLE_CENTER = [400, 300];
  const CIRCLE_RADIUS = 250;
  const MAX_BALL_RADIUS = CIRCLE_RADIUS - 10;

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      ballPos: [400, 300],
      ballVelocity: [Math.random() > 0.5 ? 5 : -5, Math.random() > 0.5 ? 5 : -5],
      ballRadius: 20,
      ballColor: colors[Math.floor(Math.random() * colors.length)],
      bounceCount: 0,
      speedIncrease: 1.015
    };
    setBounceCount(0);
    setGameState('playing');
  }, [colors]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Ball movement
    state.ballPos[0] += state.ballVelocity[0];
    state.ballPos[1] += state.ballVelocity[1];

    // Check collision with circle boundary
    const distX = state.ballPos[0] - CIRCLE_CENTER[0];
    const distY = state.ballPos[1] - CIRCLE_CENTER[1];
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance + state.ballRadius >= CIRCLE_RADIUS) {
      // Normalize distance vector
      const normalX = distX / distance;
      const normalY = distY / distance;

      // Calculate dot product
      const velocityDotNormal = state.ballVelocity[0] * normalX + state.ballVelocity[1] * normalY;

      // Reflect ball velocity
      state.ballVelocity[0] -= 2 * velocityDotNormal * normalX;
      state.ballVelocity[1] -= 2 * velocityDotNormal * normalY;

      // Add random perturbation
      state.ballVelocity[0] += (Math.random() - 0.5) * 2;
      state.ballVelocity[1] += (Math.random() - 0.5) * 2;

      // Increase speed
      state.ballVelocity[0] *= state.speedIncrease;
      state.ballVelocity[1] *= state.speedIncrease;

      // Increase ball radius
      if (state.ballRadius < MAX_BALL_RADIUS) {
        state.ballRadius += 1;
        state.ballColor = colors[Math.floor(Math.random() * colors.length)];
      }

      // Ensure ball stays in circle
      state.ballPos[0] = CIRCLE_CENTER[0] + (CIRCLE_RADIUS - state.ballRadius) * normalX;
      state.ballPos[1] = CIRCLE_CENTER[1] + (CIRCLE_RADIUS - state.ballRadius) * normalY;

      state.bounceCount++;
      setBounceCount(state.bounceCount);
    }

    // Check if game ended
    if (state.ballRadius >= MAX_BALL_RADIUS) {
      setGameState('ended');
      return;
    }

    // Clear screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw circle perimeter
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CIRCLE_CENTER[0], CIRCLE_CENTER[1], CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw ball
    ctx.fillStyle = state.ballColor;
    ctx.beginPath();
    ctx.arc(state.ballPos[0], state.ballPos[1], state.ballRadius, 0, 2 * Math.PI);
    ctx.fill();

    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, colors]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const startGame = () => {
    resetGame();
  };

  const WarningScreen = () => (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-8 text-white">Warning!</h2>
        <p className="text-2xl mb-4 text-white">Ce jeu contient des images clignotantes</p>
        <p className="text-2xl mb-8 text-white">Voulez-vous continuer ?</p>
        <div className="space-x-4">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-white text-black text-xl font-bold rounded hover:bg-gray-200"
          >
            Oui
          </button>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-white text-black text-xl font-bold rounded hover:bg-gray-200"
          >
            Non
          </button>
        </div>
        <p className="mt-8 text-white">GitHub: Kyle8973</p>
      </div>
    </div>
  );

  const EndScreen = () => (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-8 text-white">Rejouer ?</h2>
        <div className="space-x-4">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-white text-black text-xl font-bold rounded hover:bg-gray-200"
          >
            Oui
          </button>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-white text-black text-xl font-bold rounded hover:bg-gray-200"
          >
            Non
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white hover:text-gray-300"
        >
          <ArrowLeft size={24} />
          <span>Retour</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowRecorder(true)}
          className="flex items-center space-x-2 text-white hover:text-gray-300"
        >
          <Video size={24} />
          <span>Enregistrer</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-gray-800"
          />
          
          <div className="absolute top-4 left-4 text-white text-2xl">
            Bounces: {bounceCount}
          </div>
          
          <div className="absolute top-4 right-4 text-white text-2xl">
            GitHub: Kyle8973
          </div>

          {gameState === 'warning' && <WarningScreen />}
          {gameState === 'ended' && <EndScreen />}
        </div>
      </div>

      {showRecorder && (
        <VideoRecorder
          targetElement={canvasRef.current}
          onClose={() => setShowRecorder(false)}
        />
      )}
    </div>
  );
};

export default BouncingBallGame;