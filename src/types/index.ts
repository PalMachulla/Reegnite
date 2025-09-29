export interface Player {
  id: string;
  username: string;
  position: {
    lat: number;
    lng: number;
  };
  collectedMonsters: Monster[];
  isAuthenticated: boolean;
}

export interface Monster {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  element: ElementType;
  power: number;
  age: number;
  size: MonsterSize;
  rarity: MonsterRarity;
  location: {
    lat: number;
    lng: number;
    biome: BiomeType;
  };
  capturedAt: Date;
  lore: string;
}

export interface MonsterSpawn {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  biome: BiomeType;
  spawnedAt: Date;
  captured: boolean;
}

export type ElementType =
  | "fire"
  | "water"
  | "earth"
  | "air"
  | "shadow"
  | "light"
  | "ice"
  | "lightning";

export type MonsterSize = "tiny" | "small" | "medium" | "large" | "giant";

export type MonsterRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type BiomeType =
  | "mountain"
  | "forest"
  | "coast"
  | "urban"
  | "desert"
  | "lake"
  | "river"
  | "plains"
  | "swamp"
  | "tundra";

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  time: "dawn" | "morning" | "afternoon" | "evening" | "night";
  season: "spring" | "summer" | "autumn" | "winter";
}

export interface LocationContext {
  coordinates: {
    lat: number;
    lng: number;
  };
  biome: BiomeType;
  weather: WeatherData;
  nearbyFeatures: string[];
}

export interface CaptureResult {
  success: boolean;
  monster?: Monster;
  error?: string;
}

export interface GameState {
  isLoading: boolean;
  currentView: "splash" | "login" | "map" | "capture" | "collection";
  nearbyMonsters: MonsterSpawn[];
  captureInProgress: boolean;
  error: string | null;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface APIError {
  message: string;
  code: string;
  details?: any;
}

export interface MonsterGenerationRequest {
  locationContext: LocationContext;
  prompt: string;
}

export interface MonsterGenerationResponse {
  imageUrl: string;
  monsterData: {
    name: string;
    description: string;
    element: ElementType;
    power: number;
    age: number;
    size: MonsterSize;
    rarity: MonsterRarity;
    lore: string;
  };
}
