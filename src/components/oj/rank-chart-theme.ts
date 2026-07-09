"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

export const rankChartColors = {
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.45)",
  pink: "#e89ab8",
  pinkSoft: "rgba(232,168,184,0.75)",
  blue: "#8eb4ff",
  blueSoft: "rgba(142,180,255,0.75)",
  green: "#5dcea0",
  tooltipBg: "rgba(22,18,28,0.96)",
  tooltipBorder: "rgba(255,255,255,0.12)",
  tooltipText: "#f5f0f4",
  series: [
    "#e89ab8",
    "#8eb4ff",
    "#5dcea0",
    "#e8b86d",
    "#c4a0ff",
    "#f07178",
    "#7dd3c0",
    "#f0c674",
    "#81a1c1",
    "#d08770",
  ],
};

export const rankTooltipStyle = {
  background: rankChartColors.tooltipBg,
  border: `1px solid ${rankChartColors.tooltipBorder}`,
  borderRadius: 12,
  color: rankChartColors.tooltipText,
  fontSize: 12,
  boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
};

const seriesPalette = rankChartColors.series;

export function useRankChartTheme() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  return useMemo(
    () => ({
      isLight,
      text: isLight ? "#1a1520" : "rgba(255,255,255,0.78)",
      muted: isLight ? "rgba(26,21,32,0.5)" : "rgba(255,255,255,0.45)",
      split: isLight ? "rgba(26,21,32,0.08)" : "rgba(255,255,255,0.06)",
      axisLine: isLight ? "rgba(26,21,32,0.15)" : "rgba(255,255,255,0.12)",
      tooltipBg: isLight ? "rgba(255,255,255,0.96)" : "rgba(22,18,28,0.96)",
      tooltipBorder: isLight
        ? "rgba(26,21,32,0.12)"
        : "rgba(255,255,255,0.12)",
      pink: "#e89ab8",
      blue: "#8eb4ff",
      palette: seriesPalette,
    }),
    [isLight]
  );
}

export function breakLongWords(value: string, max = 12): string {
  if (!value || value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}
