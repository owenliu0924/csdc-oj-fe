"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";

type RankUser = {
  user: { id: number; username: string };
  mood?: string;
  total_score: number;
  submission_number: number;
};

export default function OIRankPage() {
  const t = useTranslations("m");
  const [list, setList] = useState<RankUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ojApi.getUserRank((page - 1) * limit, limit, "oi");
      const data = res.data.data as { results: RankUser[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <GlassPanel title={t("OI_Ranklist")}>
      {loading ? (
        <Loading />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-3 pr-3 w-12">#</th>

              <th className="pb-3 pr-3">{t("Username")}</th>

              <th className="pb-3 pr-3">{t("mood")}</th>

              <th className="pb-3 pr-3">{t("Score")}</th>

              <th className="pb-3">{t("Total")}</th>

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

                <td className="py-3 pr-3 text-white/70">{r.total_score}</td>

                <td className="py-3 text-muted">{r.submission_number}</td>

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

  );
}
