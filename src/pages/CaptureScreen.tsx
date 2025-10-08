import { useNavigate, useLocation } from "react-router-dom";
import { useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useMonsterStore } from "@/stores/monsterStore";
import CaptureMinigame from "@/components/Game/CaptureMinigame";
import { geminiService } from "@/services/gemini";
import { textGenerationService } from "@/services/textGeneration";
import {
  Monster,
  MonsterGenerationResponse,
  LocationContext,
  ElementType,
  MonsterSize,
} from "@/types";

// Helper functions to generate location-based monster data
function generateLocationBasedName(
  biome: string,
  locationContext: LocationContext
): string {
  const funnyNames = {
    coast: [
      "Sandy McWaves",
      "Captain Crustacean",
      "Beach Bum Basilisk",
      "Tide Turner Terry",
    ],
    forest: [
      "Twiggy McBranch",
      "Leaf Licker Larry",
      "Bark Biter Bob",
      "Mossy Mountain Mike",
    ],
    mountain: [
      "Rocky McStone",
      "Peak Climber Pete",
      "Summit Seeker Sam",
      "Boulder Basher Ben",
    ],
    lake: [
      "Puddle Jumper Joe",
      "Fishy Flipper Fred",
      "Wet Willy Walter",
      "Splash Master Steve",
    ],
    river: [
      "Current Cruiser Carl",
      "Rapid Runner Rick",
      "Stream Surfer Sue",
      "Water Walker Wendy",
    ],
    plains: [
      "Grass Grazer Gary",
      "Field Frolicker Frank",
      "Meadow Muncher Mary",
      "Prairie Prancer Paul",
    ],
    desert: [
      "Sand Scorcher Sam",
      "Dune Dancer Dave",
      "Cactus Crawler Carl",
      "Sunburn Steve",
    ],
    swamp: [
      "Mud Mucker Mike",
      "Bog Bouncer Betty",
      "Marsh Marcher Max",
      "Slime Slider Sarah",
    ],
    tundra: [
      "Frost Biter Frank",
      "Ice Igloo Igor",
      "Snow Shuffler Sally",
      "Chill Charlie",
    ],
    urban: [
      "Concrete Crawler Carl",
      "Sidewalk Stomper Sam",
      "Alley Lurker Larry",
      "City Scratcher Steve",
    ],
  };

  const weatherMods = {
    sunny: "the Sunny",
    rainy: "the Drippy",
    cloudy: "the Cloudy",
    snowy: "the Frosty",
    stormy: "the Stormy",
    foggy: "the Misty",
  };

  const biomeNames =
    funnyNames[biome as keyof typeof funnyNames] || funnyNames.forest;
  const weatherMod =
    weatherMods[
      locationContext.weather.condition as keyof typeof weatherMods
    ] || "";

  return weatherMod
    ? `${weatherMod} ${
        biomeNames[Math.floor(Math.random() * biomeNames.length)]
      }`
    : biomeNames[Math.floor(Math.random() * biomeNames.length)];
}

function generateLocationBasedDescription(
  biome: string,
  _locationContext: LocationContext
): string {
  const descriptions = {
    coast:
      "A coastal creature with shimmering scales that reflect the ocean's waves. This playful being loves to dance in the surf and collect colorful seashells.",
    forest:
      "A woodland guardian with bark-like skin and leaves growing from its back. It moves silently through the trees, protecting the ancient forest.",
    mountain:
      "A rugged mountain dweller with rocky armor and crystals embedded in its hide. It scales the highest peaks with ease, seeking rare minerals.",
    lake: "A serene lake spirit with flowing, water-like fur that changes color with the depth. It glides gracefully through the water, bringing peace to all who encounter it.",
    river:
      "A swift river runner with streamlined features and webbed appendages. It navigates rapids with incredible skill, always flowing toward new adventures.",
    plains:
      "A grassland wanderer with wind-swept fur and golden eyes that mirror the endless horizon. It runs free across the open plains, chasing the setting sun.",
    desert:
      "A desert survivor with sand-colored scales and heat-resistant skin. It burrows beneath the dunes during the day and emerges to hunt under the stars.",
    swamp:
      "A mystical swamp dweller with moss-covered hide and glowing eyes. It moves through the murky waters with ancient wisdom, guardian of forgotten secrets.",
    tundra:
      "An arctic explorer with thick, ice-blue fur and frost-resistant features. It thrives in the frozen wilderness, a master of the eternal winter.",
    urban:
      "A city slicker with metallic scales and neon-bright markings. It navigates the urban jungle with street smarts, finding magic in the concrete chaos.",
  };

  return (
    descriptions[biome as keyof typeof descriptions] || descriptions.forest
  );
}

