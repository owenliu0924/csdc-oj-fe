"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import {
  RankEChart,
  breakLongWords,
  useRankChartTheme,
  type EChartsOption,
} from "@/components/oj/rank-echart-dynamic";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { getACRate } from "@/lib/utils";

type RankUser = {
  user: { id: number; username: string };
  mood?: string;
  total_score: number;
  accepted_number?: number;
  submission_number: number;
};

export default function OIRankPage() {
  const t = useTranslations("m");
  const theme = useRankChartTheme();
  const [list, setList] = useState<RankUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [top10, setTop10] = useState<RankUser[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    if (page === 1) setChartLoading(true);
    try {
      const res = await ojApi.getUserRank((page - 1) * limit, limit, "oi");
      const data = res.data.data as { results: RankUser[]; total: number };
      const results = data.results || [];
      setList(results);
      setTotal(data.total || 0);
      if (page === 1) setTop10(results.slice(0, 10));
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const option = useMemo<EChartsOption>(() => {
    const usernames = top10.map((r) => r.user.username);
    const scores = top10.map((r) => r.total_score);
    return {
      backgroundColor: "transparent",
      color: [theme.pink],
      textStyle: { color: theme.text },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text },
      },
      legend: {
        data: [t("Score")],
        textStyle: { color: theme.muted },
        top: 4,
      },
      toolbox: {
        show: true,
        right: "4%",
        top: 0,
        iconStyle: { borderColor: theme.muted },
        emphasis: { iconStyle: { borderColor: theme.pink } },
        feature: {
          dataView: {
            show: true,
            readOnly: true,
            title: "Data",
            backgroundColor: theme.tooltipBg,
            textareaColor: theme.isLight ? "#fff" : "#121018",
            textareaBorderColor: theme.tooltipBorder,
            textColor: theme.text,
            buttonColor: theme.pink,
            buttonTextColor: "#1a0a12",
          },
          magicType: {
            show: true,
            type: ["line", "bar"],
            title: { line: "Line", bar: "Bar" },
          },
          restore: { show: true, title: "Reset" },
          saveAsImage: {
            show: true,
            title: t("save_as_image") || "Save",
            backgroundColor: theme.isLight ? "#f0eef2" : "#0c0a10",
            pixelRatio: 2,
          },
          dataZoom: {
            show: true,
            title: { zoom: "Zoom", back: "Back" },
          },
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: 48,
        top: 56,
        containLabel: true,
      },
      dataZoom: [
        { type: "inside", xAxisIndex: 0, filterMode: "none" },
        {
          type: "slider",
          xAxisIndex: 0,
          height: 18,
          bottom: 8,
          borderColor: theme.axisLine,
          fillerColor: "rgba(232,168,184,0.18)",
          handleStyle: { color: theme.pink },
          textStyle: { color: theme.muted },
        },
      ],
      xAxis: [
        {
          type: "category",
          data: usernames,
          boundaryGap: true,
          axisLabel: {
            color: theme.muted,
            interval: 0,
            formatter: (v: string) => breakLongWords(v, 12),
          },
          axisLine: { lineStyle: { color: theme.axisLine } },
          axisTick: { alignWithLabel: true },
        },
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: { color: theme.muted },
          splitLine: { lineStyle: { color: theme.split } },
          axisLine: { show: false },
        },
      ],
      series: [
        {
          name: t("Score"),
          type: "bar",
          data: scores,
          barMaxWidth: 80,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          markPoint: {
            data: [{ type: "max", name: "max" }],
            label: { color: "#1a0a12" },
            itemStyle: { color: theme.pink },
          },
        },
      ],
    };
  }, [t, theme, top10]);

  return (
    <div className="space-y-4">
      <GlassPanel title={t("OI_Ranklist")}>
        <RankEChart option={option} height={400} loading={chartLoading} />
      </GlassPanel>

      <GlassPanel title={t("OI_Ranklist")}>
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="w-12 pb-3 pr-3">#</th>
                <th className="pb-3 pr-3">{t("Username")}</th>
                <th className="pb-3 pr-3">{t("mood")}</th>
                <th className="pb-3 pr-3">{t("Score")}</th>
                <th className="pb-3 pr-3">{t("AC")}</th>
                <th className="pb-3 pr-3">{t("Total")}</th>
                <th className="pb-3">{t("Rating")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.user.id} className="border-b border-white/5">
                  <td className="py-3 pr-3 text-muted">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="py-3 pr-3">
                    <Link
                      href={`/user-home?username=${r.user.username}`}
                      className="font-medium hover:text-white"
                    >
                      {r.user.username}
                    </Link>
                  </td>
                  <td className="py-3 pr-3 text-muted">{r.mood || "—"}</td>
                  <td className="py-3 pr-3 text-[var(--pink-bright)]">
                    {r.total_score}
                  </td>
                  <td className="py-3 pr-3 text-[var(--success)]">
                    {r.accepted_number ?? "—"}
                  </td>
                  <td className="py-3 pr-3 text-muted">
                    {r.submission_number}
                  </td>
                  <td className="py-3 text-muted">
                    {getACRate(r.accepted_number ?? 0, r.submission_number)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          total={total}
          page={page}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setLimit(s);
            setPage(1);
          }}
        />
      </GlassPanel>
    </div>
  );
}
