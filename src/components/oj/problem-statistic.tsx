"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { EChartsOption } from "echarts";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RankEChart, useRankChartTheme } from "@/components/oj/rank-echart";
import { JUDGE_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERED_STATUS = ["-1", "-2", "0", "1", "2", "3", "4", "8"] as const;

const TONE: Record<
  string,
  { fill: string; soft: string; label: string }
> = {
  AC: {
    fill: "rgba(93, 206, 160, 0.92)",
    soft: "rgba(93, 206, 160, 0.14)",
    label: "text-[var(--success)]",
  },
  WA: {
    fill: "rgba(240, 140, 160, 0.9)",
    soft: "rgba(240, 140, 160, 0.12)",
    label: "text-[var(--danger)]",
  },
  TLE: {
    fill: "rgba(232, 184, 109, 0.92)",
    soft: "rgba(232, 184, 109, 0.14)",
    label: "text-[var(--warning)]",
  },
  MLE: {
    fill: "rgba(240, 200, 140, 0.9)",
    soft: "rgba(240, 200, 140, 0.12)",
    label: "text-[var(--warning)]",
  },
  RE: {
    fill: "rgba(232, 150, 140, 0.9)",
    soft: "rgba(232, 150, 140, 0.12)",
    label: "text-[var(--danger)]",
  },
  CE: {
    fill: "rgba(170, 168, 188, 0.88)",
    soft: "rgba(170, 168, 188, 0.12)",
    label: "text-[var(--muted)]",
  },
  PAC: {
    fill: "rgba(168, 190, 255, 0.92)",
    soft: "rgba(168, 190, 255, 0.14)",
    label: "text-[var(--info)]",
  },
};

type Slice = { name: string; value: number };

type Props = {
  statisticInfo?: Record<string, number>;
  acceptedNumber?: number;
  submissionNumber?: number;
};

export function ProblemStatistic({
  statisticInfo,
  acceptedNumber = 0,
  submissionNumber = 0,
}: Props) {
  const t = useTranslations("m");
  const theme = useRankChartTheme();
  const [detailOpen, setDetailOpen] = useState(false);

  const stats = useMemo(() => {
    const raw: Record<string, number> = { ...(statisticInfo || {}) };
    for (const k of Object.keys(raw)) {
      if (!(FILTERED_STATUS as readonly string[]).includes(k)) {
        delete raw[k];
      }
    }
    const acNum = acceptedNumber || raw["0"] || 0;
    const total = submissionNumber || 0;
    const nonAc = Math.max(0, total - acNum);
    const rate = total === 0 ? 0 : (acNum / total) * 100;

    const summary: Slice[] = [
      { name: "AC", value: acNum },
      { name: "WA", value: nonAc },
    ];

    const detail: Slice[] = [];
    const acCount = raw["0"] ?? acNum;
    const withoutAc = { ...raw };
    delete withoutAc["0"];
    Object.keys(withoutAc).forEach((key) => {
      const short = JUDGE_STATUS[key]?.short;
      if (short) detail.push({ name: short, value: withoutAc[key] });
    });
    if (acCount > 0 || detail.length === 0) {
      detail.unshift({ name: "AC", value: acCount });
    }
    detail.sort((a, b) => b.value - a.value);

    return { summary, detail, total, acNum, nonAc, rate };
  }, [acceptedNumber, statisticInfo, submissionNumber]);

  const donutOption = useMemo<EChartsOption>(() => {
    const data = stats.summary
      .filter((d) => d.value > 0)
      .map((d) => ({
        name: d.name,
        value: d.value,
        itemStyle: {
          color: TONE[d.name]?.fill || "rgba(232,168,184,0.85)",
          borderRadius: 6,
          borderColor: theme.isLight
            ? "rgba(255,255,255,0.75)"
            : "rgba(18,14,22,0.65)",
          borderWidth: 2,
        },
      }));

    const empty =
      data.length === 0
        ? [
            {
              name: "—",
              value: 1,
              itemStyle: {
                color: theme.isLight
                  ? "rgba(26,21,32,0.08)"
                  : "rgba(255,255,255,0.06)",
                borderWidth: 0,
              },
              tooltip: { show: false },
              label: { show: false },
            },
          ]
        : data;

    return {
      backgroundColor: "transparent",
      animationDuration: 600,
      tooltip: {
        show: data.length > 0,
        trigger: "item",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text, fontSize: 12 },
        formatter: "{b} · {c} ({d}%)",
        extraCssText:
          "backdrop-filter:blur(12px);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.28);",
      },
      series: [
        {
          type: "pie",
          radius: ["62%", "84%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          padAngle: 2,
          data: empty,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 4,
            itemStyle: {
              shadowBlur: 16,
              shadowColor: "rgba(232,168,184,0.25)",
            },
          },
        },
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "42%",
          style: {
            text: stats.total === 0 ? "—" : `${stats.rate.toFixed(0)}%`,
            fill: theme.isLight ? "#1a1520" : "#f5f0f4",
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "inherit",
            align: "center",
          },
        },
        {
          type: "text",
          left: "center",
          top: "56%",
          style: {
            text: "AC rate",
            fill: theme.muted,
            fontSize: 11,
            fontFamily: "inherit",
            align: "center",
          },
        },
      ],
    };
  }, [stats, theme]);

  const detailDonut = useMemo<EChartsOption>(() => {
    const data = stats.detail
      .filter((d) => d.value > 0)
      .map((d) => ({
        name: d.name,
        value: d.value,
        itemStyle: {
          color: TONE[d.name]?.fill || "rgba(232,168,184,0.85)",
          borderRadius: 5,
          borderColor: theme.isLight
            ? "rgba(255,255,255,0.8)"
            : "rgba(18,14,22,0.7)",
          borderWidth: 2,
        },
      }));

    return {
      backgroundColor: "transparent",
      animationDuration: 500,
      tooltip: {
        trigger: "item",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text, fontSize: 12 },
        formatter: "{b} · {c} ({d}%)",
        extraCssText:
          "backdrop-filter:blur(12px);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.28);",
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "72%"],
          center: ["50%", "50%"],
          padAngle: 2,
          data:
            data.length > 0
              ? data
              : [
                  {
                    name: "—",
                    value: 1,
                    itemStyle: {
                      color: "rgba(255,255,255,0.06)",
                    },
                  },
                ],
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            scaleSize: 5,
            itemStyle: {
              shadowBlur: 18,
              shadowColor: "rgba(232,168,184,0.28)",
            },
          },
        },
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "44%",
          style: {
            text:
              stats.total === 0 ? "—" : `${stats.rate.toFixed(1)}%`,
            fill: theme.isLight ? "#1a1520" : "#f5f0f4",
            fontSize: 26,
            fontWeight: 600,
            align: "center",
          },
        },
        {
          type: "text",
          left: "center",
          top: "56%",
          style: {
            text: `${stats.acNum} AC / ${stats.total}`,
            fill: theme.muted,
            fontSize: 12,
            align: "center",
          },
        },
      ],
    };
  }, [stats, theme]);

  return (
    <>
      <GlassCard className="!p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium tracking-tight">{t("Statistic")}</h3>
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="rounded-lg px-2 py-1 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--pink-soft)] hover:text-[var(--pink-bright)]"
          >
            Details
          </button>
        </div>

        <RankEChart option={donutOption} height={168} />
      </GlassCard>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[min(400px,calc(100vw-2rem))] gap-4">
          <DialogHeader>
            <DialogTitle className="text-base font-medium tracking-tight">
              {t("Statistic")}
            </DialogTitle>
          </DialogHeader>

          <RankEChart option={detailDonut} height={220} />

          <ul className="space-y-2">
            {(stats.detail.filter((d) => d.value > 0).length
              ? stats.detail.filter((d) => d.value > 0)
              : stats.summary
            ).map((row) => {
              const tone = TONE[row.name] || TONE.CE;
              const pct =
                stats.total > 0 ? (row.value / stats.total) * 100 : 0;
              return (
                <li key={row.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: tone.fill }}
                      />
                      <span className="font-medium text-foreground">
                        {row.name}
                      </span>
                    </span>
                    <span className="tabular-nums text-[var(--muted)]">
                      {row.value}
                      <span className="ml-1.5 text-[var(--faint)]">
                        {pct.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${Math.max(pct, row.value > 0 ? 2 : 0)}%`,
                        background: tone.fill,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDetailOpen(false)}
            >
              {t("Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatPill({
  name,
  value,
  tone,
}: {
  name: string;
  value: number;
  tone: { fill: string; soft: string; label: string };
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] px-2.5 py-2",
        "bg-white/[0.03]"
      )}
      style={{ background: tone.soft }}
    >
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: tone.fill }}
        />
        {name}
      </div>
      <div
        className={cn(
          "mt-0.5 text-base font-semibold tabular-nums tracking-tight",
          tone.label
        )}
      >
        {value}
      </div>
    </div>
  );
}
