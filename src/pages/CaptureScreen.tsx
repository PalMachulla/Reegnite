import { useNavigate, useLocation } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { useMonsterStore } from "@/stores/monsterStore";
import CaptureMinigame from "@/components/Game/CaptureMinigame";
import { geminiService } from "@/services/gemini";
import { Monster } from "@/types";

const CaptureScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { removeNearbyMonster } = useGameStore();
  const { addMonster, updateMonster } = useMonsterStore();

  // Get the target monster and location context from router state
  const { targetMonster, locationContext } = location.state || {};

  if (!targetMonster || !locationContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-light-100 mb-4">
            🎯 No Monster Found
          </h2>
          <p className="text-light-300 mb-6">
            No monster selected for capture. Return to the map to find
            creatures.
          </p>
          <button
            onClick={() => navigate("/map")}
            className="game-button-primary"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  const handleSuccess = async () => {
    if (targetMonster && locationContext) {
      console.log("🎯 Monster capture successful! Processing...");
      console.log("Target monster:", targetMonster);
      console.log("Location context:", locationContext);

      // ✅ GUARANTEED MONSTER SAVE - Create a high-quality fallback monster first
      const capturedMonster: Monster = {
        id: `captured_${Date.now()}`,
        name: `${
          targetMonster.biome.charAt(0).toUpperCase() +
          targetMonster.biome.slice(1)
        } Guardian`,
        description: `A magnificent creature native to ${targetMonster.biome} regions. Captured during ${locationContext.weather.time} when the weather was ${locationContext.weather.condition}. This creature has adapted perfectly to its natural habitat.`,
        imageUrl: "", // Will be enhanced by AI if successful
        element: "earth", // Default element (will be enhanced by AI)
        power: Math.floor(Math.random() * 40) + 40, // 40-80 power
        age: Math.floor(Math.random() * 150) + 25, // 25-175 years
        size: "medium", // Default size (will be enhanced by AI)
        rarity: locationContext.weather.time === "night" ? "rare" : "common",
        location: {
          lat: targetMonster.position.lat,
          lng: targetMonster.position.lng,
          biome: targetMonster.biome,
        },
        capturedAt: new Date(),
        lore: `Legends tell of these ancient beings emerging from ${targetMonster.biome} sanctuaries during ${locationContext.weather.season}. When the temperature reaches ${locationContext.weather.temperature}°C, they reveal themselves to worthy travelers, sharing their ancient wisdom and forming bonds that transcend time itself.`,
      };

      console.log("💾 Saving guaranteed monster to collection...");
      addMonster(capturedMonster);
      removeNearbyMonster(targetMonster.id);

      console.log("✅ Monster successfully saved to collection!");
      console.log("📱 Captured monster:", capturedMonster);

      // 🤖 BONUS: Try to enhance with AI (but don't block if it fails)
      try {
        console.log("🎨 Attempting AI enhancement...");
        const aiGenerated = await geminiService.generateCompleteMonster(
          locationContext
        );

        console.log("✨ AI enhancement successful! Updating monster...");
        console.log("🔍 AI Generated Result:", aiGenerated);
        console.log("🖼️ AI Image URL:", aiGenerated.imageUrl);
        console.log("🖼️ Image URL length:", aiGenerated.imageUrl?.length || 0);
        console.log(
          "🖼️ Image URL preview:",
          aiGenerated.imageUrl?.substring(0, 100) || "none"
        );

        // Update the monster with AI-generated data
        const enhancedMonster: Monster = {
          ...capturedMonster,
          name: aiGenerated.monsterData.name || capturedMonster.name,
          description:
            aiGenerated.monsterData.description || capturedMonster.description,
          imageUrl: aiGenerated.imageUrl || "", // AI-generated image (if available)
          element: aiGenerated.monsterData.element || capturedMonster.element,
          power: aiGenerated.monsterData.power || capturedMonster.power,
          age: aiGenerated.monsterData.age || capturedMonster.age,
          size: aiGenerated.monsterData.size || capturedMonster.size,
          rarity: aiGenerated.monsterData.rarity || capturedMonster.rarity,
          lore: aiGenerated.monsterData.lore || capturedMonster.lore,
        };

        console.log("🎨 Enhanced Monster Object:", enhancedMonster);
        console.log("🖼️ Enhanced Monster Image URL:", enhancedMonster.imageUrl);
        console.log(
          "🖼️ Enhanced Monster Image URL Length:",
          enhancedMonster.imageUrl?.length || 0
        );

        // Replace the basic monster with the AI-enhanced version
        updateMonster(enhancedMonster);

        console.log("🎨 Monster enhanced with AI data:", enhancedMonster);
        console.log(
          "🖼️ AI Image:",
          enhancedMonster.imageUrl ? "Generated!" : "Not available"
        );
      } catch (error) {
        console.log("⚠️ AI enhancement failed (monster already saved):", error);
        console.log(
          "📱 Using fallback monster data - capture still successful!"
        );
      }

      // Navigate to collection to show the captured monster
      console.log("🧭 Navigating to collection to view captured monster...");
      navigate("/collection");
    }
  };

  const handleFailure = () => {
    console.log("❌ Monster capture failed - returning to map");
    navigate("/map");
  };

  const handleCancel = () => {
    console.log("🚫 Monster capture cancelled - returning to map");
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-100 mb-2">
            🎯 Monster Capture
          </h1>
          <p className="text-light-300">
            A wild {targetMonster.biome} creature appeared!
          </p>
          <p className="text-accent-400 text-sm mt-2">
            Location: {locationContext.weather.temperature}°C,{" "}
            {locationContext.weather.condition}
          </p>
        </div>

        <CaptureMinigame
          monster={targetMonster}
          locationContext={locationContext}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          onCancel={handleCancel}
        />

        <div className="mt-6 text-center">
          <p className="text-light-400 text-sm">
            💡 Tip: Every captured monster is guaranteed to be saved to your
            collection!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptureScreen;
