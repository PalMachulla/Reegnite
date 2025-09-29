import { LocationContext, WeatherData, BiomeType } from "@/types";
import { weatherService } from "@/services/weather";

/**
 * Build comprehensive prompt for monster image generation using Gemini Flash 2.5
 */
export function buildMonsterImagePrompt(
  locationContext: LocationContext
): string {
  const { biome, weather, nearbyFeatures } = locationContext;

  const biomePrompts = getBiomeSpecificPrompt(biome, weather);
  const weatherContext = weatherService.getDetailedWeatherContext(weather);
  const stylePrompts = getLowPolyStylePrompts();

  const prompt = `Generate a low-poly 3D style creature that would inhabit ${biome} environments. 

LOCATION CONTEXT:
- Biome: ${biome}
- ${weatherContext.atmosphere}
- Environment: ${weatherContext.temperature_feel} with ${
    weatherContext.humidity_feel
  }
- Weather condition: ${weather.condition} with ${
    weatherContext.wind_description
  }
- Nearby features: ${nearbyFeatures.join(", ")}

CREATURE CHARACTERISTICS:
${biomePrompts.characteristics}

VISUAL STYLE:
${stylePrompts}

The creature should look like it belongs in this specific environment during ${
    weather.time
  } in ${
    weather.season
  }. Make it mystical and game-like, suitable for a monster collection game similar to Pokemon GO.

Style: Low-poly 3D game art, vibrant colors, fantasy creature design, clear silhouette, suitable for mobile game display.`;

  return prompt;
}

/**
 * Build structured prompt for monster data generation using text LLM
 */
export function buildMonsterDataPrompt(
  locationContext: LocationContext,
  imageDescription?: string
): string {
  const { biome, weather, nearbyFeatures } = locationContext;
  const weatherContext = weatherService.getDetailedWeatherContext(weather);

  const prompt = `Create detailed monster data for a creature found in ${biome} during ${
    weather.time
  } in ${weather.season}.

ENVIRONMENT CONTEXT:
- Location: ${biome} biome
- Weather: ${weather.condition}, ${weather.temperature}°C, ${
    weather.humidity
  }% humidity
- Atmosphere: ${weatherContext.atmosphere}
- Features: ${nearbyFeatures.join(", ")}

${imageDescription ? `VISUAL DESCRIPTION: ${imageDescription}` : ""}

Generate a JSON response with the following structure:
{
  "name": "Creative monster name reflecting the environment",
  "description": "2-3 sentence description of the monster's appearance and behavior",
  "element": "Choose from: fire, water, earth, air, shadow, light, ice, lightning",
  "power": "Number between 10-100 based on rarity and environment danger",
  "age": "Number between 1-1000 years",
  "size": "Choose from: tiny, small, medium, large, giant",
  "rarity": "Choose from: common, uncommon, rare, epic, legendary",
  "lore": "2-3 sentences about the monster's history, habitat, and role in its ecosystem"
}

Base the stats on:
- Biome danger level (${getBiomeDangerLevel(biome)})
- Weather intensity (${getWeatherIntensity(weather)})
- Time of day mystical factor (${getTimeOfDayFactor(weather.time)})

Ensure the monster feels authentic to its ${biome} environment ${
    weatherContext.atmosphere
  }.`;

  return prompt;
}

/**
 * Get biome-specific creature prompts
 */
function getBiomeSpecificPrompt(
  biome: BiomeType,
  weather: WeatherData
): {
  characteristics: string;
} {
  const biomePrompts: Record<BiomeType, { characteristics: string }> = {
    mountain: {
      characteristics: `A sturdy, rocky creature with strong limbs for climbing. Features stone-like skin textures, possibly with crystalline elements. Adapted for thin air and cold temperatures. Could have goat-like or eagle-like features.`,
    },
    forest: {
      characteristics: `A woodland creature with bark-like skin or leafy appendages. Natural camouflage abilities, possibly with mushroom or plant growths. Graceful movements, connected to nature's rhythm.`,
    },
    coast: {
      characteristics: `An amphibious creature comfortable on land and sea. Features could include shells, scales, or coral-like growths. Shimmering skin that reflects water, possibly with tentacle or fin elements.`,
    },
    urban: {
      characteristics: `A tech-adapted creature with metallic elements or neon highlights. Sleek design with geometric patterns. Possibly feeds on electricity or urban energy sources.`,
    },
    desert: {
      characteristics: `A heat-resistant creature with sandy coloration and possibly spines or armor. Water-conserving adaptations, maybe with crystal formations or sand manipulation abilities.`,
    },
    lake: {
      characteristics: `A serene water creature with smooth, flowing features. Translucent or iridescent skin, possibly with lily pad or water element decorations. Peaceful appearance.`,
    },
    river: {
      characteristics: `A flowing, dynamic creature that embodies moving water. Streamlined body, possibly with current-like patterns or flowing appendages. Agile and swift.`,
    },
    plains: {
      characteristics: `A ground-dwelling creature built for speed and endurance. Earth-toned coloration, possibly with grass-like features or wind manipulation abilities.`,
    },
    swamp: {
      characteristics: `A murky, mysterious creature with moss and bog elements. Possibly toxic or healing abilities, with amphibian features and earthy, wet textures.`,
    },
    tundra: {
      characteristics: `An ice-adapted creature with thick, insulating features. Pale coloration with possible aurora-like effects. Built for extreme cold and long migrations.`,
    },
  };

  const base = biomePrompts[biome];

  // Add weather-specific modifications
  let weatherMods = "";
  if (weather.condition === "rainy")
    weatherMods += " The creature shows signs of thriving in wet conditions.";
  if (weather.condition === "snowy")
    weatherMods += " Ice or snow elements are integrated into its design.";
  if (weather.condition === "thunderstorm")
    weatherMods +=
      " Lightning-like patterns or electrical elements are visible.";
  if (weather.time === "night")
    weatherMods += " Bioluminescent features help it navigate in darkness.";

  return {
    characteristics: base.characteristics + weatherMods,
  };
}

