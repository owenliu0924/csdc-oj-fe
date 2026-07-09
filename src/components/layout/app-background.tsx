"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BG_URL } from "@/lib/backgrounds";
import {
  getBgFillCss,
  getBgImageUrl,
  useAppearanceStore,
} from "@/stores/appearance";

export function AppBackground() {
  const bgSelected = useAppearanceStore((s) => s.bgSelected);
  const customBackgrounds = useAppearanceStore((s) => s.customBackgrounds);
  const uploadedBackgrounds = useAppearanceStore((s) => s.uploadedBackgrounds);
  const bgSolidColor = useAppearanceStore((s) => s.bgSolidColor);
  const bgGradientFrom = useAppearanceStore((s) => s.bgGradientFrom);
  const bgGradientTo = useAppearanceStore((s) => s.bgGradientTo);
  const bgGradientAngle = useAppearanceStore((s) => s.bgGradientAngle);

  const [src, setSrc] = useState<string | null>(DEFAULT_BG_URL);
  const [fill, setFill] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const sync = () => {
    const state = useAppearanceStore.getState();
    const css = getBgFillCss(state);
    if (css) {
      setFill(css);
      setSrc(null);
      setFailed(false);
      return;
    }
    setFill(null);
    setSrc(
      getBgImageUrl({
        bgSelected: state.bgSelected,
        customBackgrounds: state.customBackgrounds,
        uploadedBackgrounds: state.uploadedBackgrounds,
      }) || DEFAULT_BG_URL
    );
    setFailed(false);
  };

  useEffect(() => {
    sync();
  }, [
    bgSelected,
    customBackgrounds,
    uploadedBackgrounds,
    bgSolidColor,
    bgGradientFrom,
    bgGradientTo,
    bgGradientAngle,
  ]);

  useEffect(() => {
    const unsub = useAppearanceStore.persist.onFinishHydration(() => {
      sync();
    });
    if (useAppearanceStore.persist.hasHydrated()) {
      sync();
    }
    return unsub;
  }, []);

  return (
    <div className="app-bg" aria-hidden>
      {fill ? (
        <div
          className="app-bg__fill"
          style={{ background: fill }}
        />
      ) : (
        <img
          src={failed ? DEFAULT_BG_URL : src || DEFAULT_BG_URL}
          alt=""
          className="app-bg__image"
          onError={() => setFailed(true)}
        />
      )}
      <div className="app-bg__overlay" />
    </div>
  );
}
