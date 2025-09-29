import { BiomeType, LocationContext, WeatherData } from "@/types";

/**
 * Detect biome type based on location and environmental factors
 */
export function detectBiome(
  lat: number,
  lng: number,
  weather: WeatherData
): BiomeType {
  // Basic biome detection based on latitude and weather
  const absLat = Math.abs(lat);

  // Arctic/Tundra regions
  if (absLat > 66.5) {
    return "tundra";
  }

  // Desert regions (rough approximation for major desert belts)
  if (absLat >= 20 && absLat <= 35 && weather.humidity < 30) {
    return "desert";
  }

  // Coastal detection (simplified - in a real app you'd use a coastline database)
  if (isNearCoast(lat, lng)) {
    return "coast";
  }

  // Mountain detection (elevation would be ideal, using rough geographic areas)
  if (isInMountainousRegion(lat, lng)) {
    return "mountain";
  }

  // Urban detection (major city coordinates - simplified)
  if (isUrbanArea(lat, lng)) {
    return "urban";
  }

  // Water bodies
  if (isNearWater(lat, lng)) {
    return Math.random() > 0.5 ? "lake" : "river";
  }

  // Wetlands
  if (weather.humidity > 80 && weather.condition === "rainy") {
    return "swamp";
  }

  // Default to forest or plains based on season and latitude
  if (absLat < 30 || weather.season === "summer") {
    return Math.random() > 0.6 ? "forest" : "plains";
  }

  return "plains";
}

/**
 * Simplified coastal detection
 * In a production app, you'd use a proper coastline database
 */
function isNearCoast(lat: number, lng: number): boolean {
  // Major coastal areas (very simplified)
  const coastalRegions = [
    // US West Coast
    { latMin: 32, latMax: 49, lngMin: -125, lngMax: -117 },
    // US East Coast
    { latMin: 25, latMax: 45, lngMin: -82, lngMax: -67 },
    // UK/Ireland
    { latMin: 50, latMax: 61, lngMin: -11, lngMax: 2 },
    // Norway Coast
    { latMin: 58, latMax: 71, lngMin: 4, lngMax: 31 },
    // Mediterranean
    { latMin: 30, latMax: 46, lngMin: -6, lngMax: 36 },
    // Australia East Coast
    { latMin: -38, latMax: -10, lngMin: 140, lngMax: 155 },
  ];

  return coastalRegions.some(
    (region) =>
      lat >= region.latMin &&
      lat <= region.latMax &&
      lng >= region.lngMin &&
      lng <= region.lngMax
  );
}

/**
 * Simplified mountainous region detection
 */
function isInMountainousRegion(lat: number, lng: number): boolean {
  const mountainRanges = [
    // Rocky Mountains
    { latMin: 31, latMax: 49, lngMin: -114, lngMax: -102 },
    // Alps
    { latMin: 43, latMax: 49, lngMin: 5, lngMax: 17 },
    // Himalayas
    { latMin: 27, latMax: 36, lngMin: 70, lngMax: 105 },
    // Andes (simplified)
    { latMin: -55, latMax: 12, lngMin: -81, lngMax: -65 },
    // Norwegian Mountains
    { latMin: 60, latMax: 71, lngMin: 5, lngMax: 30 },
  ];

  return mountainRanges.some(
    (range) =>
      lat >= range.latMin &&
      lat <= range.latMax &&
      lng >= range.lngMin &&
      lng <= range.lngMax
  );
}

/**
 * Simplified urban area detection
 */
function isUrbanArea(lat: number, lng: number): boolean {
  const majorCities = [
    // New York
    { lat: 40.7589, lng: -73.9851, radius: 0.5 },
    // London
    { lat: 51.5099, lng: -0.118, radius: 0.3 },
    // Tokyo
    { lat: 35.6762, lng: 139.6503, radius: 0.5 },
    // Los Angeles
    { lat: 34.0549, lng: -118.2426, radius: 0.4 },
    // Oslo
    { lat: 59.9139, lng: 10.7522, radius: 0.2 },
    // Sydney
    { lat: -33.8688, lng: 151.2093, radius: 0.3 },
  ];

  return majorCities.some((city) => {
    const distance = getDistance(lat, lng, city.lat, city.lng);
    return distance < city.radius;
  });
}

