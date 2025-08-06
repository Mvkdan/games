import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Video, Settings, Volume2, VolumeX, Play, Users } from 'lucide-react';
import VideoRecorder from './VideoRecorder';
import TikTokAuth from './TikTokAuth';
import RealTikTokAuth from './RealTikTokAuth';

interface TikTokBattleGameProps {
  onBack: () => void;
}

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  image: string;
  speed: number;
  mass: number;
}

interface Explosion {
  x: number;
  y: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
  }>;
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface GameSettings {
  soundEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  ballCount: number;
  speedMultiplier: number;
  gravityEnabled: boolean;
  powerUpsEnabled: boolean;
}

const TikTokBattleGame: React.FC<TikTokBattleGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [gameState, setGameState] = useState<'settings' | 'pre-game' | 'countdown' | 'playing' | 'ended'>('settings');
  const [ballsCount, setBallsCount] = useState(0);
  const [winner, setWinner] = useState<Ball | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [eliminatedCount, setEliminatedCount] = useState(0);
  const [wantToRecord, setWantToRecord] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [showTikTokAuth, setShowTikTokAuth] = useState(false);
  const [showRealTikTokAuth, setShowRealTikTokAuth] = useState(false);
  const [customFollowers, setCustomFollowers] = useState<any[]>([]);
  
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    difficulty: 'normal',
    ballCount: 8,
    speedMultiplier: 1,
    gravityEnabled: false,
    powerUpsEnabled: false
  });

  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const explosionsRef = useRef<Explosion[]>([]);
  const confettiRef = useRef<Confetti[]>([]);

  // Canvas dimensions for vertical format
  const CANVAS_WIDTH = 540; // 1080/2 for better performance
  const CANVAS_HEIGHT = 960; // 1920/2 for better performance

  // Simuler des abonnés TikTok avec des avatars
  const mockFollowers = [
    { id: '1', name: 'User1', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '2', name: 'User2', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '3', name: 'User3', avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '4', name: 'User4', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '5', name: 'User5', avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '6', name: 'User6', avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '7', name: 'User7', avatar: 'https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '8', name: 'User8', avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '9', name: 'User9', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '10', name: 'User10', avatar: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '11', name: 'User11', avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '12', name: 'User12', avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '13', name: 'User13', avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '14', name: 'User14', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '15', name: 'User15', avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '16', name: 'User16', avatar: 'https://images.pexels.com/photos/1181717/pexels-photo-1181717.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '17', name: 'User17', avatar: 'https://images.pexels.com/photos/1181721/pexels-photo-1181721.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '18', name: 'User18', avatar: 'https://images.pexels.com/photos/1181724/pexels-photo-1181724.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '19', name: 'User19', avatar: 'https://images.pexels.com/photos/1181725/pexels-photo-1181725.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: '20', name: 'User20', avatar: 'https://images.pexels.com/photos/1181730/pexels-photo-1181730.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
  ];

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080', '#ff69b4', '#32cd32', '#ff4500', '#9370db'];

  // Fonction pour créer des sons de collision
  const playCollisionSound = useCallback((frequency: number = 440, duration: number = 0.1) => {
    if (!settings.soundEnabled) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [settings.soundEnabled]);

  const getDifficultySettings = useCallback(() => {
    switch (settings.difficulty) {
      case 'easy':
        return { baseSpeed: 3, speedVariation: 2 };
      case 'hard':
        return { baseSpeed: 8, speedVariation: 4 };
      default: // normal
        return { baseSpeed: 5, speedVariation: 3 };
    }
  }, [settings.difficulty]);

  // Calculer la taille des balles en fonction du nombre de joueurs
  const getBallRadius = useCallback((currentBallCount: number) => {
    const maxPlayers = 20;
    const minRadius = 15;
    const maxRadius = 35;
    
    // Plus il y a de joueurs, plus les balles sont petites
    const ratio = 1 - (currentBallCount / maxPlayers);
    return Math.max(minRadius, minRadius + (maxRadius - minRadius) * ratio);
  }, []);

  const createConfetti = useCallback(() => {
    const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
    const confetti: Confetti[] = [];
    
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * CANVAS_WIDTH,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 4,
        life: 300,
        maxLife: 300
      });
    }
    
    confettiRef.current = confetti;
  }, []);

  const updateConfetti = useCallback(() => {
    confettiRef.current = confettiRef.current.filter(confetti => {
      confetti.x += confetti.vx;
      confetti.y += confetti.vy;
      confetti.vy += 0.1; // Gravity
      confetti.rotation += confetti.rotationSpeed;
      confetti.life--;
      return confetti.life > 0 && confetti.y < CANVAS_HEIGHT + 50;
    });
  }, []);

  const initializeBalls = useCallback(() => {
    const diffSettings = getDifficultySettings();
    const followersToUse = customFollowers.length > 0 ? customFollowers : mockFollowers;
    const selectedFollowers = followersToUse.slice(0, settings.ballCount);
    const ballRadius = getBallRadius(settings.ballCount);
    
    const balls: Ball[] = selectedFollowers.map((follower, index) => {
      const baseSpeed = diffSettings.baseSpeed * settings.speedMultiplier;
      const vx = (Math.random() - 0.5) * diffSettings.speedVariation * 2;
      const vy = (Math.random() - 0.5) * diffSettings.speedVariation * 2;
      
      return {
        id: follower.id,
        x: Math.random() * (CANVAS_WIDTH - ballRadius * 2) + ballRadius,
        y: Math.random() * (CANVAS_HEIGHT - ballRadius * 2) + ballRadius,
        vx: vx === 0 ? baseSpeed : vx,
        vy: vy === 0 ? baseSpeed : vy,
        radius: ballRadius,
        color: colors[index % colors.length],
        image: follower.avatar,
        speed: Math.sqrt(vx * vx + vy * vy),
        mass: Math.random() * 0.5 + 0.75
      };
    });

    ballsRef.current = balls;
    setBallsCount(balls.length);
    setEliminatedCount(0);

    // Précharger les images
    balls.forEach(ball => {
      if (!imagesRef.current[ball.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = ball.image;
        imagesRef.current[ball.id] = img;
      }
    });
  }, [settings, getDifficultySettings, getBallRadius, colors, customFollowers]);

  const createExplosion = useCallback((x: number, y: number, color: string) => {
    const particles = [];
    const particleCount = settings.difficulty === 'hard' ? 12 : 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25,
        maxLife: 25,
        color
      });
    }
    explosionsRef.current.push({ x, y, particles });
  }, [settings.difficulty]);

  const updateExplosions = useCallback(() => {
    explosionsRef.current = explosionsRef.current.filter(explosion => {
      explosion.particles = explosion.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life--;
        return particle.life > 0;
      });
      return explosion.particles.length > 0;
    });
  }, []);

  const checkCollisions = useCallback(() => {
    const balls = ballsRef.current;
    const ballsToRemove: number[] = [];
    
    for (let i = 0; i < balls.length; i++) {
      if (ballsToRemove.includes(i)) continue;
      
      for (let j = i + 1; j < balls.length; j++) {
        if (ballsToRemove.includes(j)) continue;
        
        const ball1 = balls[i];
        const ball2 = balls[j];
        
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ball1.radius + ball2.radius) {
          playCollisionSound(200 + Math.random() * 400, 0.15);
          
          let ballToEliminate: number;
          if (Math.abs(ball1.speed - ball2.speed) < 0.1) {
            ballToEliminate = ball1.mass <= ball2.mass ? i : j;
          } else {
            ballToEliminate = ball1.speed <= ball2.speed ? i : j;
          }
          
          const eliminatedBall = balls[ballToEliminate];
          createExplosion(eliminatedBall.x, eliminatedBall.y, eliminatedBall.color);
          ballsToRemove.push(ballToEliminate);
        }
      }
    }
    
    if (ballsToRemove.length > 0) {
      ballsToRemove.sort((a, b) => b - a).forEach(index => {
        balls.splice(index, 1);
      });
      
      // Redimensionner les balles restantes
      const newRadius = getBallRadius(balls.length);
      balls.forEach(ball => {
        ball.radius = newRadius;
      });
      
      ballsRef.current = balls;
      setBallsCount(balls.length);
      setEliminatedCount(prev => prev + ballsToRemove.length);
      
      if (balls.length === 1) {
        setWinner(balls[0]);
        createConfetti();
        setGameState('ended');
      } else if (balls.length === 0) {
        setGameState('ended');
      }
    }
  }, [createExplosion, playCollisionSound, getBallRadius]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const balls = ballsRef.current;

    // Clear screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update explosions
    updateExplosions();

    // Update confetti if game ended
    if (gameState === 'ended') {
      updateConfetti();
    }

    // Update and draw balls
    balls.forEach(ball => {
      if (settings.gravityEnabled) {
        ball.vy += 0.2;
      }
      
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.vx = -ball.vx;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
        playCollisionSound(150, 0.1);
      }
      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.vy = -ball.vy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
        playCollisionSound(150, 0.1);
      }

      ball.speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

      // Draw ball
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.clip();

      const img = imagesRef.current[ball.id];
      if (img && img.complete) {
        ctx.drawImage(
          img,
          ball.x - ball.radius,
          ball.y - ball.radius,
          ball.radius * 2,
          ball.radius * 2
        );
      }

      ctx.restore();

      // Draw border
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw speed indicator
      const speedBarWidth = 30;
      const speedBarHeight = 4;
      const speedRatio = Math.min(ball.speed / 10, 1);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(ball.x - speedBarWidth/2, ball.y - ball.radius - 10, speedBarWidth, speedBarHeight);
      
      ctx.fillStyle = speedRatio > 0.7 ? '#ff0000' : speedRatio > 0.4 ? '#ffff00' : '#00ff00';
      ctx.fillRect(ball.x - speedBarWidth/2, ball.y - ball.radius - 10, speedBarWidth * speedRatio, speedBarHeight);
    });

    // Draw explosions
    explosionsRef.current.forEach(explosion => {
      explosion.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });
    });

    // Draw confetti
    if (gameState === 'ended') {
      confettiRef.current.forEach(confetti => {
        const alpha = confetti.life / confetti.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(confetti.x, confetti.y);
        ctx.rotate(confetti.rotation * Math.PI / 180);
        ctx.fillStyle = confetti.color;
        ctx.fillRect(-confetti.size/2, -confetti.size/2, confetti.size, confetti.size);
        ctx.restore();
      });
    }

    checkCollisions();

    if ((gameState === 'playing' && balls.length > 1) || gameState === 'ended') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, checkCollisions, updateExplosions, updateConfetti, settings, playCollisionSound]);

  // Countdown effect
  useEffect(() => {
    if (gameState === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if ((gameState === 'playing' && ballsRef.current.length > 1) || gameState === 'ended') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const startGame = () => {
    setGameState('pre-game');
    setWinner(null);
    explosionsRef.current = [];
    confettiRef.current = [];
    initializeBalls();
  };

  const resetGame = () => {
    setGameState('pre-game');
    setWinner(null);
    explosionsRef.current = [];
    confettiRef.current = [];
    initializeBalls();
  };

  const proceedToCountdown = () => {
    if (wantToRecord) {
      setIsRecording(true);
      setGameState('countdown');
    } else {
      setGameState('countdown');
    }
  };

  const SettingsScreen = () => (
    <div className="h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">
        <h2 className="text-3xl font-bold mb-6 text-white">TikTok Battle</h2>
        
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-white text-sm mb-2">Son</label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={`flex items-center space-x-2 px-3 py-2 rounded w-full ${
                settings.soundEnabled ? 'bg-green-600' : 'bg-gray-600'
              } text-white text-sm`}
            >
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{settings.soundEnabled ? 'Activé' : 'Désactivé'}</span>
            </button>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Difficulté</label>
            <select
              value={settings.difficulty}
              onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'normal' | 'hard' }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded text-sm"
            >
              <option value="easy">Facile</option>
              <option value="normal">Normal</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Abonnés: {settings.ballCount}</label>
            <input
              type="range"
              min="4"
              max={Math.min(20, customFollowers.length > 0 ? customFollowers.length : 20)}
              value={settings.ballCount}
              onChange={(e) => setSettings(prev => ({ ...prev, ballCount: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Vitesse: {settings.speedMultiplier}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.speedMultiplier}
              onChange={(e) => setSettings(prev => ({ ...prev, speedMultiplier: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-white text-sm">
              <input
                type="checkbox"
                checked={settings.gravityEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, gravityEnabled: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>Gravité activée</span>
            </label>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">
              {customFollowers.length > 0 ? 'Abonnés connectés' : 'Abonnés simulés'}
            </span>
            <span className="text-gray-400 text-xs">
              {customFollowers.length > 0 ? customFollowers.length : mockFollowers.length} disponibles
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setShowRealTikTokAuth(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-black text-white rounded text-sm hover:bg-gray-900"
            >
              <Users size={16} />
              <span>Connecter vrai TikTok</span>
            </button>
            <button
              onClick={() => setShowTikTokAuth(true)}
              className="w-full flex items-center justify-center space-x-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
            >
              <Users size={14} />
              <span>Utiliser abonnés simulés</span>
            </button>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <button
            onClick={startGame}
            className="w-full px-6 py-3 bg-white text-black text-lg font-bold rounded hover:bg-gray-200"
          >
            Commencer
          </button>
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-600 text-white text-lg font-bold rounded hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );

  const PreGameScreen = () => (
    <div className="h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Prêt à jouer ?</h2>
        <p className="text-lg mb-6 text-white">{settings.ballCount} abonnés vont s'affronter !</p>
        
        <div className="mb-6">
          <label className="flex items-center justify-center space-x-3 text-white text-lg">
            <input
              type="checkbox"
              checked={wantToRecord}
              onChange={(e) => setWantToRecord(e.target.checked)}
              className="w-5 h-5"
            />
            <Video size={20} />
            <span>Enregistrer pour TikTok</span>
          </label>
        </div>

        <div className="space-y-3">
          <button
            onClick={proceedToCountdown}
            className="w-full px-8 py-4 bg-white text-black text-xl font-bold rounded hover:bg-gray-200 flex items-center justify-center space-x-2"
          >
            <Play size={24} />
            <span>Lancer la bataille !</span>
          </button>
          <button
            onClick={() => setGameState('settings')}
            className="w-full px-8 py-4 bg-gray-600 text-white text-xl font-bold rounded hover:bg-gray-700"
          >
            Paramètres
          </button>
        </div>
      </div>
    </div>
  );

  const CountdownScreen = () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-white mb-4 animate-pulse">
          {countdown}
        </div>
        <p className="text-2xl text-white">La bataille commence...</p>
      </div>
    </div>
  );

  const EndScreen = () => (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Confetti animation */}
      <canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute inset-0 pointer-events-none"
        ref={(canvas) => {
          if (canvas && confettiRef.current.length > 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              confettiRef.current.forEach(confetti => {
                const alpha = confetti.life / confetti.maxLife;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(confetti.x, confetti.y);
                ctx.rotate(confetti.rotation * Math.PI / 180);
                ctx.fillStyle = confetti.color;
                ctx.fillRect(-confetti.size/2, -confetti.size/2, confetti.size, confetti.size);
                ctx.restore();
              });
            }
          }
        }}
      />
      
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-6 text-white animate-bounce">
          {winner ? '🏆 Gagnant ! 🏆' : 'Match nul !'}
        </h2>
        {winner && (
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-400 animate-pulse">
              <img 
                src={winner.image} 
                alt="Winner" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-xl text-white mb-2">Abonné #{winner.id}</p>
            <p className="text-lg text-gray-300">Vitesse finale: {winner.speed.toFixed(1)}</p>
          </div>
        )}
        <p className="text-lg text-white mb-6">Abonnés éliminés: {eliminatedCount}</p>
        <div className="space-y-3">
          <button
            onClick={resetGame}
            className="w-full px-6 py-3 bg-white text-black text-lg font-bold rounded hover:bg-gray-200"
          >
            Rejouer
          </button>
          <button
            onClick={() => setGameState('settings')}
            className="w-full px-6 py-3 bg-gray-600 text-white text-lg font-bold rounded hover:bg-gray-700"
          >
            Paramètres
          </button>
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-600 text-white text-lg font-bold rounded hover:bg-gray-700"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white hover:text-gray-300"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>
      </div>

      {(gameState === 'playing' || gameState === 'ended') && (
        <>
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-semibold">REC</span>
              </div>
            )}
            <button
              onClick={() => setGameState('settings')}
              className="text-white hover:text-gray-300"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowRecorder(true)}
              className="text-white hover:text-gray-300"
              disabled={isRecording}
            >
              <Video size={20} />
            </button>
          </div>

          <div className="flex items-center justify-center h-screen">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-2 border-gray-800 max-w-full max-h-full"
                style={{ aspectRatio: '9/16' }}
              />
              
              <div className="absolute top-4 left-4 text-white text-sm">
                <div>Abonnés: {ballsCount}</div>
                <div>Éliminés: {eliminatedCount}</div>
              </div>
              
              <div className="absolute top-4 right-4 text-white text-right text-sm">
                <div>TikTok Battle</div>
                <div>{settings.difficulty}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {gameState === 'settings' && <SettingsScreen />}
      {gameState === 'pre-game' && <PreGameScreen />}
      {gameState === 'countdown' && <CountdownScreen />}
      {gameState === 'ended' && <EndScreen />}

      {showRecorder && (
        <VideoRecorder
          targetElement={canvasRef.current}
          isRecording={isRecording}
          onRecordingStart={() => setIsRecording(true)}
          onRecordingStop={() => setIsRecording(false)}
          onClose={() => {
            setShowRecorder(false);
            setIsRecording(false);
          }}
        />
      )}

      {showTikTokAuth && (
        <TikTokAuth
          onFollowersLoaded={(followers) => {
            setCustomFollowers(followers.map(f => ({
              id: f.id,
              name: f.display_name,
              avatar: f.avatar_url
            })));
            // Ajuster le nombre de balles si nécessaire
            if (settings.ballCount > followers.length) {
              setSettings(prev => ({ ...prev, ballCount: Math.min(followers.length, 20) }));
            }
          }}
          onClose={() => setShowTikTokAuth(false)}
        />
      )}

      {showRealTikTokAuth && (
        <RealTikTokAuth
          onFollowersLoaded={(followers) => {
            setCustomFollowers(followers.map(f => ({
              id: f.open_id,
              name: f.display_name,
              avatar: f.avatar_url
            })));
            // Ajuster le nombre de balles si nécessaire
            if (settings.ballCount > followers.length) {
              setSettings(prev => ({ ...prev, ballCount: Math.min(followers.length, 20) }));
            }
          }}
          onClose={() => setShowRealTikTokAuth(false)}
        />
      )}
    </div>
  );
};

export default TikTokBattleGame;