function generateLocationBasedElement(
  biome: string,
  locationContext: LocationContext
): ElementType {
  const elementMap = {
    coast: ["water", "ice"],
    forest: ["earth", "air"],
    mountain: ["earth", "lightning"],
    lake: ["water", "ice"],
    river: ["water", "air"],
    plains: ["air", "light"],
    desert: ["fire", "earth"],
    swamp: ["water", "shadow"],
    tundra: ["ice", "air"],
    urban: ["lightning", "shadow"],
  };

  const weatherElements = {
    sunny: "fire",
    rainy: "water",
    cloudy: "air",
    snowy: "ice",
    stormy: "lightning",
    foggy: "shadow",
  };

  // 50% chance for weather-based element, 50% for biome-based
  if (Math.random() < 0.5) {
    return (weatherElements[
      locationContext.weather.condition as keyof typeof weatherElements
    ] || "earth") as ElementType;
  }

  const biomeElements = elementMap[biome as keyof typeof elementMap] || [
    "earth",
  ];
  return biomeElements[
    Math.floor(Math.random() * biomeElements.length)
  ] as ElementType;
}

function generateLocationBasedSize(biome: string): MonsterSize {
  const sizeMap = {
    coast: ["medium", "large"],
    forest: ["small", "medium"],
    mountain: ["medium", "large", "giant"],
    lake: ["small", "medium"],
    river: ["small", "medium"],
    plains: ["medium", "large"],
    desert: ["small", "medium"],
    swamp: ["medium", "large"],
    tundra: ["medium", "large"],
    urban: ["small", "medium"],
  };

  const sizes = sizeMap[biome as keyof typeof sizeMap] || ["medium"];
  return sizes[Math.floor(Math.random() * sizes.length)] as MonsterSize;
}

function generateLocationBasedLore(
  biome: string,
  _locationContext: LocationContext
): string {
  const loreTemplates = {
    coast: `Ancient legends speak of this coastal guardian emerging from the depths during ${_locationContext.weather.condition} weather. When the temperature reaches ${_locationContext.weather.temperature}°C, it reveals itself to beachcombers, sharing secrets of the ocean's mysteries and forming bonds that last beyond the tides.`,
    forest: `Deep in the ${biome} heartlands, this creature has watched over the trees for centuries. During ${_locationContext.weather.season}, when ${_locationContext.weather.condition} weather brings life to the forest floor, it emerges from its moss-covered sanctuary to guide lost travelers and protect the ancient groves.`,
    mountain: `High in the ${biome} peaks, this resilient creature has adapted to the harsh conditions. When ${_locationContext.weather.condition} weather sweeps across the mountains at ${_locationContext.weather.temperature}°C, it scales the highest summits, seeking rare crystals and sharing mountain wisdom with those brave enough to climb.`,
    lake: `Beneath the ${biome} waters, this peaceful spirit has dwelled for generations. During ${_locationContext.weather.season}, when the lake reflects the ${_locationContext.weather.condition} sky, it surfaces to bring tranquility to troubled souls and share the deep wisdom of still waters.`,
    river: `Flowing through the ${biome} valleys, this swift creature has traveled every bend and rapid. When ${_locationContext.weather.condition} weather fills the river with ${_locationContext.weather.temperature}°C water, it guides wayward travelers downstream, teaching the art of going with the flow.`,
  };

  return (
    loreTemplates[biome as keyof typeof loreTemplates] || loreTemplates.forest
  );
}

const CaptureScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { removeNearbyMonster } = useGameStore();
  const { addMonster, updateMonster } = useMonsterStore();

  // Store the ongoing AI generation promise to avoid duplicate calls
  const aiGenerationPromise = useRef<Promise<MonsterGenerationResponse> | null>(
    null
  );

  // Prevent double-processing if success is triggered multiple times
  const isProcessing = useRef<boolean>(false);

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

  // Start AI generation early when the fighting phase begins (reeling in)
  const handleFightingStart = () => {
    if (locationContext && !aiGenerationPromise.current) {
      console.log("🚀 Starting early AI generation during reeling phase...");
      // Generate both image and text in parallel
      aiGenerationPromise.current = Promise.all([
        geminiService.generateMonsterImageOnly(locationContext),
        textGenerationService.generateMonsterData(locationContext),
      ]).then(([imageUrl, monsterData]) => ({
        imageUrl,
        monsterData,
      }));
    }
  };

  const handleSuccess = async () => {
    // Guard against double-calls
    if (isProcessing.current) {
      console.log("⚠️ Already processing capture, ignoring duplicate call");
      return;
    }

    if (targetMonster && locationContext) {
      isProcessing.current = true; // Mark as processing
      console.log("🎯 Monster capture successful! Processing...");
      console.log("Target monster:", targetMonster);
      console.log("Location context:", locationContext);

      // ✅ GUARANTEED MONSTER SAVE - Create a high-quality fallback monster first
      const capturedMonster: Monster = {
        id: `captured_${Date.now()}`,
        name: generateLocationBasedName(targetMonster.biome, locationContext),
        description: generateLocationBasedDescription(
          targetMonster.biome,
          locationContext
        ),
        imageUrl: "", // Will be enhanced by AI if successful
        element: generateLocationBasedElement(
          targetMonster.biome,
          locationContext
        ),
        power: Math.floor(Math.random() * 40) + 40, // 40-80 power
        age: Math.floor(Math.random() * 150) + 25, // 25-175 years
        size: generateLocationBasedSize(targetMonster.biome),
        rarity: locationContext.weather.time === "night" ? "rare" : "common",
        location: {
          lat: targetMonster.position.lat,
          lng: targetMonster.position.lng,
          biome: targetMonster.biome,
        },
        capturedAt: new Date(),
        lore: generateLocationBasedLore(targetMonster.biome, locationContext),
      };

      console.log("💾 Saving guaranteed monster to collection...");
      addMonster(capturedMonster);
      removeNearbyMonster(targetMonster.id);

      console.log("✅ Monster successfully saved to collection!");
      console.log("📱 Captured monster:", capturedMonster);

      // 🤖 BONUS: Try to enhance with AI (use pre-started generation if available)
      try {
        console.log("🎨 Checking for AI enhancement...");

        // Use the already-started generation or start a new one if it wasn't triggered
        const aiGenerated = await (aiGenerationPromise.current ||
          Promise.all([
            geminiService.generateMonsterImageOnly(locationContext),
            textGenerationService.generateMonsterData(locationContext),
          ]).then(([imageUrl, monsterData]) => ({
            imageUrl,
            monsterData,
          })));

        console.log("✨ AI enhancement successful! Updating monster...");
        console.log("🔍 AI Generated Result:", aiGenerated);
        console.log("🖼️ AI Image URL:", aiGenerated.imageUrl);
        console.log("🖼️ Image URL length:", aiGenerated.imageUrl?.length || 0);
        console.log(
          "🖼️ Image URL preview:",
          aiGenerated.imageUrl?.substring(0, 100) || "none"
        );

        // Update the monster with AI-generated data (SAME ID - this replaces, not adds)
        const enhancedMonster: Monster = {
          ...capturedMonster, // This keeps the same ID!
          // Only use AI name if it's not generic, otherwise keep our location-based name
          name:
            aiGenerated.monsterData.name &&
            !aiGenerated.monsterData.name
              .toLowerCase()
              .includes("mysterious") &&
            !aiGenerated.monsterData.name.toLowerCase().includes("unknown") &&
            !aiGenerated.monsterData.name.toLowerCase().includes("creature") &&
            !aiGenerated.monsterData.name.toLowerCase().includes("wild beast")
              ? aiGenerated.monsterData.name
              : capturedMonster.name,
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
        console.log("🔍 Captured ID:", capturedMonster.id);
        console.log("🔍 Enhanced ID:", enhancedMonster.id);
        console.log("🔍 IDs Match:", capturedMonster.id === enhancedMonster.id);
        console.log("🖼️ Enhanced Monster Image URL:", enhancedMonster.imageUrl);
        console.log(
          "🖼️ Enhanced Monster Image URL Length:",
          enhancedMonster.imageUrl?.length || 0
        );

        // Replace the basic monster with the AI-enhanced version (same ID = update, not add)
        updateMonster(enhancedMonster);
        console.log("✅ Update complete!");

        // Small delay to ensure Zustand store updates propagate
        await new Promise((resolve) => setTimeout(resolve, 100));

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
      } finally {
        // Clear the promise reference for next capture
        aiGenerationPromise.current = null;
      }

      // Navigate to collection to show the captured monster
      console.log("🧭 Navigating to collection to view captured monster...");
      navigate("/collection");

      // Don't reset isProcessing here - let the unmount handle it
    }
  };

  const handleFailure = () => {
    console.log("❌ Monster capture failed - returning to map");
    // Clear any ongoing AI generation if capture fails
    aiGenerationPromise.current = null;
    navigate("/map");
  };

  const handleCancel = () => {
    console.log("🚫 Monster capture cancelled - returning to map");
    // Clear any ongoing AI generation if cancelled
    aiGenerationPromise.current = null;
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
          onFightingStart={handleFightingStart}
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
