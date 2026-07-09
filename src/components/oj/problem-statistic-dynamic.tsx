"use client";

import dynamic from "next/dynamic";
import { GlassCard } from "@/components/glass/glass-card";

export const ProblemStatistic = dynamic(
  () =>
    import("@/components/oj/problem-statistic").then((m) => m.ProblemStatistic),
  {
    ssr: false,
    loading: () => (
      <GlassCard className="!p-4">
        <div className="h-[220px] animate-pulse rounded-xl bg-white/[0.04]" />
      </GlassCard>
    ),
  }
);