/**
 * Get low-poly style specifications
 */
function getLowPolyStylePrompts(): string {
  return `- Low-polygon 3D art style with clearly defined geometric faces
- Vibrant, saturated colors with clean gradients
- Minimal textures, focus on solid color regions
- Clean, angular silhouette with defined edges
- Game-ready appearance suitable for mobile displays
- Fantasy creature aesthetic with magical elements
- Lighting should be simple but effective
- No overly complex details - focus on iconic shape and color
- Should look appealing in a small card format`;
}

/**
 * Determine biome danger level for stat calculation
 */
function getBiomeDangerLevel(biome: BiomeType): "low" | "medium" | "high" {
  const dangerLevels: Record<BiomeType, "low" | "medium" | "high"> = {
    plains: "low",
    forest: "medium",
    lake: "low",
    river: "low",
    coast: "medium",
    urban: "low",
    mountain: "high",
    desert: "high",
    swamp: "high",
    tundra: "high",
  };

  return dangerLevels[biome];
}

/**
 * Determine weather intensity for stat calculation
 */
function getWeatherIntensity(weather: WeatherData): "low" | "medium" | "high" {
  if (weather.condition === "thunderstorm" || weather.windSpeed > 30)
    return "high";
  if (
    weather.condition === "rainy" ||
    weather.condition === "snowy" ||
    weather.windSpeed > 15
  )
    return "medium";
  return "low";
}

/**
 * Get mystical factor based on time of day
 */
function getTimeOfDayFactor(
  time: WeatherData["time"]
): "low" | "medium" | "high" {
  if (time === "night" || time === "dawn") return "high";
  if (time === "evening") return "medium";
  return "low";
}

/**
 * Create a complete monster generation context
 */
export function createMonsterGenerationContext(
  locationContext: LocationContext
) {
  return {
    imagePrompt: buildMonsterImagePrompt(locationContext),
    dataPrompt: buildMonsterDataPrompt(locationContext),
    location: locationContext,
    estimatedPower: estimateMonsterPower(locationContext),
    estimatedRarity: estimateMonsterRarity(locationContext),
  };
}

/**
 * Estimate monster power based on environmental factors
 */
function estimateMonsterPower(locationContext: LocationContext): number {
  const { biome, weather } = locationContext;

  let basePower = 30;

  // Biome modifiers
  const biomeModifiers: Record<BiomeType, number> = {
    plains: 0,
    forest: 5,
    lake: 0,
    river: 0,
    coast: 10,
    urban: -5,
    mountain: 20,
    desert: 25,
    swamp: 15,
    tundra: 20,
  };

  basePower += biomeModifiers[biome];

  // Weather modifiers
  if (weather.condition === "thunderstorm") basePower += 15;
  if (weather.condition === "snowy") basePower += 10;
  if (weather.time === "night") basePower += 8;
  if (weather.windSpeed > 25) basePower += 5;

  return Math.min(100, Math.max(10, basePower + Math.random() * 20 - 10));
}

/**
 * Estimate monster rarity based on environmental factors
 */
function estimateMonsterRarity(locationContext: LocationContext): string {
  const powerLevel = estimateMonsterPower(locationContext);
  const { weather } = locationContext;

  let rarity = "common";

  if (powerLevel > 70) rarity = "epic";
  else if (powerLevel > 50) rarity = "rare";
  else if (powerLevel > 35) rarity = "uncommon";

  // Special conditions for legendary
  if (
    weather.condition === "thunderstorm" &&
    weather.time === "night" &&
    Math.random() < 0.1
  ) {
    rarity = "legendary";
  }

  return rarity;
}
