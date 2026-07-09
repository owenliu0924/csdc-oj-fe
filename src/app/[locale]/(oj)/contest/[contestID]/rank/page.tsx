"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { EChartsOption } from "echarts";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/oj/loading";
import { Pagination } from "@/components/oj/pagination";
import {
  RankEChart,
  breakLongWords,
  useRankChartTheme,
} from "@/components/oj/rank-echart";
import { Link } from "@/i18n/navigation";
import { useContestStore } from "@/stores/contest";
import ojApi from "@/lib/api/oj";
import { dayjs, secondFormat } from "@/lib/time";
import { cn, downloadBlob } from "@/lib/utils";
import { CONTEST_STATUS } from "@/lib/constants";
import { RefreshCw, Download } from "lucide-react";

type SubInfo = {
  is_ac?: boolean;
  is_first_ac?: boolean;
  ac_time?: number;
  error_number?: number;
  score?: number;
};

type RankRow = {
  user: { id: number; username: string; real_name?: string };
  submission_number: number;
  accepted_number?: number;
  total_time?: number;
  total_score?: number;
  submission_info?: Record<string, SubInfo>;
};

type Problem = { id: number; _id: string };

function cellClass(info?: SubInfo) {
  if (!info) return "";
  if (info.is_first_ac) return "bg-[rgba(51,204,153,0.35)] text-[#9ef0c8]";
  if (info.is_ac) return "bg-[rgba(93,206,160,0.22)] text-[var(--success)]";
  return "bg-[rgba(240,113,120,0.18)] text-[var(--danger)]";
}

