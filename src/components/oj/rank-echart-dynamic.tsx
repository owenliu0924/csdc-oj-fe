"use client";

import dynamic from "next/dynamic";
import { Loading } from "@/components/oj/loading";

export {
  useRankChartTheme,
  breakLongWords,
  rankChartColors,
  rankTooltipStyle,
} from "@/components/oj/rank-chart-theme";

/** Avoid importing echarts/core from this module graph for types. */
export type EChartsOption = Record<string, unknown>;

/** Client-only ECharts — keeps heavy lib out of the Cloudflare Worker bundle. */
export const RankEChart = dynamic(
  () => import("@/components/oj/rank-echart").then((m) => m.RankEChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[200px] items-center justify-center">
        <Loading className="py-8" />
      </div>
    ),
  }
);
