"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserProfile = {
  id: string;
  email: string;
};

type UserStore = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      resetUser: () => set({ user: null })
    }),
    {
      name: "aerodesk-user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user })
    }
  )
);
