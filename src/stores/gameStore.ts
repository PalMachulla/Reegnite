import { create } from "zustand";
import { GameState, MonsterSpawn } from "@/types";

interface GameStore extends GameState {
  setCurrentView: (view: GameState["currentView"]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNearbyMonster: (monster: MonsterSpawn) => void;
  removeNearbyMonster: (monsterId: string) => void;
  clearNearbyMonsters: () => void;
  setCaptureInProgress: (inProgress: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  isLoading: false,
  currentView: "splash",
  nearbyMonsters: [],
  captureInProgress: false,
  error: null,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  addNearbyMonster: (monster) => {
    const { nearbyMonsters } = get();
    const exists = nearbyMonsters.find((m) => m.id === monster.id);
    if (!exists) {
      set({ nearbyMonsters: [...nearbyMonsters, monster] });
    }
  },

  removeNearbyMonster: (monsterId) => {
    const { nearbyMonsters } = get();
    set({
      nearbyMonsters: nearbyMonsters.filter((m) => m.id !== monsterId),
    });
  },

  clearNearbyMonsters: () => set({ nearbyMonsters: [] }),

  setCaptureInProgress: (inProgress) => set({ captureInProgress: inProgress }),
}));
