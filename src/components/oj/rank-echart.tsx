"use client";

import { useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  DataZoomComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";
import { cn } from "@/lib/utils";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  GraphicComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

export type { EChartsCoreOption as EChartsOption };

type Props = {
  option: EChartsCoreOption | Record<string, unknown>;
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
  const ref = useRef<InstanceType<typeof ReactEChartsCore> | null>(null);

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
      <ReactEChartsCore
        ref={ref}
        echarts={echarts}
        option={option as EChartsCoreOption}
        notMerge
        lazyUpdate
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
