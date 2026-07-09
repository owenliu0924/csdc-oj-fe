"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { StatusBadge } from "@/components/oj/status-badge";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { utcToLocal } from "@/lib/time";
import {
  submissionMemoryFormat,
  submissionTimeFormat,
} from "@/lib/utils";
import { useUserStore } from "@/stores/user";
import { useWebsiteStore } from "@/stores/website";
import { Search } from "lucide-react";

type Submission = {
  id: string;
  problem: string;
  create_time: string;
  result: number;
  language: string;
  username: string;
  statistic_info?: { time_cost?: number; memory_cost?: number };
};

export default function StatusPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StatusPageInner />
    </Suspense>

  );
}

function StatusPageInner() {
  const t = useTranslations("m");
  const searchParams = useSearchParams();
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const website = useWebsiteStore((s) => s.website);

  const [list, setList] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [myself, setMyself] = useState(searchParams.get("myself") === "1");
  const [username, setUsername] = useState(searchParams.get("username") || "");
  const [problem, setProblem] = useState(searchParams.get("problem_id") || "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (myself) params.myself = "1";
      if (username) params.username = username;
      if (problem) params.problem_id = problem;
      if (!website.submission_list_show_all && !myself && !username && !problem) {

      }
      const res = await ojApi.getSubmissionList((page - 1) * limit, limit, params);
      const data = res.data.data as { results: Submission[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, myself, username, problem, website.submission_list_show_all]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <GlassPanel
      title={t("Submissions")}
      extra={
        <div className="flex flex-wrap items-center gap-2">
          {isAuth() && (
            <label className="flex items-center gap-2 text-xs text-muted">
              <Switch checked={myself} onCheckedChange={(v) => { setMyself(v); setPage(1); }} />
              {t("Mine")}
            </label>

          )}
          <Input
            className="w-32"
            placeholder={t("Search_Author")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          />
          <Input
            className="w-28"
            placeholder={t("ProblemID")}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          />
          <Button variant="secondary" size="sm" onClick={() => { setPage(1); load(); }}>
            <Search className="h-3.5 w-3.5" />
          </Button>

        </div>

      }
    >
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="pb-3 pr-3 font-medium">{t("When")}</th>

                <th className="pb-3 pr-3 font-medium">{t("ID")}</th>

                <th className="pb-3 pr-3 font-medium">{t("Status")}</th>

                <th className="pb-3 pr-3 font-medium">{t("ProblemID")}</th>

                <th className="pb-3 pr-3 font-medium">{t("Time")}</th>

                <th className="pb-3 pr-3 font-medium">{t("Memory")}</th>

                <th className="pb-3 pr-3 font-medium">{t("Lang")}</th>

                <th className="pb-3 font-medium">{t("Author")}</th>

              </tr>

            </thead>

            <tbody>
              {list.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="py-3 pr-3 text-muted whitespace-nowrap">
                    {utcToLocal(s.create_time)}
                  </td>

                  <td className="py-3 pr-3">
                    <Link href={`/status/${s.id}`} className="font-mono text-xs hover:text-white">
                      {s.id.slice(0, 12)}…
                    </Link>

                  </td>

                  <td className="py-3 pr-3">
                    <Link href={`/status/${s.id}`}>
                      <StatusBadge status={s.result} />
                    </Link>

                  </td>

                  <td className="py-3 pr-3">
                    <Link href={`/problem/${s.problem}`} className="hover:text-white">
                      {s.problem}
                    </Link>

                  </td>

                  <td className="py-3 pr-3 text-muted">
                    {submissionTimeFormat(s.statistic_info?.time_cost)}
                  </td>

                  <td className="py-3 pr-3 text-muted">
                    {submissionMemoryFormat(s.statistic_info?.memory_cost)}
                  </td>

                  <td className="py-3 pr-3">{s.language}</td>

                  <td className="py-3">
                    <Link href={`/user-home?username=${s.username}`} className="hover:text-white">
                      {s.username}
                    </Link>

                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        </div>

      )}
      <Pagination
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
      />
    </GlassPanel>

  );
}
