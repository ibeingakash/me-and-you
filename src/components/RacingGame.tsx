
import React, { useState, useEffect, useCallback } from 'react';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'car' | 'cone';
}

interface PlayerCar {
  x: number;
  y: number;
}

const RacingGame = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(2);
  const [playerCar, setPlayerCar] = useState<PlayerCar>({ x: 50, y: 80 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('racingHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('racingHighScore', score.toString());
    }
  }, [score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Move player car
  useEffect(() => {
    if (gameState !== 'playing') return;

    const movePlayer = () => {
      setPlayerCar(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.has('arrowleft') || keys.has('a')) {
          newX = Math.max(10, prev.x - 3);
        }
        if (keys.has('arrowright') || keys.has('d')) {
          newX = Math.min(90, prev.x + 3);
        }
        if (keys.has('arrowup') || keys.has('w')) {
          newY = Math.max(10, prev.y - 2);
        }
        if (keys.has('arrowdown') || keys.has('s')) {
          newY = Math.min(90, prev.y + 2);
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(movePlayer, 16);
    return () => clearInterval(interval);
  }, [keys, gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Move obstacles
      setObstacles(prev => 
        prev.map(obstacle => ({
          ...obstacle,
          y: obstacle.y + speed
        })).filter(obstacle => obstacle.y < 100)
      );

      // Add new obstacles
      setObstacles(prev => {
        if (Math.random() < 0.02) {
          const newObstacle: Obstacle = {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: -5,
            type: Math.random() < 0.7 ? 'car' : 'cone'
          };
          return [...prev, newObstacle];
        }
        return prev;
      });

      // Check collisions
      setObstacles(prev => {
        const collision = prev.some(obstacle => {
          const dx = Math.abs(obstacle.x - playerCar.x);
          const dy = Math.abs(obstacle.y - playerCar.y);
          return dx < 5 && dy < 8;
        });

        if (collision) {
          setGameState('gameOver');
        }

        return prev;
      });

      // Increase score and speed
      setScore(prev => prev + 1);
      setSpeed(prev => Math.min(8, prev + 0.001));
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, playerCar, speed]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSpeed(2);
    setPlayerCar({ x: 50, y: 80 });
    setObstacles([]);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setSpeed(2);
    setPlayerCar({ x: 50, y: 80 });
    setObstacles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md h-[600px] bg-gray-800 rounded-lg overflow-hidden border-2 border-racing-blue shadow-2xl">
        
        {/* Road */}
        <div className="absolute inset-0 bg-gray-700">
          {/* Road lines */}
          <div className="absolute left-1/2 top-0 w-1 h-full bg-white opacity-60 transform -translate-x-1/2">
            <div className="road-line w-full h-20 animate-road-move"></div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative w-full h-full">
          
          {/* Player Car */}
          {gameState === 'playing' && (
            <div 
              className="absolute transition-all duration-75 ease-out"
              style={{ 
                left: `${playerCar.x}%`, 
                top: `${playerCar.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Car 
                size={32} 
                className="text-racing-blue drop-shadow-lg animate-neon-pulse"
                style={{ filter: 'drop-shadow(0 0 8px #00D4FF)' }}
              />
            </div>
          )}

          {/* Obstacles */}
          {obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className="absolute transition-all duration-75 ease-linear"
              style={{
                left: `${obstacle.x}%`,
                top: `${obstacle.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Car 
                size={28} 
                className={`${obstacle.type === 'car' ? 'text-racing-red' : 'text-racing-yellow'} drop-shadow-lg`}
                style={{ 
                  filter: `drop-shadow(0 0 6px ${obstacle.type === 'car' ? '#FF073A' : '#FFFF00'})`,
                  transform: 'rotate(180deg)'
                }}
              />
            </div>
          ))}

          {/* HUD */}
          {gameState === 'playing' && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="text-racing-blue font-bold text-lg animate-neon-pulse">
                Score: {score}
              </div>
              <div className="text-racing-green font-bold text-lg animate-neon-pulse">
                Speed: {speed.toFixed(1)}x
              </div>
            </div>
          )}

          {/* Menu */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
              <Card className="p-8 text-center racing-gradient border-0 text-white">
                <h1 className="text-4xl font-bold mb-4 animate-neon-pulse">
                  🏎️ NEON RACER
                </h1>
                <p className="mb-6 text-lg">
                  High Score: {highScore}
                </p>
                <Button 
                  onClick={startGame}
                  className="bg-racing-blue hover:bg-racing-purple text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 hover:scale-105"
                >
                  START RACE
                </Button>
                <div className="mt-6 text-sm opacity-80">
                  <p>Use Arrow Keys or WASD to move</p>
                  <p>Avoid the obstacles!</p>
                </div>
              </Card>
            </div>
          )}

          {/* Game Over */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90">
              <Card className="p-8 text-center bg-gray-900 border-racing-red border-2 text-white">
                <h2 className="text-3xl font-bold mb-4 text-racing-red animate-neon-pulse">
                  CRASH!
                </h2>
                <p className="mb-2 text-xl">Final Score: {score}</p>
                <p className="mb-6 text-lg text-racing-blue">
                  High Score: {highScore}
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={startGame}
                    className="w-full bg-racing-green hover:bg-racing-blue text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    RACE AGAIN
                  </Button>
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="w-full border-racing-purple text-racing-purple hover:bg-racing-purple hover:text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    MAIN MENU
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RacingGame;
