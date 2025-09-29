import { useState, useEffect, useRef, useCallback } from "react";
import { MonsterSpawn, LocationContext } from "@/types";

interface CaptureMinigameProps {
  monster: MonsterSpawn;
  locationContext: LocationContext | null;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
}

interface GameState {
  phase: "aiming" | "casting" | "reeling" | "fighting" | "success" | "failure";
  angle: number;
  power: number;
  tension: number;
  monsterStruggle: number;
  timeRemaining: number;
  lineIntegrity: number;
}

const CaptureMinigame = ({
  monster,
  locationContext,
  onSuccess,
  onFailure,
  onCancel,
}: CaptureMinigameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "aiming",
    angle: 45,
    power: 0,
    tension: 0,
    monsterStruggle: 0,
    timeRemaining: 30,
    lineIntegrity: 100,
  });

  const [isCharging, setIsCharging] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Difficulty based on monster and environment
  const difficulty = Math.min(
    1 +
      (locationContext?.weather.windSpeed || 0) / 30 +
      (monster.biome === "mountain" || monster.biome === "tundra" ? 0.3 : 0),
    2
  );

  // Phase 1: Aiming
  const handleAngleChange = (delta: number) => {
    if (gameState.phase === "aiming") {
      setGameState((prev) => ({
        ...prev,
        angle: Math.max(10, Math.min(80, prev.angle + delta)),
      }));
    }
  };

  // Phase 2: Power charging
  const startCharging = useCallback(() => {
    if (gameState.phase !== "aiming") return;

    setIsCharging(true);
    setShowInstructions(false);

    const chargePower = () => {
      setGameState((prev) => {
        const newPower = prev.power + 2;
        if (newPower >= 100) {
          setIsCharging(false);
          return {
            ...prev,
            power: 100,
            phase: "casting",
          };
        }
        return { ...prev, power: newPower };
      });
    };

    intervalRef.current = setInterval(chargePower, 50);
  }, [gameState.phase]);

  const stopCharging = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCharging(false);

    if (gameState.phase === "aiming" && gameState.power > 20) {
      setGameState((prev) => ({ ...prev, phase: "casting" }));
    }
  }, [gameState.phase, gameState.power]);

  // Phase 3: Casting simulation
  useEffect(() => {
    if (gameState.phase === "casting") {
      const castTime = 1500; // 1.5 seconds
      setTimeout(() => {
        const hitChance =
          (gameState.power / 100) * (1 - Math.abs(gameState.angle - 45) / 45);

        if (hitChance > 0.3) {
          setGameState((prev) => ({
            ...prev,
            phase: "fighting",
            timeRemaining: 15,
            monsterStruggle: Math.random() * 0.5 + 0.3,
          }));
        } else {
          setGameState((prev) => ({ ...prev, phase: "failure" }));
        }
      }, castTime);
    }
  }, [gameState.phase]);

  // Phase 4: Fighting mechanics
  useEffect(() => {
    if (gameState.phase === "fighting") {
      const fightLoop = () => {
        setGameState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 0.1;
          const newMonsterStruggle = Math.max(
            0,
            prev.monsterStruggle + (Math.random() - 0.5) * 0.1 * difficulty
          );
          const tensionDelta = (newMonsterStruggle - 0.5) * 5;
          const newTension = Math.max(
            0,
            Math.min(100, prev.tension + tensionDelta)
          );
          const lineDamage = newTension > 80 ? 2 : newTension > 60 ? 1 : 0;
          const newLineIntegrity = Math.max(
            0,
            prev.lineIntegrity - lineDamage * 0.1
          );

          // Win conditions
          if (newTimeRemaining <= 0 && newTension < 60) {
            return { ...prev, phase: "success" };
          }

          // Lose conditions
          if (newLineIntegrity <= 0 || newTension >= 100) {
            return { ...prev, phase: "failure" };
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            monsterStruggle: newMonsterStruggle,
            tension: newTension,
            lineIntegrity: newLineIntegrity,
          };
        });
      };

      animationRef.current = setInterval(fightLoop, 100) as unknown as number;
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [gameState.phase, difficulty]);

  // Handle reel control
  const handleReel = (direction: "in" | "out") => {
    if (gameState.phase === "fighting") {
      setGameState((prev) => ({
        ...prev,
        tension:
          direction === "in"
            ? Math.min(100, prev.tension + 8)
            : Math.max(0, prev.tension - 6),
      }));
    }
  };

  // Game end effects
  useEffect(() => {
    if (gameState.phase === "success") {
      setTimeout(onSuccess, 2000);
    } else if (gameState.phase === "failure") {
      setTimeout(onFailure, 2000);
    }
  }, [gameState.phase, onSuccess, onFailure]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const getTensionColor = () => {
    if (gameState.tension < 30) return "bg-green-500";
    if (gameState.tension < 60) return "bg-yellow-500";
    if (gameState.tension < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex flex-col items-center justify-center p-4">
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
      >
        ✕
      </button>

      {/* Game area */}
      <div className="w-full max-w-md space-y-6">
        {/* Monster info */}
        <div className="game-card text-center">
          <h2 className="text-xl font-game text-primary-400 mb-2">
            Wild {monster.biome} Creature
          </h2>
          <p className="text-dark-300 text-sm">
            A mysterious creature has appeared! Use your capture tool to catch
            it.
          </p>
        </div>

        {/* Game visualization */}
        <div className="game-card h-64 relative overflow-hidden">
          {/* Background environment */}
          <div
            className={`absolute inset-0 rounded-xl ${
              monster.biome === "coast"
                ? "bg-gradient-to-b from-blue-400 to-blue-600"
                : monster.biome === "forest"
                ? "bg-gradient-to-b from-green-400 to-green-600"
                : monster.biome === "mountain"
                ? "bg-gradient-to-b from-gray-400 to-gray-600"
                : "bg-gradient-to-b from-primary-400 to-primary-600"
            } opacity-20`}
          ></div>

          {/* Aiming phase */}
          {gameState.phase === "aiming" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-2 h-20 bg-primary-500 origin-bottom transform transition-transform duration-200"
                style={{ transform: `rotate(${gameState.angle - 90}deg)` }}
              />
              <div className="absolute bottom-4 w-4 h-4 bg-accent-500 rounded-full"></div>
            </div>
          )}

          {/* Power charging */}
          {isCharging && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-dark-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-red-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${gameState.power}%` }}
                />
              </div>
            </div>
          )}

          {/* Casting animation */}
          {gameState.phase === "casting" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-ping w-8 h-8 bg-primary-500 rounded-full"></div>
              <div className="absolute text-primary-300 font-game">
                Casting...
              </div>
            </div>
          )}

          {/* Fighting phase */}
          {gameState.phase === "fighting" && (
            <div className="absolute inset-0 p-4">
              {/* Tension meter */}
              <div className="absolute top-4 left-4 right-4">
                <div className="text-white text-sm mb-1">Line Tension</div>
                <div className="bg-dark-700 rounded-full h-4">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${getTensionColor()}`}
                    style={{ width: `${gameState.tension}%` }}
                  />
                </div>
              </div>

              {/* Time remaining */}
              <div className="absolute top-4 right-4 text-white text-sm">
                Time: {gameState.timeRemaining.toFixed(1)}s
              </div>

              {/* Line integrity */}
              <div className="absolute bottom-20 left-4 right-4">
                <div className="text-white text-sm mb-1">Line Integrity</div>
                <div className="bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${gameState.lineIntegrity}%` }}
                  />
                </div>
              </div>

              {/* Monster indicator */}
              <div className="absolute center flex items-center justify-center">
                <div
                  className="w-12 h-12 bg-accent-500 rounded-full animate-bounce"
                  style={{
                    animationDuration: `${0.5 + gameState.monsterStruggle}s`,
                    transform: `scale(${1 + gameState.monsterStruggle * 0.5})`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Success/Failure */}
          {(gameState.phase === "success" || gameState.phase === "failure") && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`text-center ${
                  gameState.phase === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                <div className="text-4xl mb-2">
                  {gameState.phase === "success" ? "🎉" : "💔"}
                </div>
                <div className="text-xl font-game">
                  {gameState.phase === "success" ? "Captured!" : "Escaped!"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {showInstructions && gameState.phase === "aiming" && (
            <div className="game-card text-center text-sm text-dark-300">
              <p>Aim your capture tool, then hold to charge power!</p>
            </div>
          )}

          {gameState.phase === "aiming" && (
            <div className="flex space-x-4">
              <button
                onMouseDown={() => handleAngleChange(-2)}
                className="game-button-secondary flex-1"
              >
                ⬅ Aim Left
              </button>
              <button
                onMouseDown={startCharging}
                onMouseUp={stopCharging}
                onMouseLeave={stopCharging}
                className="capture-button flex-1"
              >
                Hold to Charge
              </button>
              <button
                onMouseDown={() => handleAngleChange(2)}
                className="game-button-secondary flex-1"
              >
                Aim Right ➡
              </button>
            </div>
          )}

          {gameState.phase === "fighting" && (
            <div className="flex space-x-4">
              <button
                onMouseDown={() => handleReel("out")}
                className="game-button-secondary flex-1"
              >
                🎣 Release
              </button>
              <button
                onMouseDown={() => handleReel("in")}
                className="game-button flex-1"
              >
                🎣 Reel In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Environment info */}
      {locationContext && (
        <div className="absolute bottom-4 left-4 text-xs text-dark-400">
          Difficulty: {difficulty.toFixed(1)}x ({locationContext.biome},{" "}
          {locationContext.weather.condition})
        </div>
      )}
    </div>
  );
};

export default CaptureMinigame;
