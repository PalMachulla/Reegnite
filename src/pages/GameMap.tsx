import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { useMonsterStore } from "@/stores/monsterStore";
import { Monster } from "@/types";
import { weatherService } from "@/services/weather";
import { createLocationContext } from "@/utils/locationUtils";
import { monsterSpawningService } from "@/services/monsterSpawning";
import { geminiService } from "@/services/gemini";
import { WeatherData, LocationContext, MonsterSpawn } from "@/types";
import GameMapView from "@/components/Map/GameMapView";

const GameMap = () => {
  const navigate = useNavigate();
  const { player, logout } = useAuthStore();
  const {
    nearbyMonsters,
    setCurrentView,
    addNearbyMonster,
    removeNearbyMonster,
  } = useGameStore();
  const { getTotalCount, addMonster } = useMonsterStore();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationContext, setLocationContext] =
    useState<LocationContext | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    setCurrentView("map");
    requestLocation();
  }, [setCurrentView]);

  // Monster spawning effect
  useEffect(() => {
    if (userLocation && locationContext) {
      const interval = setInterval(() => {
        const monsters = monsterSpawningService.generateNearbyMonsters(
          userLocation.lat,
          userLocation.lng,
          locationContext
        );

        // Update game store with new monsters
        const currentMonsterIds = nearbyMonsters.map((m) => m.id);
        const newMonsterIds = monsters.map((m) => m.id);

        // Add new monsters
        monsters.forEach((monster) => {
          if (!currentMonsterIds.includes(monster.id)) {
            addNearbyMonster(monster);
          }
        });

        // Remove old monsters
        nearbyMonsters.forEach((monster) => {
          if (!newMonsterIds.includes(monster.id)) {
            removeNearbyMonster(monster.id);
          }
        });
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [
    userLocation,
    locationContext,
    nearbyMonsters,
    addNearbyMonster,
    removeNearbyMonster,
  ]);

  const fetchWeatherAndContext = async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    try {
      const weatherData = await weatherService.getCurrentWeather(lat, lng);
      setWeather(weatherData);

      const context = createLocationContext(lat, lng, weatherData);
      setLocationContext(context);
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationError(null);

        // Fetch weather data and create location context
        await fetchWeatherAndContext(latitude, longitude);
      },
      (error) => {
        setLocationError(
          "Unable to retrieve your location. Please enable location services."
        );
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMonsterClick = (monster: MonsterSpawn) => {
    console.log("🎯 Monster clicked:", monster);
    console.log("🧭 Navigating to capture with data...");

    if (!locationContext) {
      console.error("❌ No location context available for capture!");
      alert(
        "Location context not available. Please wait for location data to load."
      );
      return;
    }

    // Navigate to capture screen with monster and location data
    navigate("/capture", {
      state: {
        targetMonster: monster,
        locationContext: locationContext,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex flex-col">
      {/* Header */}
      <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-game font-bold text-primary-400">
              Monster Hunter
            </h1>
            {player && (
              <div className="text-sm text-dark-300">
                Welcome, {player.username}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/collection")}
              className="game-button-secondary text-sm py-2 px-4"
            >
              Collection ({getTotalCount()})
            </button>

            <button
              onClick={handleLogout}
              className="text-danger-400 hover:text-danger-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {locationError ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="game-card max-w-md text-center">
              <h2 className="text-xl font-game text-danger-400 mb-4">
                Location Required
              </h2>
              <p className="text-dark-300 mb-6">{locationError}</p>
              <button onClick={requestLocation} className="game-button">
                Enable Location
              </button>
            </div>
          </div>
        ) : !userLocation ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="loading-spinner w-12 h-12"></div>
            <p className="text-dark-300 font-display">
              Getting your location...
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col space-y-4">
            {/* Location Info */}
            <div className="game-card">
              <h2 className="text-lg font-game text-primary-400 mb-2">
                Current Location
              </h2>
              <p className="text-dark-300 text-sm mb-3">
                Lat: {userLocation.lat.toFixed(6)}, Lng:{" "}
                {userLocation.lng.toFixed(6)}
              </p>

              {isLoadingWeather ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  <span className="text-dark-400 text-sm">
                    Loading weather...
                  </span>
                </div>
              ) : weather && locationContext ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300 text-sm">Weather:</span>
                    <span className="text-primary-300 text-sm capitalize">
                      {weather.condition} • {weather.temperature}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300 text-sm">Biome:</span>
                    <span className="text-accent-400 text-sm capitalize">
                      {locationContext.biome}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300 text-sm">Time:</span>
                    <span className="text-secondary-300 text-sm capitalize">
                      {weather.time} • {weather.season}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-dark-400 text-xs">
                      Features:{" "}
                      {locationContext.nearbyFeatures.slice(0, 3).join(", ")}
                    </p>
                  </div>

                  {import.meta.env?.VITE_DEBUG_MODE === "true" && (
                    <div className="mt-3 p-2 bg-dark-700/50 rounded text-xs">
                      <p className="text-accent-400 font-mono">
                        Debug: Prompt ready for {locationContext.biome} monster
                        generation
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Interactive Map */}
            <div className="flex-1">
              <GameMapView
                userLocation={userLocation}
                locationContext={locationContext}
                nearbyMonsters={nearbyMonsters}
                onMonsterClick={handleMonsterClick}
              />
            </div>

            {/* Monster Controls */}
            <div className="game-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-game text-primary-400 mb-1">
                    Nearby Monsters
                  </h3>
                  <p className="text-dark-400 text-sm">
                    {nearbyMonsters.length} monster(s) detected
                  </p>
                </div>

                <div className="flex space-x-2">
                  {import.meta.env?.VITE_DEBUG_MODE === "true" && (
                    <>
                      <button
                        onClick={() => {
                          console.log("🎮 Spawn button clicked!");
                          console.log("📍 User location:", userLocation);
                          console.log("🌍 Location context:", locationContext);

                          if (userLocation && locationContext) {
                            const monster =
                              monsterSpawningService.forceSpawnMonster(
                                userLocation.lat,
                                userLocation.lng,
                                locationContext
                              );
                            console.log("🦄 Monster spawned:", monster);

                            if (monster) {
                              // Add to nearby monsters in gameStore
                              addNearbyMonster(monster);
                              alert(
                                `Monster spawned at ${monster.position.lat.toFixed(
                                  4
                                )}, ${monster.position.lng.toFixed(4)}`
                              );
                            } else {
                              alert("Failed to spawn monster!");
                            }
                          } else {
                            alert(
                              "Need location and context to spawn monster!"
                            );
                            console.log("❌ Missing location or context");
                          }
                        }}
                        className="game-button-secondary text-sm py-2 px-3"
                      >
                        Spawn
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            const isHealthy = await geminiService.healthCheck();
                            alert(
                              `Gemini API: ${
                                isHealthy ? "✅ Working" : "❌ Failed"
                              }\nConnection test ${
                                isHealthy ? "successful" : "failed"
                              }`
                            );
                          } catch (error) {
                            alert(`Gemini API Error: ${error}`);
                          }
                        }}
                        className="game-button-secondary text-sm py-2 px-3"
                      >
                        Test AI
                      </button>

                      <button
                        onClick={async (event) => {
                          try {
                            console.log(
                              "🖼️ Testing image generation with rate limiting..."
                            );

                            // Show loading state
                            const button = event.target as HTMLButtonElement;
                            const originalText = button.textContent;
                            button.textContent = "Generating...";
                            button.disabled = true;

                            const testContext = {
                              coordinates: { lat: 59.0, lng: 10.0 },
                              weather: {
                                temperature: 20,
                                condition: "clear" as any,
                                humidity: 60,
                                windSpeed: 5,
                                time: "day" as any,
                                season: "spring" as any,
                              },
                              biome: "forest" as any,
                              features: ["tall trees", "moss-covered rocks"],
                              nearbyFeatures: [],
                            };

                            const imageResult =
                              await geminiService.generateMonsterImage(
                                testContext
                              );
                            console.log(
                              "🖼️ Image generation result:",
                              imageResult
                            );

                            if (imageResult) {
                              alert(
                                `✅ Image generated successfully!\nData URL length: ${imageResult.length} characters\nCheck console for details.`
                              );
                            } else {
                              alert(
                                "⚠️ No image data returned.\nThis might be due to API limitations.\nCheck console for details."
                              );
                            }

                            // Reset button
                            button.textContent = originalText;
                            button.disabled = false;
                          } catch (error) {
                            console.error(
                              "Image generation test failed:",
                              error
                            );
                            alert(
                              `❌ Image generation failed:\n\n${error}\n\nSee console for details.`
                            );

                            // Reset button
                            const button = event.target as HTMLButtonElement;
                            button.textContent = "Test Images";
                            button.disabled = false;
                          }
                        }}
                        className="game-button-secondary text-sm py-2 px-3"
                      >
                        Test Images
                      </button>

                      <button
                        onClick={() => {
                          console.log(
                            "🧪 Direct capture test - bypassing spawn"
                          );
                          if (!locationContext) {
                            alert("Wait for location context to load first!");
                            return;
                          }

                          // Navigate directly to capture with test data
                          const testSpawn: MonsterSpawn = {
                            id: `test_spawn_${Date.now()}`,
                            position: {
                              lat: userLocation?.lat || 59.9139,
                              lng: userLocation?.lng || 10.7522,
                            },
                            biome: "urban",
                            spawnedAt: new Date(),
                            captured: false,
                          };

                          console.log("🎯 Test capture with:", testSpawn);
                          navigate("/capture", {
                            state: {
                              targetMonster: testSpawn,
                              locationContext: locationContext,
                            },
                          });
                        }}
                        className="game-button-secondary text-sm py-2 px-3"
                      >
                        Direct Capture Test
                      </button>

                      <button
                        onClick={() => {
                          console.log("📊 Current game state:");
                          console.log("- Nearby monsters:", nearbyMonsters);
                          console.log("- User location:", userLocation);
                          console.log("- Location context:", locationContext);
                          console.log(
                            "- Total monsters in collection:",
                            getTotalCount()
                          );

                          alert(`Debug Info:
• Nearby monsters: ${nearbyMonsters.length}
• Location: ${userLocation ? "Available" : "Missing"}
• Context: ${locationContext ? "Available" : "Missing"}
• Collection: ${getTotalCount()} monsters`);
                        }}
                        className="game-button-secondary text-sm py-2 px-3"
                      >
                        🔍 Debug State
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => navigate("/capture")}
                    className="capture-button"
                    disabled={nearbyMonsters.length === 0}
                  >
                    Start Hunt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameMap;