/**
 * Simplified water body detection
 */
function isNearWater(lat: number, lng: number): boolean {
  // Major lakes and rivers (very simplified)
  const waterBodies = [
    // Great Lakes region
    { latMin: 41, latMax: 49, lngMin: -93, lngMax: -75 },
    // Scandinavian lakes
    { latMin: 55, latMax: 70, lngMin: 5, lngMax: 35 },
  ];

  return waterBodies.some(
    (water) =>
      lat >= water.latMin &&
      lat <= water.latMax &&
      lng >= water.lngMin &&
      lng <= water.lngMax
  );
}

/**
 * Calculate distance between two points in degrees
 */
function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Generate nearby features based on biome and location
 */
export function getNearbyFeatures(
  biome: BiomeType,
  weather: WeatherData
): string[] {
  const biomeFeatures: Record<BiomeType, string[]> = {
    mountain: [
      "rocky peaks",
      "steep cliffs",
      "alpine meadows",
      "snow-capped summits",
      "mountain caves",
    ],
    forest: [
      "ancient trees",
      "dense undergrowth",
      "woodland clearings",
      "moss-covered rocks",
      "forest streams",
    ],
    coast: [
      "sandy beaches",
      "rocky shores",
      "tide pools",
      "sea cliffs",
      "driftwood",
    ],
    urban: [
      "tall buildings",
      "concrete structures",
      "street lights",
      "urban parks",
      "alleyways",
    ],
    desert: ["sand dunes", "rocky outcrops", "cacti", "oases", "ancient ruins"],
    lake: [
      "calm waters",
      "reedy shores",
      "floating logs",
      "water lilies",
      "fishing docks",
    ],
    river: [
      "flowing water",
      "river stones",
      "overhanging branches",
      "river banks",
      "old bridges",
    ],
    plains: [
      "rolling hills",
      "grasslands",
      "scattered trees",
      "wildflowers",
      "distant horizons",
    ],
    swamp: [
      "murky waters",
      "twisted trees",
      "floating vegetation",
      "misty air",
      "hidden paths",
    ],
    tundra: [
      "frozen ground",
      "sparse vegetation",
      "ice formations",
      "aurora lights",
      "windswept plains",
    ],
  };

  const features = biomeFeatures[biome] || [];
  const weatherFeatures = getWeatherFeatures(weather);

  // Randomly select 2-4 features
  const selectedFeatures = features
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 2);

  return [...selectedFeatures, ...weatherFeatures];
}

/**
 * Get additional features based on weather
 */
function getWeatherFeatures(weather: WeatherData): string[] {
  const features: string[] = [];

  if (weather.condition === "rainy") features.push("rain-soaked ground");
  if (weather.condition === "snowy") features.push("snow-covered landscape");
  if (weather.condition === "foggy") features.push("misty atmosphere");
  if (weather.condition === "thunderstorm") features.push("lightning-lit sky");
  if (weather.windSpeed > 20) features.push("strong winds");
  if (weather.temperature < 0) features.push("frost-covered surfaces");
  if (weather.time === "night") features.push("moonlit shadows");
  if (weather.time === "dawn") features.push("morning dew");

  return features;
}

/**
 * Create full location context for monster generation
 */
export function createLocationContext(
  lat: number,
  lng: number,
  weather: WeatherData
): LocationContext {
  const biome = detectBiome(lat, lng, weather);
  const nearbyFeatures = getNearbyFeatures(biome, weather);

  return {
    coordinates: { lat, lng },
    biome,
    weather,
    nearbyFeatures,
  };
}
