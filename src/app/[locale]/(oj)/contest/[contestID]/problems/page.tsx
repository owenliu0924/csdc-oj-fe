"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import { Link } from "@/i18n/navigation";
import { useContestStore } from "@/stores/contest";
import { useUserStore } from "@/stores/user";
import { getACRate } from "@/lib/utils";

type Problem = {
  id: number;
  _id: string;
  title: string;
  submission_number: number;
  accepted_number: number;
  my_status?: number;
};

export default function ContestProblemsPage({
  params,
}: {
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const loadProblems = useContestStore((s) => s.loadProblems);
  const problems = useContestStore((s) => s.contestProblems) as Problem[];
  const profile = useUserStore((s) => s.profile);
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadProblems(contestID).finally(() => setLoading(false));
  }, [contestID, loadProblems]);

  const statusOf = (id: string) => {
    if (!isAuth()) return null;
    return profile.acm_problems_status?.problems?.[id]?.status ??
      profile.oi_problems_status?.problems?.[id]?.status ??
      null;
  };

  if (loading) return <Loading />;

  return (
    <GlassPanel title={t("Problems_List")}>
      {problems.length === 0 ? (
        <EmptyState message={t("No_Problems")} />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="pb-3 pr-3 w-16">#</th>

              <th className="pb-3 pr-3">{t("Title") || "Title"}</th>

              <th className="pb-3 pr-3 w-20">{t("Total")}</th>

              <th className="pb-3 w-24">{t("AC_Rate")}</th>

            </tr>

          </thead>

          <tbody>
            {problems.map((p) => {
              const st = p.my_status ?? statusOf(p._id);
              return (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td
                    className={`py-3 pr-3 ${
                      st === 0
                        ? "text-[var(--success)]"
                        : st != null
                          ? "text-amber-400"
                          : ""
                    }`}
                  >
                    {p._id}
                  </td>

                  <td className="py-3 pr-3">
                    <Link
                      href={`/contest/${contestID}/problem/${p._id}`}
                      className="font-medium hover:text-white"
                    >
                      {p.title}
                    </Link>

                  </td>

                  <td className="py-3 pr-3 text-muted">{p.submission_number}</td>

                  <td className="py-3 text-muted">
                    {getACRate(p.accepted_number, p.submission_number)}
                  </td>

                </tr>

              );
            })}
          </tbody>

        </table>

      )}
    </GlassPanel>

  );
}