export default function ContestRankPage({
  params,
}: {
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const theme = useRankChartTheme();
  const contest = useContestStore((s) => s.contest);
  const problems = useContestStore((s) => s.contestProblems) as Problem[];
  const loadProblems = useContestStore((s) => s.loadProblems);
  const itemVisible = useContestStore((s) => s.itemVisible);
  const setItemVisible = useContestStore((s) => s.setItemVisible);
  const rankLimit = useContestStore((s) => s.rankLimit);
  const setRankLimit = useContestStore((s) => s.setRankLimit);
  const forceUpdate = useContestStore((s) => s.forceUpdate);
  const setForceUpdate = useContestStore((s) => s.setForceUpdate);
  const isACM = contest.rule_type === "ACM";
  const contestEnded = contest.status === CONTEST_STATUS.ENDED;

  const [rows, setRows] = useState<RankRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [top10, setTop10] = useState<RankRow[]>([]);

  const load = useCallback(
    async (opts?: { silent?: boolean; pageOverride?: number }) => {
      if (!opts?.silent) setLoading(true);
      const p = opts?.pageOverride ?? page;
      if (p === 1 && !opts?.silent) setChartLoading(true);
      try {
        if (!problems.length) await loadProblems(contestID);
        const res = await ojApi.getContestRank({
          contest_id: contestID,
          offset: (p - 1) * rankLimit,
          limit: rankLimit,
          force_refresh: forceUpdate ? "1" : "0",
        });
        const data = res.data.data as
          | RankRow[]
          | { results: RankRow[]; total?: number };
        const list = Array.isArray(data) ? data : data.results || [];
        const tot = Array.isArray(data)
          ? list.length
          : data.total ?? list.length;
        setRows(list);
        setTotal(tot);
        if (p === 1) setTop10(list.slice(0, 10));
      } finally {
        setLoading(false);
        setChartLoading(false);
        setForceUpdate(false);
      }
    },
    [
      contestID,
      forceUpdate,
      loadProblems,
      page,
      problems.length,
      rankLimit,
      setForceUpdate,
    ]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh || contestEnded) return;
    const id = setInterval(() => load({ silent: true, pageOverride: 1 }), 10000);
    return () => clearInterval(id);
  }, [autoRefresh, contestEnded, load]);

  const chartOption = useMemo<EChartsOption>(() => {
    if (isACM) {
      const users = top10.map((r) => r.user.username);
      const series = top10.map((rank, i) => {
        const info = rank.submission_info || {};
        const timeData = Object.values(info)
          .filter((s) => s.is_ac && typeof s.ac_time === "number")
          .map((s) => s.ac_time as number)
          .sort((a, b) => a - b);
        const data: [string, number][] = [];
        if (contest.start_time) {
          data.push([dayjs(contest.start_time).format(), 0]);
        }
        timeData.forEach((sec, index) => {
          const realTime = contest.start_time
            ? dayjs(contest.start_time).add(sec, "second").format()
            : dayjs().add(sec, "second").format();
          data.push([realTime, index + 1]);
        });
        return {
          name: rank.user.username,
          type: "line" as const,
          step: "end" as const,
          showSymbol: false,
          smooth: false,
          lineStyle: { width: 2 },
          itemStyle: {
            color: theme.palette[i % theme.palette.length],
          },
          data,
        };
      });

      return {
        backgroundColor: "transparent",
        color: theme.palette,
        textStyle: { color: theme.text },
        title: {
          text: t("Top_10_Teams"),
          left: "center",
          top: 4,
          textStyle: { color: theme.text, fontSize: 14, fontWeight: 500 },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross", axis: "x" },
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          textStyle: { color: theme.text },
        },
        legend: {
          type: "scroll",
          orient: "vertical",
          right: 4,
          top: "middle",
          data: users,
          textStyle: { color: theme.muted, fontSize: 11 },
          formatter: (v: string) => breakLongWords(v, 14),
          pageIconColor: theme.pink,
          pageTextStyle: { color: theme.muted },
        },
        toolbox: {
          show: true,
          right: "8%",
          top: 4,
          iconStyle: { borderColor: theme.muted },
          emphasis: { iconStyle: { borderColor: theme.pink } },
          feature: {
            dataZoom: {
              show: true,
              title: { zoom: "Zoom", back: "Back" },
              yAxisIndex: "none",
            },
            restore: { show: true, title: "Reset" },
            saveAsImage: {
              show: true,
              title: t("save_as_image") || "Save",
              backgroundColor: theme.isLight ? "#f0eef2" : "#0c0a10",
              pixelRatio: 2,
            },
          },
        },
        grid: {
          left: 56,
          right: 140,
          top: 48,
          bottom: 56,
          containLabel: false,
        },
        dataZoom: [
          {
            type: "inside",
            filterMode: "none",
            xAxisIndex: [0],
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
            moveOnMouseWheel: false,
          },
          {
            type: "slider",
            xAxisIndex: [0],
            height: 18,
            bottom: 10,
            borderColor: theme.axisLine,
            fillerColor: "rgba(232,168,184,0.18)",
            handleStyle: { color: theme.pink },
            textStyle: { color: theme.muted },
          },
        ],
        xAxis: [
          {
            type: "time",
            splitLine: { show: false },
            axisLabel: { color: theme.muted },
            axisLine: { lineStyle: { color: theme.axisLine } },
            axisPointer: { show: true, snap: true },
          },
        ],
        yAxis: [
          {
            type: "value",
            minInterval: 1,
            axisLabel: { color: theme.muted },
            splitLine: { lineStyle: { color: theme.split } },
            name: t("AC"),
            nameTextStyle: { color: theme.muted },
          },
        ],
        series,
      };
    }

    const usernames = top10.map((r) => r.user.username);
    const scores = top10.map((r) => r.total_score ?? 0);
    return {
      backgroundColor: "transparent",
      color: [theme.pink],
      textStyle: { color: theme.text },
      title: {
        text: t("Top_10_Teams"),
        left: "center",
        top: 4,
        textStyle: { color: theme.text, fontSize: 14, fontWeight: 500 },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text },
      },
      toolbox: {
        show: true,
        right: "4%",
        top: 4,
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
        },
      ],
      series: [
        {
          name: t("Score"),
          type: "bar",
          barMaxWidth: 80,
          data: scores,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          markPoint: {
            data: [{ type: "max", name: "max" }],
            label: { color: "#1a0a12" },
            itemStyle: { color: theme.pink },
          },
        },
      ],
    };
  }, [contest.start_time, isACM, t, theme, top10]);

  const downloadCsv = async () => {
    try {
      const res = await ojApi.getContestRank({
        contest_id: contestID,
        download_csv: "1",
        force_refresh: forceUpdate ? "1" : "0",
      });
      const raw = res.data;
      if (raw instanceof Blob) {
        downloadBlob(raw, `contest-${contestID}-rank.csv`);
        return;
      }
    } catch {
      /* client fallback */
    }
    const headers = [
      "Rank",
      "Username",
      isACM ? "AC" : "Score",
      isACM ? "Time" : "Submissions",
    ];
    const lines = [headers.join(",")];
    rows.forEach((r, i) => {
      lines.push(
        [
          (page - 1) * rankLimit + i + 1,
          r.user.username,
          isACM ? r.accepted_number : r.total_score,
          isACM ? r.total_time : r.submission_number,
        ].join(",")
      );
    });
    downloadBlob(
      new Blob([lines.join("\n")], { type: "text/csv" }),
      `contest-${contestID}-rank.csv`
    );
  };

  return (
    <div className="space-y-4">
      {itemVisible.menu && (
        <GlassPanel title={t("Menu")}>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <Switch
                checked={itemVisible.chart}
                onCheckedChange={(v) => setItemVisible({ chart: v })}
              />
              {t("Chart")}
            </label>
            <label className="flex items-center gap-2">
              <Switch
                checked={itemVisible.realName}
                onCheckedChange={(v) => setItemVisible({ realName: v })}
              />
              {t("RealName")}
            </label>
            <label className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                disabled={contestEnded}
                onCheckedChange={setAutoRefresh}
              />
              {t("Auto_Refresh")} (10s)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted">Limit</span>
              <Input
                type="number"
                className="w-20"
                value={rankLimit}
                onChange={(e) => {
                  setRankLimit(Number(e.target.value) || 30);
                  setPage(1);
                }}
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={contestEnded}
              onClick={() => {
                setForceUpdate(true);
                load({ pageOverride: page });
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("Force_Update")}
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCsv}>
              <Download className="h-3.5 w-3.5" />
              {t("download_csv")}
            </Button>
          </div>
        </GlassPanel>
      )}

      {itemVisible.chart && (
        <GlassPanel>
          <RankEChart
            option={chartOption}
            height={420}
            loading={chartLoading && top10.length === 0}
          />
        </GlassPanel>
      )}

      <GlassPanel title={contest.title || t("Rankings")}>
        {loading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted">
                  <th className="pb-3 pr-2">#</th>
                  <th className="pb-3 pr-2">{t("Username")}</th>
                  {itemVisible.realName && (
                    <th className="pb-3 pr-2">{t("RealName")}</th>
                  )}
                  {isACM ? (
                    <>
                      <th className="pb-3 pr-2 whitespace-nowrap">
                        {t("AC")} / {t("Total")}
                      </th>
                      <th className="pb-3 pr-2">{t("TotalTime")}</th>
                    </>
                  ) : (
                    <th className="pb-3 pr-2">{t("Total_Score")}</th>
                  )}
                  {problems.map((p) => (
                    <th key={p.id} className="pb-3 pr-2 text-center">
                      <Link
                        href={`/contest/${contestID}/problem/${p._id}`}
                        className="hover:text-[var(--pink-bright)]"
                      >
                        {p._id}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.user.id} className="border-b border-white/5">
                    <td className="py-2 pr-2 text-muted">
                      {(page - 1) * rankLimit + i + 1}
                    </td>
                    <td className="py-2 pr-2 font-medium">
                      <Link
                        href={`/user-home?username=${r.user.username}`}
                        className="hover:text-white"
                      >
                        {r.user.username}
                      </Link>
                    </td>
                    {itemVisible.realName && (
                      <td className="py-2 pr-2 text-muted">
                        {r.user.real_name || "—"}
                      </td>
                    )}
                    {isACM ? (
                      <>
                        <td className="py-2 pr-2 whitespace-nowrap">
                          <span className="text-[var(--success)]">
                            {r.accepted_number ?? 0}
                          </span>
                          <span className="text-muted"> / </span>
                          <Link
                            href={`/contest/${contestID}/submissions?username=${r.user.username}`}
                            className="hover:text-white"
                          >
                            {r.submission_number}
                          </Link>
                        </td>
                        <td className="py-2 pr-2 font-mono text-xs">
                          {secondFormat(r.total_time || 0)}
                        </td>
                      </>
                    ) : (
                      <td className="py-2 pr-2">
                        <Link
                          href={`/contest/${contestID}/submissions?username=${r.user.username}`}
                          className="text-[var(--pink-bright)] hover:underline"
                        >
                          {r.total_score}
                        </Link>
                      </td>
                    )}
                    {problems.map((p) => {
                      const info = r.submission_info?.[String(p.id)];
                      if (!info) {
                        return (
                          <td
                            key={p.id}
                            className="py-2 pr-2 text-center text-muted"
                          >
                            ·
                          </td>
                        );
                      }
                      if (isACM) {
                        return (
                          <td
                            key={p.id}
                            className={cn(
                              "py-2 pr-2 text-center text-xs font-mono",
                              cellClass(info)
                            )}
                          >
                            {info.is_ac ? (
                              <>
                                <div>{secondFormat(info.ac_time || 0)}</div>
                                {(info.error_number ?? 0) > 0 && (
                                  <div className="opacity-80">
                                    (-{info.error_number})
                                  </div>
                                )}
                              </>
                            ) : (
                              <span>(-{info.error_number || 0})</span>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={p.id}
                          className="py-2 pr-2 text-center text-xs text-white/80"
                        >
                          {info.score ?? 0}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          total={total}
          page={page}
          pageSize={rankLimit}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setRankLimit(s);
            setPage(1);
          }}
        />
      </GlassPanel>
    </div>
  );
}
