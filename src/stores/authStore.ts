import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthCredentials, Player } from "@/types";

interface AuthState {
  isAuthenticated: boolean;
  player: Player | null;
  token: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  logout: () => void;
  updatePlayerPosition: (lat: number, lng: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      player: null,
      token: null,

      login: async (credentials: AuthCredentials) => {
        try {
          // Simple authentication using environment variables
          const envUsername = import.meta.env?.VITE_AUTH_USERNAME || "admin";
          const envPassword = import.meta.env?.VITE_AUTH_PASSWORD || "password";

          if (
            credentials.username === envUsername &&
            credentials.password === envPassword
          ) {
            const mockPlayer: Player = {
              id: `player_${Date.now()}`,
              username: credentials.username,
              position: { lat: 0, lng: 0 },
              collectedMonsters: [],
              isAuthenticated: true,
            };

            const mockToken = `token_${Date.now()}`;

            set({
              isAuthenticated: true,
              player: mockPlayer,
              token: mockToken,
            });

            return true;
          }

          return false;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          player: null,
          token: null,
        });
      },

      updatePlayerPosition: (lat: number, lng: number) => {
        const { player } = get();
        if (player) {
          set({
            player: {
              ...player,
              position: { lat, lng },
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        player: state.player,
        token: state.token,
      }),
    }
  )
);
