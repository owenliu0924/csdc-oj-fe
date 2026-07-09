"use client";

import { useEffect } from "react";
import {
  applyAppearanceToDocument,
  useAppearanceStore,
} from "@/stores/appearance";

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const bgBrightness = useAppearanceStore((s) => s.bgBrightness);
  const bgBlur = useAppearanceStore((s) => s.bgBlur);
  const glassBlur = useAppearanceStore((s) => s.glassBlur);
  const glassTint = useAppearanceStore((s) => s.glassTint);
  const glassMode = useAppearanceStore((s) => s.glassMode);

  useEffect(() => {
    applyAppearanceToDocument({
      bgBrightness,
      bgBlur,
      glassBlur,
      glassTint,
      glassMode,
    });
  }, [bgBrightness, bgBlur, glassBlur, glassTint, glassMode]);

  useEffect(() => {
    const unsub = useAppearanceStore.persist.onFinishHydration(() => {
      applyAppearanceToDocument(useAppearanceStore.getState());
    });
    if (useAppearanceStore.persist.hasHydrated()) {
      applyAppearanceToDocument(useAppearanceStore.getState());
    }
    return unsub;
  }, []);

  return <>{children}</>;

}
