import axios from "axios";
import { WeatherData } from "@/types";

interface METWeatherResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  properties: {
    meta: {
      updated_at: string;
      units: {
        air_pressure_at_sea_level: string;
        air_temperature: string;
        cloud_area_fraction: string;
        precipitation_amount: string;
        relative_humidity: string;
        wind_from_direction: string;
        wind_speed: string;
      };
    };
    timeseries: Array<{
      time: string;
      data: {
        instant: {
          details: {
            air_pressure_at_sea_level: number;
            air_temperature: number;
            cloud_area_fraction: number;
            relative_humidity: number;
            wind_from_direction: number;
            wind_speed: number;
          };
        };
        next_1_hours?: {
          summary: {
            symbol_code: string;
          };
          details: {
            precipitation_amount: number;
          };
        };
      };
    }>;
  };
}

class WeatherService {
  private readonly baseUrl =
    "https://api.met.no/weatherapi/locationforecast/2.0";
  private readonly userAgent =
    "MonsterHunterPWA/1.0 (+https://your-app-domain.com contact@your-domain.com)";

  /**
   * Get current weather data for a location using fallback system
   * (MET Norway API has CORS restrictions in browser)
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    console.log("Using fallback weather system due to CORS restrictions");
    const fallbackWeather = this.generateFallbackWeather(lat, lng);
    console.log("Generated fallback weather:", fallbackWeather);
    return fallbackWeather;
  }

  /**
   * Map MET Norway symbol codes to our simplified weather conditions
   */
  private mapSymbolCodeToCondition(symbolCode: string): string {
    // MET Norway uses detailed symbol codes like 'clearsky_day', 'rain_light', etc.
    if (symbolCode.includes("clearsky")) return "clear";
    if (symbolCode.includes("fair")) return "partly_cloudy";
    if (symbolCode.includes("partlycloud")) return "partly_cloudy";
    if (symbolCode.includes("cloud")) return "cloudy";
    if (symbolCode.includes("rain")) return "rainy";
    if (symbolCode.includes("snow")) return "snowy";
    if (symbolCode.includes("sleet")) return "sleet";
    if (symbolCode.includes("fog")) return "foggy";
    if (symbolCode.includes("thunder")) return "thunderstorm";

    return "partly_cloudy"; // Default fallback
  }

  /**
   * Determine time of day based on current time
   */
  private getTimeOfDay(): WeatherData["time"] {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 20) return "evening";
    return "night";
  }

  /**
   * Determine current season based on date
   */
  private getCurrentSeason(): WeatherData["season"] {
    const month = new Date().getMonth(); // 0-11

    if (month >= 2 && month <= 4) return "spring"; // Mar, Apr, May
    if (month >= 5 && month <= 7) return "summer"; // Jun, Jul, Aug
    if (month >= 8 && month <= 10) return "autumn"; // Sep, Oct, Nov
    return "winter"; // Dec, Jan, Feb
  }

  /**
   * Generate realistic fallback weather when API fails
   */
  private generateFallbackWeather(lat: number, lng: number): WeatherData {
    const absLat = Math.abs(lat);
    const season = this.getCurrentSeason();
    const time = this.getTimeOfDay();

    // Temperature based on latitude and season
    let baseTemp = 20;
    if (absLat > 60) baseTemp = 5; // Arctic
    else if (absLat > 45) baseTemp = 15; // Temperate
    else if (absLat > 23) baseTemp = 25; // Subtropical
    else baseTemp = 30; // Tropical

    // Season adjustments
    if (season === "winter") baseTemp -= 10;
    else if (season === "summer") baseTemp += 5;
    else if (season === "spring" || season === "autumn") baseTemp += 0;

    // Random variation
    const temperature = Math.max(
      -20,
      Math.min(45, baseTemp + (Math.random() - 0.5) * 10)
    );

    // Conditions based on season and randomness
    const conditions = ["clear", "partly_cloudy", "cloudy", "rainy"];
    if (season === "winter" && absLat > 45) conditions.push("snowy");
    if (temperature > 25) conditions.push("clear", "partly_cloudy"); // Bias toward clear in warm weather

    return {
      temperature: Math.round(temperature),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      windSpeed: Math.round(Math.random() * 20), // 0-20 km/h
      time,
      season,
    };
  }

  /**
   * Get weather description for monster prompt generation
   */
  getWeatherDescription(weather: WeatherData): string {
    const conditions: Record<string, string> = {
      clear: "under clear skies",
      partly_cloudy: "with scattered clouds",
      cloudy: "under overcast skies",
      rainy: "in the rain",
      snowy: "during snowfall",
      sleet: "in freezing rain",
      foggy: "shrouded in mist",
      thunderstorm: "amid thunderstorms",
    };

    const timeDescriptions: Record<string, string> = {
      dawn: "at the break of dawn",
      morning: "in the morning light",
      afternoon: "under the midday sun",
      evening: "in the evening twilight",
      night: "under the cover of darkness",
    };

    const seasonDescriptions: Record<string, string> = {
      spring: "during the awakening of spring",
      summer: "in the height of summer",
      autumn: "as autumn leaves fall",
      winter: "in the depths of winter",
    };

    return `${timeDescriptions[weather.time]} ${
      conditions[weather.condition] || "with unknown weather"
    } ${seasonDescriptions[weather.season]}`;
  }

  /**
   * Enhanced weather context for monster generation
   */
  getDetailedWeatherContext(weather: WeatherData): {
    atmosphere: string;
    temperature_feel: string;
    wind_description: string;
    humidity_feel: string;
  } {
    const getTemperatureFeel = (temp: number): string => {
      if (temp < -10) return "bitter cold";
      if (temp < 0) return "freezing cold";
      if (temp < 10) return "chilly";
      if (temp < 20) return "cool";
      if (temp < 30) return "warm";
      return "hot";
    };

    const getWindDescription = (speed: number): string => {
      if (speed < 5) return "still air";
      if (speed < 15) return "gentle breeze";
      if (speed < 25) return "moderate wind";
      if (speed < 40) return "strong wind";
      return "fierce gales";
    };

    const getHumidityFeel = (humidity: number): string => {
      if (humidity < 30) return "dry air";
      if (humidity < 60) return "comfortable humidity";
      if (humidity < 80) return "humid air";
      return "oppressive humidity";
    };

    return {
      atmosphere: this.getWeatherDescription(weather),
      temperature_feel: getTemperatureFeel(weather.temperature),
      wind_description: getWindDescription(weather.windSpeed),
      humidity_feel: getHumidityFeel(weather.humidity),
    };
  }
}

export const weatherService = new WeatherService();
export default weatherService;
