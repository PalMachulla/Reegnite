import { MonsterSpawn, LocationContext, BiomeType } from "@/types";

interface SpawnConfig {
  maxMonsters: number;
  spawnRadius: number; // in meters
  spawnInterval: number; // in milliseconds
  despawnTime: number; // in milliseconds
}

class MonsterSpawningService {
  private defaultConfig: SpawnConfig = {
    maxMonsters: 5,
    spawnRadius: 100, // 100 meters
    spawnInterval: 30000, // 30 seconds
    despawnTime: 300000, // 5 minutes
  };

  private activeSpawns: MonsterSpawn[] = [];
  private lastSpawnTime = 0;

  /**
   * Generate monsters near the player's location
   */
  generateNearbyMonsters(
    playerLat: number,
    playerLng: number,
    locationContext: LocationContext,
    config: Partial<SpawnConfig> = {}
  ): MonsterSpawn[] {
    const finalConfig = { ...this.defaultConfig, ...config };
    const currentTime = Date.now();

    // Remove expired monsters
    this.activeSpawns = this.activeSpawns.filter(
      (spawn) =>
        currentTime - spawn.spawnedAt.getTime() < finalConfig.despawnTime
    );

    // Check if we should spawn new monsters
    const shouldSpawn =
      this.activeSpawns.length < finalConfig.maxMonsters &&
      currentTime - this.lastSpawnTime > finalConfig.spawnInterval;

    if (shouldSpawn) {
      const newMonster = this.createMonsterSpawn(
        playerLat,
        playerLng,
        locationContext,
        finalConfig.spawnRadius
      );

      if (newMonster) {
        this.activeSpawns.push(newMonster);
        this.lastSpawnTime = currentTime;
      }
    }

    return [...this.activeSpawns];
  }

  /**
   * Create a single monster spawn
   */
  private createMonsterSpawn(
    centerLat: number,
    centerLng: number,
    locationContext: LocationContext,
    radiusMeters: number
  ): MonsterSpawn | null {
    try {
      // Generate random position within radius
      const position = this.generateRandomPositionInRadius(
        centerLat,
        centerLng,
        radiusMeters
      );

      // Determine biome (could be different from player's exact location)
      const biome = this.determineBiomeForPosition(position, locationContext);

      const monster: MonsterSpawn = {
        id: `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position,
        biome,
        spawnedAt: new Date(),
        captured: false,
      };

      return monster;
    } catch (error) {
      console.error("Failed to create monster spawn:", error);
      return null;
    }
  }

  /**
   * Generate random position within a radius (in meters)
   */
  private generateRandomPositionInRadius(
    centerLat: number,
    centerLng: number,
    radiusMeters: number
  ): { lat: number; lng: number } {
    // Convert radius from meters to approximate degrees
    // 1 degree ≈ 111,000 meters at equator
    const radiusDegrees = radiusMeters / 111000;

    // Generate random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusDegrees;

    // Calculate new position
    const deltaLat = distance * Math.cos(angle);
    const deltaLng =
      (distance * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);

    return {
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng,
    };
  }

  /**
   * Determine biome for a specific position
   */
  private determineBiomeForPosition(
    position: { lat: number; lng: number },
    locationContext: LocationContext
  ): BiomeType {
    // For now, use the same biome as the location context
    // In a more advanced implementation, you could:
    // - Check if position is near water features
    // - Analyze micro-environments
    // - Use more detailed geographic data

    // Add some randomness for variety
    const sameAsBiome = Math.random() > 0.2; // 80% chance same biome

    if (sameAsBiome) {
      return locationContext.biome;
    }

    // Pick a related biome
    const relatedBiomes = this.getRelatedBiomes(locationContext.biome);
    return (
      relatedBiomes[Math.floor(Math.random() * relatedBiomes.length)] ||
      locationContext.biome
    );
  }

  /**
   * Get biomes that could appear near the given biome
   */
  private getRelatedBiomes(biome: BiomeType): BiomeType[] {
    const biomeRelations: Record<BiomeType, BiomeType[]> = {
      mountain: ["tundra", "forest", "plains"],
      forest: ["mountain", "plains", "river", "lake"],
      coast: ["urban", "plains"],
      urban: ["coast", "plains", "river"],
      desert: ["plains"],
      lake: ["forest", "plains", "river"],
      river: ["forest", "plains", "lake"],
      plains: ["forest", "mountain", "urban", "desert"],
      swamp: ["forest", "river", "lake"],
      tundra: ["mountain"],
    };

    return biomeRelations[biome] || [biome];
  }

  /**
   * Remove a monster spawn (when captured)
   */
  removeMonster(monsterId: string): void {
    this.activeSpawns = this.activeSpawns.filter(
      (spawn) => spawn.id !== monsterId
    );
  }

  /**
   * Clear all active spawns
   */
  clearAllSpawns(): void {
    this.activeSpawns = [];
  }

  /**
   * Get current spawn statistics
   */
  getSpawnStats() {
    return {
      activeCount: this.activeSpawns.length,
      oldestSpawn:
        this.activeSpawns.length > 0
          ? Math.min(...this.activeSpawns.map((s) => s.spawnedAt.getTime()))
          : null,
      newestSpawn:
        this.activeSpawns.length > 0
          ? Math.max(...this.activeSpawns.map((s) => s.spawnedAt.getTime()))
          : null,
    };
  }

  /**
   * Force spawn a monster for testing
   */
  forceSpawnMonster(
    playerLat: number,
    playerLng: number,
    locationContext: LocationContext
  ): MonsterSpawn | null {
    const monster = this.createMonsterSpawn(
      playerLat,
      playerLng,
      locationContext,
      this.defaultConfig.spawnRadius
    );

    if (monster) {
      this.activeSpawns.push(monster);
    }

    return monster;
  }
}

export const monsterSpawningService = new MonsterSpawningService();
export default monsterSpawningService;
