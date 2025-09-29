import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Monster } from "@/types";

interface MonsterStore {
  collectedMonsters: Monster[];
  addMonster: (monster: Monster) => void;
  updateMonster: (monster: Monster) => void;
  removeMonster: (monsterId: string) => void;
  getMonsterById: (monsterId: string) => Monster | undefined;
  getMonstersByElement: (element: string) => Monster[];
  getTotalCount: () => number;
}

export const useMonsterStore = create<MonsterStore>()(
  persist(
    (set, get) => ({
      collectedMonsters: [],

      addMonster: (monster) => {
        console.log("🦄 MonsterStore: Adding monster:", monster);
        const { collectedMonsters } = get();
        console.log("🦄 MonsterStore: Current collection:", collectedMonsters);
        const exists = collectedMonsters.find((m) => m.id === monster.id);
        if (!exists) {
          const newCollection = [...collectedMonsters, monster];
          console.log("🦄 MonsterStore: New collection:", newCollection);
          set({
            collectedMonsters: newCollection,
          });
          console.log("🦄 MonsterStore: Monster added successfully!");
        } else {
          console.log("🦄 MonsterStore: Monster already exists, not adding");
        }
      },

      updateMonster: (monster) => {
        console.log("🔄 MonsterStore: Updating monster:", monster);
        const { collectedMonsters } = get();
        const updatedCollection = collectedMonsters.map((m) =>
          m.id === monster.id ? monster : m
        );
        console.log("🔄 MonsterStore: Updated collection:", updatedCollection);
        set({
          collectedMonsters: updatedCollection,
        });
        console.log("🔄 MonsterStore: Monster updated successfully!");
      },

      removeMonster: (monsterId) => {
        const { collectedMonsters } = get();
        set({
          collectedMonsters: collectedMonsters.filter(
            (m) => m.id !== monsterId
          ),
        });
      },

      getMonsterById: (monsterId) => {
        const { collectedMonsters } = get();
        return collectedMonsters.find((m) => m.id === monsterId);
      },

      getMonstersByElement: (element) => {
        const { collectedMonsters } = get();
        return collectedMonsters.filter((m) => m.element === element);
      },

      getTotalCount: () => {
        const { collectedMonsters } = get();
        return collectedMonsters.length;
      },
    }),
    {
      name: "monster-storage",
    }
  )
);
