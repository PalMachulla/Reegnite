/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_USERNAME: string;
  readonly VITE_AUTH_PASSWORD: string;
  readonly VITE_GEMINI_API_KEY: string;

  readonly VITE_MONSTER_SPAWN_RADIUS: string;
  readonly VITE_CAPTURE_DIFFICULTY: string;
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
