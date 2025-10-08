import { LocationContext } from "@/types";

export class TextGenerationService {
  private apiKey: string;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private readonly MAX_REQUESTS_PER_MINUTE = 30; // More generous limit for text

  constructor() {
    this.apiKey = import.meta.env?.VITE_OPENAI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("OpenAI API key not found in environment variables");
    }
  }

  /**
   * Rate limiting helper
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    // Reset counter every minute
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      console.log("⏳ Rate limit reached, waiting 1 minute...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
      this.requestCount = 0;
    }
  }

  /**
   * Enhanced error handling
   */
  private handleApiError(error: any): string {
    if (error.message?.includes("429")) {
      return "🚫 API quota exceeded. Please check your billing settings.";
    }
    if (error.message?.includes("401")) {
      return "🔑 Invalid API key. Please check your VITE_OPENAI_API_KEY in .env file.";
    }
    if (error.message?.includes("400")) {
      return "📝 Invalid request format. This might be a temporary issue.";
    }
    return `❌ API Error: ${error.message || "Unknown error"}`;
  }

  /**
   * Generate monster data using OpenAI GPT-4
   */
  async generateMonsterData(locationContext: LocationContext): Promise<any> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    await this.waitForRateLimit();

    const { biome, weather, nearbyFeatures } = locationContext;

    const prompt = `Create detailed monster data for a creature found in ${biome} during ${
      weather.time
    } in ${weather.season}.

ENVIRONMENT CONTEXT:
- Location: ${biome} biome
- Weather: ${weather.condition}, ${weather.temperature}°C, ${
      weather.humidity
    }% humidity
- Features: ${nearbyFeatures.join(", ")}

Generate a JSON response with the following structure:
{
  "name": "Creative, unique monster name reflecting the environment - NEVER use generic names like 'Mysterious Creature', 'Unknown', or 'Wild Beast'. Make it memorable and specific to the ${biome} biome.",
  "description": "2-3 sentence description of the monster's appearance and behavior",
  "element": "Choose from: fire, water, earth, air, shadow, light, ice, lightning",
  "power": "Number between 10-100 based on rarity and environment danger",
  "age": "Number between 1-1000 years",
  "size": "Choose from: tiny, small, medium, large, giant",
  "rarity": "Choose from: common, uncommon, rare, epic, legendary",
  "lore": "2-3 sentences about the monster's history, habitat, and role in its ecosystem"
}

Base the stats on:
- Biome danger level
- Weather intensity
- Time of day mystical factor

Ensure the monster feels authentic to its ${biome} environment.`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are a creative monster designer for a fantasy game. Always respond with valid JSON only, no additional text.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.8,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      console.log("📝 Raw OpenAI response:", content);

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(content);
        console.log("✅ Successfully parsed monster data:", parsed);
        return parsed;
      } catch (parseError) {
        console.warn("Failed to parse monster data as JSON, using fallback");
        return {
          name: "Mysterious Creature",
          description:
            content || "A fascinating creature with unique characteristics.",
          element: "earth",
          power: 50,
          age: Math.floor(Math.random() * 100) + 1,
          size: "medium",
          rarity: "common",
          lore:
            content || "This creature's origins remain shrouded in mystery.",
        };
      }
    } catch (error) {
      console.error(
        "OpenAI text generation failed:",
        this.handleApiError(error)
      );
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Generate a text description of what the monster image should look like
   */
  async generateMonsterImageDescription(
    locationContext: LocationContext
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    await this.waitForRateLimit();

    const { biome, weather, nearbyFeatures } = locationContext;

    const prompt = `Describe a monster that would live in a ${biome} biome during ${weather.condition} weather at ${weather.temperature}°C.

Please provide a detailed visual description focusing on:
- Physical appearance and size
- Colors and textures
- Unique features or abilities
- How it adapts to its environment

Keep the description concise but vivid.`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are a creative monster designer. Provide vivid visual descriptions.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.8,
            max_tokens: 500,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return (
        data.choices[0]?.message?.content ||
        "A mysterious creature with unique characteristics."
      );
    } catch (error) {
      console.error(
        "OpenAI description generation failed:",
        this.handleApiError(error)
      );
      return "A fascinating creature with unique characteristics.";
    }
  }
}

export const textGenerationService = new TextGenerationService();
