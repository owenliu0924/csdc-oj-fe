"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_BG_ID,
  DEFAULT_BG_URL,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_FROM,
  DEFAULT_GRADIENT_TO,
  DEFAULT_SOLID_COLOR,
  GRADIENT_BG_ID,
  MAX_UPLOADS,
  SOLID_BG_ID,
  UPLOAD_PREFIX,
  fileToBackgroundDataUrl,
  isCssBg,
  isHttpUrl,
  isUploadId,
  readBgCookie,
  resolveBgCss,
  resolveBgUrl,
  writeBgCookie,
  type UploadedBackground,
} from "@/lib/backgrounds";

export type AppearanceState = {
  bgBrightness: number;
  bgBlur: number;
  glassBlur: number;
  glassTint: number;
  glassMode: boolean;
  bgSelected: string;
  customBackgrounds: string[];
  uploadedBackgrounds: UploadedBackground[];
  bgSolidColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgGradientAngle: number;
  setBgBrightness: (v: number) => void;
  setBgBlur: (v: number) => void;
  setGlassBlur: (v: number) => void;
  setGlassTint: (v: number) => void;
  setGlassMode: (v: boolean) => void;
  setBgSelected: (idOrUrl: string) => void;
  setBgSolidColor: (v: string) => void;
  setBgGradientFrom: (v: string) => void;
  setBgGradientTo: (v: string) => void;
  setBgGradientAngle: (v: number) => void;
  addCustomBackground: (url: string) => boolean;
  removeCustomBackground: (url: string) => void;
  addUploadedBackground: (file: File) => Promise<{ ok: boolean; error?: string }>;
  removeUploadedBackground: (id: string) => void;
  reset: () => void;
};

const sliderDefaults = {
  bgBrightness: 75,
  bgBlur: 0,
  glassBlur: 5,
  glassTint: 22,
  glassMode: true,
  bgSolidColor: DEFAULT_SOLID_COLOR,
  bgGradientFrom: DEFAULT_GRADIENT_FROM,
  bgGradientTo: DEFAULT_GRADIENT_TO,
  bgGradientAngle: DEFAULT_GRADIENT_ANGLE,
};

