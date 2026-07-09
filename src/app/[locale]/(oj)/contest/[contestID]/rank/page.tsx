"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/oj/loading";
import { useContestStore } from "@/stores/contest";
import ojApi from "@/lib/api/oj";
import { secondFormat } from "@/lib/time";
import { downloadBlob } from "@/lib/utils";
import { RefreshCw, Download } from "lucide-react";

type RankRow = {
  user: { id: number; username: string; real_name?: string };
  submission_number: number;
  accepted_number?: number;
  total_time?: number;
  total_score?: number;
  submission_info?: Record<
    string,
    { is_ac?: boolean; ac_time?: number; error_number?: number; score?: number }
  >;
};

export default function ContestRankPage({
  params,
}: {
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const contest = useContestStore((s) => s.contest);
  const problems = useContestStore((s) => s.contestProblems) as {
    id: number;
    _id: string;
  }[];
  const loadProblems = useContestStore((s) => s.loadProblems);
  const itemVisible = useContestStore((s) => s.itemVisible);
  const setItemVisible = useContestStore((s) => s.setItemVisible);
  const rankLimit = useContestStore((s) => s.rankLimit);
  const setRankLimit = useContestStore((s) => s.setRankLimit);
  const forceUpdate = useContestStore((s) => s.forceUpdate);
  const setForceUpdate = useContestStore((s) => s.setForceUpdate);
  const isACM = contest.rule_type === "ACM";

  const [rows, setRows] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!problems.length) await loadProblems(contestID);
      const res = await ojApi.getContestRank({
        contest_id: contestID,
        force_refresh: forceUpdate ? "1" : undefined,
      });
      const data = res.data.data as RankRow[] | { results: RankRow[] };
      const list = Array.isArray(data) ? data : data.results || [];
      setRows(list);
    } finally {
      setLoading(false);
      setForceUpdate(false);
    }
  }, [contestID, forceUpdate, loadProblems, problems.length, setForceUpdate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const limited = rows.slice(0, rankLimit);
  const chartData = limited.slice(0, 10).map((r) => ({
    name: r.user.username,
    value: isACM ? r.accepted_number || 0 : r.total_score || 0,
  }));

  const downloadCsv = () => {
    const headers = ["Rank", "Username", isACM ? "AC" : "Score", isACM ? "Time" : "Submissions"];
    const lines = [headers.join(",")];
    limited.forEach((r, i) => {
      lines.push(
        [
          i + 1,
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
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              {t("Auto_Refresh")}
            </label>

            <div className="flex items-center gap-2">
              <span className="text-muted">Limit</span>

              <Input
                type="number"
                className="w-20"
                value={rankLimit}
                onChange={(e) => setRankLimit(Number(e.target.value) || 30)}
              />
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setForceUpdate(true);
                load();
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

      {itemVisible.chart && chartData.length > 0 && (
        <GlassPanel title={t("Top_10_Teams")}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#9b9ba8" fontSize={11} />
                <YAxis stroke="#9b9ba8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#12121a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" fill="var(--pink)" fillOpacity={0.85} radius={[2, 2, 0, 0]} />
              </BarChart>

            </ResponsiveContainer>

          </div>

        </GlassPanel>

      )}

      <GlassPanel title={t("Rankings")}>
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
                      <th className="pb-3 pr-2">{t("AC")}</th>

                      <th className="pb-3 pr-2">{t("TotalTime")}</th>

                    </>

                  ) : (
                    <th className="pb-3 pr-2">{t("Total_Score")}</th>

                  )}
                  {problems.map((p) => (
                    <th key={p.id} className="pb-3 pr-2 text-center">
                      {p._id}
                    </th>

                  ))}
                </tr>

              </thead>

              <tbody>
                {limited.map((r, i) => (
                  <tr key={r.user.id} className="border-b border-white/5">
                    <td className="py-2 pr-2">{i + 1}</td>

                    <td className="py-2 pr-2 font-medium">{r.user.username}</td>

                    {itemVisible.realName && (
                      <td className="py-2 pr-2 text-muted">
                        {r.user.real_name || "—"}
                      </td>

                    )}
                    {isACM ? (
                      <>
                        <td className="py-2 pr-2 text-[var(--success)]">
                          {r.accepted_number}
                        </td>

                        <td className="py-2 pr-2 font-mono text-xs">
                          {secondFormat(r.total_time || 0)}
                        </td>

                      </>

                    ) : (
                      <td className="py-2 pr-2 text-white/70">
                        {r.total_score}
                      </td>

                    )}
                    {problems.map((p) => {
                      const info = r.submission_info?.[String(p.id)];
                      if (!info)
                        return (
                          <td key={p.id} className="py-2 pr-2 text-center text-muted">
                            ·
                          </td>

                        );
                      if (isACM) {
                        return (
                          <td
                            key={p.id}
                            className={`py-2 pr-2 text-center text-xs font-mono ${
                              info.is_ac ? "text-[var(--success)]" : "text-[var(--danger)]"
                            }`}
                          >
                            {info.is_ac
                              ? secondFormat(info.ac_time || 0)
                              : `-${info.error_number || 0}`}
                            {info.is_ac && info.error_number
                              ? `(-${info.error_number})`
                              : ""}
                          </td>

                        );
                      }
                      return (
                        <td
                          key={p.id}
                          className="py-2 pr-2 text-center text-xs text-white/70"
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
      </GlassPanel>

    </div>

  );
}
