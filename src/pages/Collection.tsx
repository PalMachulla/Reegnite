import { useNavigate } from "react-router-dom";
import { useMonsterStore } from "@/stores/monsterStore";
import { Monster } from "@/types";

const Collection = () => {
  const navigate = useNavigate();
  const { collectedMonsters, getTotalCount, addMonster, removeMonster } =
    useMonsterStore();

  // Debug logging
  console.log("🏛️ Collection Page - Monsters in store:", collectedMonsters);
  console.log("📊 Total count:", getTotalCount());

  if (collectedMonsters.length > 0) {
    console.log("🖼️ Image URLs preview:");
    collectedMonsters.forEach((monster, index) => {
      console.log(
        `${index + 1}. ${monster.name}:`,
        monster.imageUrl ? "Has image data" : "No image"
      );
      if (monster.imageUrl) {
        console.log(`   Image type: ${monster.imageUrl.substring(0, 50)}...`);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      {/* Header */}
      <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/map")}
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              ← Back to Map
            </button>
            <h1 className="text-xl font-game font-bold text-primary-400">
              Monster Collection
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-dark-300">
              {getTotalCount()} Monsters Collected
            </div>
            <button
              onClick={() => {
                console.log(
                  "🔍 Debug - Full monster store:",
                  collectedMonsters
                );
                console.log(
                  "🔍 LocalStorage check:",
                  localStorage.getItem("monster-store")
                );

                if (collectedMonsters.length > 0) {
                  const imageInfo = collectedMonsters.map((m) => ({
                    name: m.name,
                    hasImage: !!m.imageUrl,
                    imageLength: m.imageUrl?.length || 0,
                    imagePreview: m.imageUrl?.substring(0, 50) || "none",
                  }));
                  console.log("🖼️ Image analysis:", imageInfo);
                  alert(
                    `Found ${collectedMonsters.length} monsters!\nCheck console for detailed analysis.`
                  );
                } else {
                  alert(
                    "No monsters in collection. Try capturing some monsters first!"
                  );
                }
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
            >
              🔍 Debug
            </button>
            <button
              onClick={() => {
                // Test with a real PNG from Gemini's actual response format
                const geminiFormatTest: Monster = {
                  id: `gemini_real_${Date.now()}`,
                  name: "Gemini Real Format",
                  description: "Testing real Gemini PNG format",
                  imageUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABUlEQVR42mNkYPg/A4hHw4kKAAAAAElFTkSuQmCC",
                  element: "water",
                  power: 95,
                  age: 88,
                  size: "giant",
                  rarity: "legendary",
                  location: { lat: 0, lng: 0, biome: "forest" },
                  capturedAt: new Date(),
                  lore: "Testing real Gemini image format",
                };
                console.log("🔮 Adding Gemini format test:", geminiFormatTest);
                addMonster(geminiFormatTest);
                alert("Gemini format test added!");
              }}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
            >
              🔮 Gemini Test
            </button>
            <button
              onClick={() => {
                const testMonster: Monster = {
                  id: `test_collection_${Date.now()}`,
                  name: "Test Collection Monster",
                  description:
                    "A test monster to verify collection display works",
                  imageUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hnoEIwDiqkL2kA8NTAAAAAElFTkSuQmCC", // Fixed 1x1 red pixel
                  element: "fire",
                  power: 50,
                  age: 25,
                  size: "medium",
                  rarity: "common",
                  location: { lat: 0, lng: 0, biome: "urban" },
                  capturedAt: new Date(),
                  lore: "This is a test monster to verify the collection display works correctly.",
                };
                console.log("🧪 Adding test monster:", testMonster);
                addMonster(testMonster);
                alert("Test monster added! Check the collection below.");
              }}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              🧪 Add Test
            </button>
            <button
              onClick={() => {
                const fallbackMonster: Monster = {
                  id: `fallback_test_${Date.now()}`,
                  name: "Fallback Monster",
                  description: "Monster with no image (should show emoji)",
                  imageUrl: "", // No image
                  element: "earth",
                  power: 75,
                  age: 30,
                  size: "large",
                  rarity: "rare",
                  location: { lat: 0, lng: 0, biome: "forest" },
                  capturedAt: new Date(),
                  lore: "This monster should show the fallback emoji.",
                };
                console.log("👹 Adding fallback monster:", fallbackMonster);
                addMonster(fallbackMonster);
                alert("Fallback monster added! Should show emoji.");
              }}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
            >
              👹 Add Fallback
            </button>
            <button
              onClick={() => {
                console.log(
                  "🧪 SIMPLE TEST: Adding monster with definite image"
                );
                const simpleTestMonster: Monster = {
                  id: `simple_${Date.now()}`,
                  name: "Simple Test",
                  description: "Simple test with red pixel",
                  imageUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hnoEIwDiqkL2kA8NTAAAAAElFTkSuQmCC",
                  element: "fire",
                  power: 25,
                  age: 5,
                  size: "small",
                  rarity: "common",
                  location: { lat: 0, lng: 0, biome: "urban" },
                  capturedAt: new Date(),
                  lore: "Simple test",
                };

                console.log("🧪 Monster imageUrl:", simpleTestMonster.imageUrl);
                console.log(
                  "🧪 Monster imageUrl length:",
                  simpleTestMonster.imageUrl.length
                );
                console.log(
                  "🧪 Monster imageUrl > 10:",
                  simpleTestMonster.imageUrl.length > 10
                );

                addMonster(simpleTestMonster);
                alert(
                  `Simple test monster added!\nImage length: ${
                    simpleTestMonster.imageUrl.length
                  }\nShould be > 10: ${simpleTestMonster.imageUrl.length > 10}`
                );
              }}
              className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
            >
              🔍 Simple Test
            </button>
            <button
              onClick={() => {
                // Create a 50x50 red square SVG
                const redSquareSvg = `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><rect width="50" height="50" fill="red"/><text x="25" y="30" text-anchor="middle" fill="white" font-size="12">TEST</text></svg>`;
                const redSquareDataUrl = `data:image/svg+xml;base64,${btoa(
                  redSquareSvg
                )}`;

                console.log(
                  "🟥 BIG TEST: Adding monster with large red square"
                );
                const bigTestMonster: Monster = {
                  id: `big_${Date.now()}`,
                  name: "Big Red Test",
                  description: "Large red square that should be visible",
                  imageUrl: redSquareDataUrl,
                  element: "fire",
                  power: 99,
                  age: 1,
                  size: "giant",
                  rarity: "legendary",
                  location: { lat: 0, lng: 0, biome: "urban" },
                  capturedAt: new Date(),
                  lore: "Big red square for testing",
                };

                console.log("🟥 Big test imageUrl:", bigTestMonster.imageUrl);
                console.log(
                  "🟥 Big test imageUrl length:",
                  bigTestMonster.imageUrl.length
                );

                addMonster(bigTestMonster);
                alert(
                  `Big red square added!\nImage length: ${bigTestMonster.imageUrl.length}\nShould be clearly visible!`
                );
              }}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
            >
              🟥 Big Test
            </button>
            <button
              onClick={() => {
                // Test with exact Gemini format: data:image/png;base64,
                const geminiLikeMonster: Monster = {
                  id: `gemini_format_${Date.now()}`,
                  name: "Gemini Format Test",
                  description: "Testing exact Gemini image format",
                  imageUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABUlEQVR42mNkYPg/A4hHw4kKAAAAAElFTkSuQmCC", // Valid 10x10 transparent PNG
                  element: "water",
                  power: 50,
                  age: 10,
                  size: "medium",
                  rarity: "common",
                  location: { lat: 0, lng: 0, biome: "forest" },
                  capturedAt: new Date(),
                  lore: "Testing Gemini format",
                };
                addMonster(geminiLikeMonster);
                alert("Gemini format test added!");
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
            >
              💧 Gemini Format
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "⚠️ Clear all monsters from collection?\n\nThis cannot be undone!"
                  )
                ) {
                  console.log("🗑️ Clearing collection...");
                  console.log(
                    "Before clear:",
                    localStorage.getItem("monster-store")
                  );

                  // Clear from Zustand store
                  collectedMonsters.forEach((monster) =>
                    removeMonster(monster.id)
                  );

                  // Also clear localStorage as backup
                  localStorage.removeItem("monster-store");

                  console.log(
                    "After clear:",
                    localStorage.getItem("monster-store")
                  );
                  console.log(
                    "Collection cleared! Current count:",
                    getTotalCount()
                  );

                  alert("Collection cleared!");
                }
              }}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {collectedMonsters.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">👹</span>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-game text-primary-400">
                No Monsters Yet
              </h2>
              <p className="text-dark-300 max-w-md">
                Start exploring the map to discover and capture your first
                monsters!
              </p>
            </div>
            <button onClick={() => navigate("/map")} className="game-button">
              Start Hunting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectedMonsters.map((monster, index) => {
              console.log(`🃏 Rendering monster ${index + 1}:`, {
                name: monster.name,
                id: monster.id,
                hasImageUrl: !!monster.imageUrl,
                imageUrlLength: monster.imageUrl?.length || 0,
                element: monster.element,
                rarity: monster.rarity,
              });

              return (
                <div key={monster.id} className="monster-card">
                  <div className="aspect-square bg-dark-700 rounded-lg mb-4 flex items-center justify-center relative">
                    {/* Debug: Force show what condition is being used */}
                    {(() => {
                      const hasImageUrl = !!monster.imageUrl;
                      const imageLength = monster.imageUrl?.length || 0;
                      const hasValidImage = hasImageUrl && imageLength > 10;

                      console.log(
                        `🎨 Monster ${monster.name}: hasImageUrl=${hasImageUrl}, imageLength=${imageLength}, hasValidImage=${hasValidImage}`
                      );
                      console.log(`🎨 ImageURL exists: "${monster.imageUrl}"`);

                      if (hasValidImage) {
                        return (
                          <div className="w-full h-full relative">
                            <img
                              src={monster.imageUrl}
                              alt={monster.name}
                              className="w-full h-full object-contain rounded-lg bg-gray-800"
                              style={{
                                minWidth: "100%",
                                minHeight: "100%",
                                imageRendering: "auto",
                              }}
                              onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                console.log(
                                  `✅ Image loaded for ${monster.name}:`
                                );
                                console.log(
                                  `  - Natural size: ${img.naturalWidth}x${img.naturalHeight}`
                                );
                                console.log(
                                  `  - Display size: ${img.width}x${img.height}`
                                );
                                console.log(
                                  `  - Source: ${monster.imageUrl.substring(
                                    0,
                                    50
                                  )}...`
                                );
                              }}
                              onError={(e) => {
                                console.error(
                                  `❌ Image failed to load for ${monster.name}:`,
                                  e
                                );
                                console.log(
                                  "Image URL length:",
                                  monster.imageUrl?.length
                                );
                                console.log(
                                  "Image URL preview:",
                                  monster.imageUrl?.substring(0, 100)
                                );
                              }}
                            />
                            {/* Debug overlay to see if image area is working */}
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded opacity-50">
                              IMG
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center text-white">
                            <span className="text-4xl block mb-2">
                              {monster.name.includes("Test") ? "🧪" : "👹"}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {monster.imageUrl ? (
                                <div>
                                  🔄 AI Image ({monster.imageUrl.length} chars)
                                </div>
                              ) : (
                                <div>📝 No Image</div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })()}
                    {!monster.name.includes("Test") && monster.imageUrl && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        🤖 AI
                      </div>
                    )}
                    {!monster.imageUrl && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        📝 Fallback
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-game text-lg text-primary-400">
                      {monster.name}
                    </h3>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-300">{monster.element}</span>
                      <span className="text-accent-400 font-medium">
                        {monster.rarity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-dark-400">
                      <div>Power: {monster.power}</div>
                      <div>Size: {monster.size}</div>
                      <div>Age: {monster.age}y</div>
                      <div>Element: {monster.element}</div>
                    </div>

                    <p className="text-dark-300 text-sm line-clamp-3">
                      {monster.description}
                    </p>

                    <div className="text-xs text-dark-500">
                      Captured:{" "}
                      {new Date(monster.capturedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Collection;