function syncBgCookie(selected: string, custom: string[]) {
  writeBgCookie({ selected, custom });
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set, get) => ({
      ...sliderDefaults,
      bgSelected: DEFAULT_BG_ID,
      customBackgrounds: [],
      uploadedBackgrounds: [],
      setBgBrightness: (bgBrightness) => set({ bgBrightness }),
      setBgBlur: (bgBlur) => set({ bgBlur }),
      setGlassBlur: (glassBlur) => set({ glassBlur }),
      setGlassTint: (glassTint) => set({ glassTint }),
      setGlassMode: (glassMode) => set({ glassMode }),
      setBgSelected: (bgSelected) => {
        set({ bgSelected });
        syncBgCookie(bgSelected, get().customBackgrounds);
      },
      setBgSolidColor: (bgSolidColor) => {
        set({ bgSolidColor, bgSelected: SOLID_BG_ID });
        syncBgCookie(SOLID_BG_ID, get().customBackgrounds);
      },
      setBgGradientFrom: (bgGradientFrom) => {
        set({ bgGradientFrom, bgSelected: GRADIENT_BG_ID });
        syncBgCookie(GRADIENT_BG_ID, get().customBackgrounds);
      },
      setBgGradientTo: (bgGradientTo) => {
        set({ bgGradientTo, bgSelected: GRADIENT_BG_ID });
        syncBgCookie(GRADIENT_BG_ID, get().customBackgrounds);
      },
      setBgGradientAngle: (bgGradientAngle) => {
        set({ bgGradientAngle, bgSelected: GRADIENT_BG_ID });
        syncBgCookie(GRADIENT_BG_ID, get().customBackgrounds);
      },
      addCustomBackground: (raw) => {
        const url = raw.trim();
        if (!isHttpUrl(url)) return false;
        const { customBackgrounds } = get();
        if (customBackgrounds.includes(url)) {
          set({ bgSelected: url });
          syncBgCookie(url, customBackgrounds);
          return true;
        }
        const next = [...customBackgrounds, url].slice(-12);
        set({ customBackgrounds: next, bgSelected: url });
        syncBgCookie(url, next);
        return true;
      },
      removeCustomBackground: (url) => {
        const { customBackgrounds, bgSelected } = get();
        const next = customBackgrounds.filter((u) => u !== url);
        const nextSelected = bgSelected === url ? DEFAULT_BG_ID : bgSelected;
        set({ customBackgrounds: next, bgSelected: nextSelected });
        syncBgCookie(nextSelected, next);
      },
      addUploadedBackground: async (file) => {
        try {
          const dataUrl = await fileToBackgroundDataUrl(file);
          const id = `${UPLOAD_PREFIX}${Date.now()}`;
          const entry: UploadedBackground = {
            id,
            name: file.name || "upload",
            dataUrl,
          };
          const { uploadedBackgrounds } = get();
          const next = [...uploadedBackgrounds, entry].slice(-MAX_UPLOADS);
          set({ uploadedBackgrounds: next, bgSelected: id });
          syncBgCookie(id, get().customBackgrounds);
          return { ok: true };
        } catch (e) {
          const msg = e instanceof Error ? e.message : "failed";
          if (msg === "not-image") return { ok: false, error: "請選擇圖片檔" };
          if (msg === "too-large")
            return { ok: false, error: "圖片太大，請換較小的檔案" };
          return { ok: false, error: "上傳失敗" };
        }
      },
      removeUploadedBackground: (id) => {
        const { uploadedBackgrounds, bgSelected } = get();
        const next = uploadedBackgrounds.filter((u) => u.id !== id);
        const nextSelected = bgSelected === id ? DEFAULT_BG_ID : bgSelected;
        set({ uploadedBackgrounds: next, bgSelected: nextSelected });
        syncBgCookie(nextSelected, get().customBackgrounds);
      },
      reset: () => {
        const custom = get().customBackgrounds;
        const uploaded = get().uploadedBackgrounds;
        set({
          ...sliderDefaults,
          bgSelected: DEFAULT_BG_ID,
          customBackgrounds: custom,
          uploadedBackgrounds: uploaded,
        });
        syncBgCookie(DEFAULT_BG_ID, custom);
      },
    }),
    {
      name: "csdc-oj-appearance-v7",
      onRehydrateStorage: () => (state) => {
        if (!state || typeof document === "undefined") return;
        const cookie = readBgCookie();

        if (cookie.custom.length) {
          state.customBackgrounds = cookie.custom;
        }

        if (cookie.selected) {
          const isBuiltIn =
            cookie.selected === DEFAULT_BG_ID ||
            cookie.selected.startsWith("illust-") ||
            cookie.selected === "unsplash";
          const isCustom = cookie.custom.includes(cookie.selected);
          const isUpload =
            isUploadId(cookie.selected) &&
            state.uploadedBackgrounds.some((u) => u.id === cookie.selected);
          if (
            isBuiltIn ||
            isCustom ||
            isUpload ||
            isHttpUrl(cookie.selected) ||
            isCssBg(cookie.selected)
          ) {
            state.bgSelected = cookie.selected;
          }
        }
        syncBgCookie(state.bgSelected, state.customBackgrounds);
      },
    }
  )
);

export function getBgImageUrl(state: {
  bgSelected: string;
  customBackgrounds: string[];
  uploadedBackgrounds: UploadedBackground[];
}): string | null {
  return resolveBgUrl(
    state.bgSelected,
    state.customBackgrounds,
    state.uploadedBackgrounds
  );
}

export function getBgFillCss(state: {
  bgSelected: string;
  bgSolidColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgGradientAngle: number;
}): string | null {
  return resolveBgCss(state);
}

export function applyAppearanceToDocument(state: {
  bgBrightness: number;
  bgBlur: number;
  glassBlur: number;
  glassTint: number;
  glassMode: boolean;
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  const brightness = 0.35 + (state.bgBrightness / 100) * 0.8;
  root.style.setProperty("--user-bg-brightness", String(brightness));
  root.style.setProperty("--user-bg-blur", `${Math.max(0, state.bgBlur)}px`);
  root.style.setProperty(
    "--user-glass-blur",
    `${Math.max(0, state.glassBlur)}px`
  );

  const tint = Math.min(100, Math.max(0, state.glassTint)) / 100;
  const fillA = 0.14 + tint * 0.36;
  root.style.setProperty("--user-glass-alpha", fillA.toFixed(3));
  root.style.setProperty("--user-glass-veil", (0.03 + tint * 0.11).toFixed(3));

  root.classList.toggle("no-glass", !state.glassMode);
  root.classList.toggle("glass-mode", state.glassMode);
}
