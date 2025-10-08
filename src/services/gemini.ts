import { GoogleGenAI } from "@google/genai";
import { LocationContext } from "@/types";
import {
  buildMonsterImagePrompt,
  buildMonsterDataPrompt,
} from "@/utils/promptBuilder";

export class GeminiService {
  private client: GoogleGenAI;
  private apiKey: string;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
  private readonly MAX_REQUESTS_PER_MINUTE = 15; // Conservative limit

  constructor() {
    this.apiKey = import.meta.env?.VITE_GEMINI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("Gemini API key not found in environment variables");
    }
    this.client = new GoogleGenAI({ apiKey: this.apiKey });
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
      return "🚫 API quota exceeded. Please wait or check your billing settings at https://aistudio.google.com/";
    }
    if (error.message?.includes("403")) {
      return "🔑 Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.";
    }
    if (error.message?.includes("400")) {
      return "📝 Invalid request format. This might be a temporary issue.";
    }
    return `❌ API Error: ${error.message || "Unknown error"}`;
  }

  /**
   * Test the Gemini API connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.waitForRateLimit();
      const result = await this.generateText("Hello", true); // Simple request
      return result.length > 0;
    } catch (error) {
      console.error(
        "Gemini API health check failed:",
        this.handleApiError(error)
      );
      return false;
    }
  }

  /**
   * Generate text using Gemini 2.5 Flash (text-only model)
   */
  async generateText(
    prompt: string,
    isHealthCheck: boolean = false
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    if (!isHealthCheck) {
      await this.waitForRateLimit();
    }

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: isHealthCheck ? 50 : 1000, // Shorter for health checks
          topP: 0.8,
        },
      });

      return response.text || "";
    } catch (error) {
      console.error("Text generation failed:", this.handleApiError(error));
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Generate monster image using Gemini 2.5 Flash Image Preview
   */
  async generateMonsterImage(
    locationContext: LocationContext
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    await this.waitForRateLimit();

    const imagePrompt = buildMonsterImagePrompt(locationContext);

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: `Generate an image of: ${imagePrompt}

Style: Low-poly 3D game art, vibrant colors, fantasy creature design, clean geometric shapes, mobile game aesthetic.
Output: Single monster creature image, centered, FULL IMAGE without any circular masks, frames, or borders. The entire creature should be visible in a rectangular format suitable for a card game.`,
        config: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          topP: 0.9,
        },
      });

      // Check if the response contains image data
      console.log(
        "🔍 Full Gemini response:",
        JSON.stringify(response, null, 2)
      );

      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        console.log("🔍 Candidate:", JSON.stringify(candidate, null, 2));

        if (candidate.content && candidate.content.parts) {
          console.log("🔍 Parts found:", candidate.content.parts.length);

          for (const part of candidate.content.parts) {
            console.log("🔍 Part:", JSON.stringify(part, null, 2));

            // Look for inline data (images)
            if (part.inlineData && part.inlineData.data) {
              const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              console.log("✅ Found image data!");
              console.log("🖼️ MIME type:", part.inlineData.mimeType);
              console.log("🖼️ Base64 length:", part.inlineData.data.length);
              console.log(
                "🖼️ Base64 preview:",
                part.inlineData.data.substring(0, 100)
              );
              console.log("🖼️ Full data URL length:", imageData.length);
              console.log("🖼️ Data URL preview:", imageData.substring(0, 100));

              // 🔧 Additional validation for debugging
              console.log("🧪 Testing image data URL validity...");
              try {
                // Test if it's a valid data URL
                const isValidDataURL =
                  imageData.startsWith("data:image/") &&
                  imageData.includes(";base64,");
                console.log("✅ Valid data URL format:", isValidDataURL);

                // Test base64 decoding
                const base64Data = part.inlineData.data;
                const decodedLength = atob(base64Data).length;
                console.log("✅ Base64 decodes to bytes:", decodedLength);

                console.log("🎯 FINAL IMAGE URL:", imageData);
              } catch (testError) {
                console.error("❌ Image data validation failed:", testError);
              }

              return imageData;
            }
          }
        }
      }

      // If no image data found, log and return empty
      console.log("📝 No image data in response, got text:", response.text);
      console.log("📝 Response structure:", Object.keys(response));
      return "";
    } catch (error) {
      console.error("Image generation failed:", this.handleApiError(error));
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Generate a text description of what the monster image should look like
   */
  async generateMonsterImageDescription(
    locationContext: LocationContext
  ): Promise<string> {
    const imagePrompt = buildMonsterImagePrompt(locationContext);
    const fullPrompt = `Describe a monster that would live in this environment: ${imagePrompt}

Please provide a detailed visual description focusing on:
- Physical appearance and size
- Colors and textures
- Unique features or abilities
- How it adapts to its environment

Keep the description concise but vivid.`;

    return this.generateText(fullPrompt);
  }

  /**
   * Generate structured monster data (stats, lore, etc.)
   */
  async generateMonsterData(
    locationContext: LocationContext,
    imageDescription?: string
  ): Promise<any> {
    const dataPrompt = buildMonsterDataPrompt(
      locationContext,
      imageDescription
    );

    try {
      const response = await this.generateText(dataPrompt);

      // Try to parse as JSON
      try {
        return JSON.parse(response);
      } catch {
        // If JSON parsing fails, return a default structure
        console.warn("Failed to parse monster data as JSON, using fallback");
        return {
          name: "Mysterious Creature",
          description:
            response || "A fascinating creature with unique characteristics.",
          element: "earth",
          power: 50,
          age: Math.floor(Math.random() * 100) + 1,
          size: "medium",
          rarity: "common",
          lore:
            response || "This creature's origins remain shrouded in mystery.",
        };
      }
    } catch (error) {
      console.error("Monster data generation failed:", error);
      throw error;
    }
  }

  /**
   * Generate only the monster image (text generation handled separately)
   */
  async generateMonsterImageOnly(
    locationContext: LocationContext
  ): Promise<string> {
    try {
      console.log("🤖 Starting image-only generation...");

      const imageUrl = await this.generateMonsterImage(locationContext);

      console.log(
        "🖼️ Image generation result:",
        imageUrl ? "✅ Success" : "❌ Failed"
      );

      return imageUrl;
    } catch (error) {
      console.error("Error generating monster image:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
