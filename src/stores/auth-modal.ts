"use client";

import { create } from "zustand";

type Mode = "login" | "register";

type AuthModalState = {
  visible: boolean;
  mode: Mode;
  open: (mode?: Mode) => void;
  close: () => void;
  setMode: (mode: Mode) => void;
};

export const useAuthModalStore = create<AuthModalState>((set) => ({
  visible: false,
  mode: "login",
  open: (mode = "login") => set({ visible: true, mode }),
  close: () => set({ visible: false }),
  setMode: (mode) => set({ mode }),
}));
