import { useState, useEffect, useRef, useCallback } from "react";
import { MonsterSpawn, LocationContext } from "@/types";

interface CaptureMinigameProps {
  monster: MonsterSpawn;
  locationContext: LocationContext | null;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
  onFightingStart?: () => void; // New callback for when reeling starts
}

interface GameState {
  phase: "charging" | "casting" | "fighting" | "success" | "failure";
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
  onFightingStart,
}: CaptureMinigameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "charging",
    power: 0,
    tension: 0,
    monsterStruggle: 0,
    timeRemaining: 30,
    lineIntegrity: 100,
  });

  const [isCharging, setIsCharging] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef<number | null>(null);

  // Difficulty based on monster and environment
  const difficulty = Math.min(
    1 +
      (locationContext?.weather.windSpeed || 0) / 30 +
      (monster.biome === "mountain" || monster.biome === "tundra" ? 0.3 : 0),
    2
  );

  // Phase 2: Power charging
  const startCharging = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      e?.preventDefault(); // Prevent default touch behavior
      if (gameState.phase !== "charging") return;

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
    },
    [gameState.phase]
  );

  const stopCharging = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      e?.preventDefault(); // Prevent default touch behavior
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsCharging(false);

      if (gameState.phase === "charging" && gameState.power > 20) {
        setGameState((prev) => ({ ...prev, phase: "casting" }));
      }
    },
    [gameState.phase, gameState.power]
  );

  // Casting simulation
  useEffect(() => {
    if (gameState.phase === "casting") {
      const castTime = 1500; // 1.5 seconds
      setTimeout(() => {
        // Simple success based on power level
        const hitChance = gameState.power / 100;
        const success = hitChance > 0.3; // Need at least 30% power

        if (success) {
          setGameState((prev) => ({
            ...prev,
            phase: "fighting",
            timeRemaining: 15,
            monsterStruggle: Math.random() * 0.5 + 0.3,
          }));
          // Trigger image generation when fighting starts
          if (onFightingStart) {
            onFightingStart();
          }
        } else {
          setGameState((prev) => ({ ...prev, phase: "failure" }));
        }
      }, castTime);
    }
  }, [gameState.phase, gameState.power, onFightingStart]);

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
  const handleReel = (
    direction: "in" | "out",
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    e?.preventDefault(); // Prevent default touch behavior
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
    <>
      <style>{`
        @keyframes monsterStruggle {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.2) rotate(10deg); }
        }
      `}</style>
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

            {/* Charging phase */}
            {gameState.phase === "charging" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Monster preview */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent-500 rounded-full border-4 border-white mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">👹</span>
                  </div>
                  <p className="text-white text-sm font-medium">
                    Wild {monster.biome} Creature
                  </p>
                  <p className="text-dark-300 text-xs mt-1">
                    Charge your capture tool to catch it!
                  </p>
                </div>
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
                {/* Monster struggle visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Monster at center */}
                  <div
                    className="w-16 h-16 bg-accent-500 rounded-full border-4 border-white relative"
                    style={{
                      animation: `monsterStruggle ${
                        0.5 + gameState.monsterStruggle
                      }s ease-in-out infinite alternate`,
                      transform: `scale(${
                        1 + gameState.monsterStruggle * 0.3
                      }) rotate(${gameState.monsterStruggle * 10}deg)`,
                    }}
                  >
                    <div className="absolute inset-2 bg-accent-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">👹</span>
                    </div>
                  </div>

                  {/* Pull lines showing tension */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute w-1 bg-primary-500 opacity-60"
                      style={{
                        left: "50%",
                        top: "50%",
                        height: "2px",
                        transform: `translateX(-50%) rotate(${
                          gameState.monsterStruggle * 20 - 10
                        }deg)`,
                        transformOrigin: "center",
                      }}
                    />
                    <div
                      className="absolute w-1 bg-primary-500 opacity-60"
                      style={{
                        left: "50%",
                        top: "50%",
                        height: "2px",
                        transform: `translateX(-50%) rotate(${
                          -gameState.monsterStruggle * 20 + 10
                        }deg)`,
                        transformOrigin: "center",
                      }}
                    />
                  </div>
                </div>

                {/* Tension meter */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">
                      Tension
                    </span>
                    <span className="text-white text-sm">
                      {gameState.tension.toFixed(0)}%
                    </span>
                  </div>
                  <div className="bg-dark-700 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${getTensionColor()}`}
                      style={{ width: `${gameState.tension}%` }}
                    />
                    {/* Tension zones */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white/60">
                      <span>Safe</span>
                      <span>Caution</span>
                      <span>Danger</span>
                    </div>
                  </div>
                </div>

                {/* Time and Progress */}
                <div className="absolute top-4 right-4 text-center">
                  <div className="text-white text-sm font-medium">
                    {gameState.timeRemaining.toFixed(1)}s
                  </div>
                  <div className="text-xs text-dark-300">Time Left</div>
                </div>

                {/* Line integrity */}
                <div className="absolute bottom-20 left-4 right-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">
                      Line Strength
                    </span>
                    <span className="text-white text-sm">
                      {gameState.lineIntegrity.toFixed(0)}%
                    </span>
                  </div>
                  <div className="bg-dark-700 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${gameState.lineIntegrity}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Success/Failure */}
            {(gameState.phase === "success" ||
              gameState.phase === "failure") && (
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
            {showInstructions && gameState.phase === "charging" && (
              <div className="game-card text-center text-sm text-dark-300">
                <p>Hold the button to charge your capture tool!</p>
                <p className="text-xs mt-1 text-dark-400">
                  More power = better chance to catch the monster
                </p>
              </div>
            )}

            {gameState.phase === "charging" && (
              <div className="flex justify-center">
                <button
                  onMouseDown={startCharging}
                  onMouseUp={stopCharging}
                  onMouseLeave={stopCharging}
                  onTouchStart={startCharging}
                  onTouchEnd={stopCharging}
                  onTouchCancel={stopCharging}
                  className="capture-button px-8 py-4 text-lg"
                >
                  ⚡ Hold to Charge
                </button>
              </div>
            )}

            {gameState.phase === "fighting" && (
              <div className="space-y-4">
                {/* Instructions */}
                <div className="text-center text-sm text-dark-300">
                  <p>🎯 Keep tension in the green zone!</p>
                  <p className="text-xs text-dark-400">
                    Tap buttons to adjust your line
                  </p>
                </div>

                {/* Control buttons */}
                <div className="flex space-x-4">
                  <button
                    onMouseDown={(e) => handleReel("out", e)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleReel("out", e);
                    }}
                    className={`game-button-secondary flex-1 ${
                      gameState.tension > 70 ? "animate-pulse bg-red-600" : ""
                    }`}
                  >
                    🔄 Give Line
                  </button>
                  <button
                    onMouseDown={(e) => handleReel("in", e)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleReel("in", e);
                    }}
                    className={`game-button flex-1 ${
                      gameState.tension < 30 ? "animate-pulse bg-green-600" : ""
                    }`}
                  >
                    🎯 Pull Hard
                  </button>
                </div>

                {/* Quick status */}
                <div className="text-center text-xs text-dark-400">
                  {gameState.tension > 80 && "⚠️ Too much tension!"}
                  {gameState.tension < 20 && "💪 Pull harder!"}
                  {gameState.tension >= 20 &&
                    gameState.tension <= 80 &&
                    "✅ Good tension!"}
                </div>
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
    </>
  );
};

export default CaptureMinigame;
