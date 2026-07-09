"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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

export default function ContestSubmissionsPage({
  params,
}: {
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const [list, setList] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [myself, setMyself] = useState(false);
  const [username, setUsername] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { contest_id: contestID };
      if (myself) params.myself = "1";
      if (username) params.username = username;
      const res = await ojApi.getContestSubmissionList(
        (page - 1) * limit,
        limit,
        params
      );
      const data = res.data.data as { results: Submission[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [contestID, page, limit, myself, username]);

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
                <th className="pb-3 pr-3">{t("When")}</th>

                <th className="pb-3 pr-3">{t("ID")}</th>

                <th className="pb-3 pr-3">{t("Status")}</th>

                <th className="pb-3 pr-3">{t("ProblemID")}</th>

                <th className="pb-3 pr-3">{t("Time")}</th>

                <th className="pb-3 pr-3">{t("Memory")}</th>

                <th className="pb-3 pr-3">{t("Lang")}</th>

                <th className="pb-3">{t("Author")}</th>

              </tr>

            </thead>

            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="py-3 pr-3 text-muted whitespace-nowrap">
                    {utcToLocal(s.create_time)}
                  </td>

                  <td className="py-3 pr-3">
                    <Link href={`/status/${s.id}`} className="font-mono text-xs hover:text-white">
                      {s.id.slice(0, 12)}…
                    </Link>

                  </td>

                  <td className="py-3 pr-3">
                    <StatusBadge status={s.result} />
                  </td>

                  <td className="py-3 pr-3">{s.problem}</td>

                  <td className="py-3 pr-3 text-muted">
                    {submissionTimeFormat(s.statistic_info?.time_cost)}
                  </td>

                  <td className="py-3 pr-3 text-muted">
                    {submissionMemoryFormat(s.statistic_info?.memory_cost)}
                  </td>

                  <td className="py-3 pr-3">{s.language}</td>

                  <td className="py-3">{s.username}</td>

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
