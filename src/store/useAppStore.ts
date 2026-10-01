"use client";
import { create } from "zustand";

export type UserRole = "admin" | "dam_operator" | "government_officer" | "citizen";

interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AppState {
  user: AppUser | null;
  activeModule: string;
  selectedDamId: number | null;
  isDarkMode: boolean;
  language: string;
  notifications: Array<{ id: string; message: string; level: string; timestamp: Date }>;
  setUser: (user: AppUser | null) => void;
  setActiveModule: (module: string) => void;
  setSelectedDamId: (id: number | null) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  addNotification: (notification: { message: string; level: string }) => void;
  clearNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  activeModule: "dashboard",
  selectedDamId: null,
  isDarkMode: false,
  language: "en",
  notifications: [],
  setUser: (user) => set({ user }),
  setActiveModule: (module) => set({ activeModule: module }),
  setSelectedDamId: (id) => set({ selectedDamId: id }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLanguage: (language) => set({ language }),
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        { id: Math.random().toString(36).slice(2), ...n, timestamp: new Date() },
        ...state.notifications.slice(0, 9),
      ],
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
