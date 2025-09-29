import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";

const SplashScreen = () => {
  const setCurrentView = useGameStore((state) => state.setCurrentView);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentView("login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [setCurrentView]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-dark-950 via-primary-900 to-dark-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-500/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent-500/20 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-secondary-500/20 rounded-full animate-pulse"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Game logo/title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-game font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 animate-glow">
            MONSTER
          </h1>
          <h2 className="text-4xl md:text-6xl font-game font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400">
            HUNTER
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-display text-primary-200 max-w-md mx-auto">
          Discover and collect creatures in the real world
        </p>

        {/* Loading indicator */}
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner w-8 h-8"></div>
          <p className="text-primary-300 font-display">Loading adventure...</p>
        </div>

        {/* Version info */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-dark-400 text-sm font-body">v0.1.0 - Beta</p>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
