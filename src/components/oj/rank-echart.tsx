"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const seriesPalette = [
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
];

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

type Props = {
  option: EChartsOption;
  className?: string;
  height?: number | string;
  loading?: boolean;
};

export function RankEChart({
  option,
  className,
  height = 400,
  loading,
}: Props) {
  const ref = useRef<ReactECharts>(null);

  useEffect(() => {
    const onResize = () => {
      ref.current?.getEchartsInstance()?.resize();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const inst = ref.current?.getEchartsInstance();
    if (!inst) return;
    if (loading) {
      inst.showLoading("default", {
        text: "",
        color: "#e89ab8",
        maskColor: "rgba(12,10,16,0.45)",
        zlevel: 0,
      });
    } else {
      inst.hideLoading();
    }
  }, [loading]);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ReactECharts
        ref={ref}
        option={option}
        notMerge
        lazyUpdate
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}

export function breakLongWords(value: string, max = 12): string {
  if (!value || value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}
