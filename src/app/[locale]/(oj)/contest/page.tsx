"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/oj/pagination";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { CONTEST_STATUS, CONTEST_STATUS_REVERSE, RULE_TYPE } from "@/lib/constants";
import { duration, utcToLocal } from "@/lib/time";
import { Calendar, Clock, Lock, Trophy } from "lucide-react";

type Contest = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  rule_type: string;
  status: string;
  contest_type: string;
};

export default function ContestListPage() {
  const t = useTranslations("m");
  const [list, setList] = useState<Contest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [rule, setRule] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (status) params.status = status;
      if (rule) params.rule_type = rule;
      const res = await ojApi.getContestList((page - 1) * limit, limit, params);
      const data = res.data.data as { results: Contest[]; total: number };
      setList(data.results || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, rule]);

  useEffect(() => {
    load();
  }, [load]);

  const statusVariant = (s: string) => {
    if (s === CONTEST_STATUS.UNDERWAY) return "success" as const;
    if (s === CONTEST_STATUS.NOT_START) return "warning" as const;
    return "danger" as const;
  };

  return (
    <GlassPanel
      title={t("Contests")}
      extra={
        <>
          {[
            { v: "", l: t("All") },
            { v: CONTEST_STATUS.UNDERWAY, l: t("Underway") },
            { v: CONTEST_STATUS.NOT_START, l: t("Not_Started") },
            { v: CONTEST_STATUS.ENDED, l: t("Ended") },
          ].map((o) => (
            <Button
              key={o.v || "all"}
              size="sm"
              className="shrink-0"
              variant={status === o.v ? "default" : "secondary"}
              onClick={() => {
                setStatus(o.v);
                setPage(1);
              }}
            >
              {o.l}
            </Button>
          ))}
          {[
            { v: "", l: t("All") },
            { v: RULE_TYPE.ACM, l: t("ACM") },
            { v: RULE_TYPE.OI, l: t("OI") },
          ].map((o) => (
            <Button
              key={`r-${o.v || "all"}`}
              size="sm"
              className="shrink-0"
              variant={rule === o.v ? "default" : "outline"}
              onClick={() => {
                setRule(o.v);
                setPage(1);
              }}
            >
              {o.l}
            </Button>
          ))}
        </>
      }
    >
      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState message={t("No_contest")} />
      ) : (
        <ul className="space-y-2">
          {list.map((c) => {
            const st =
              CONTEST_STATUS_REVERSE[c.status] || {
                name: c.status,
                color: "blue",
              };
            return (
              <li key={c.id}>
                <Link
                  href={`/contest/${c.id}`}
                  className="glass-row flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {c.contest_type !== "Public" && (
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      {c.title}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {utcToLocal(c.start_time, "YYYY-M-D HH:mm")}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {duration(c.start_time, c.end_time)}
                      </span>

                    </div>

                  </div>

                  <div className="flex gap-2">
                    <Badge variant="info">
                      <Trophy className="mr-1 h-3 w-3" />
                      {c.rule_type}
                    </Badge>

                    <Badge variant={statusVariant(c.status)}>
                      {st.name === "Underway"
                        ? t("Underway")
                        : st.name === "Not Started"
                          ? t("Not_Started")
                          : t("Ended")}
                    </Badge>

                  </div>

                </Link>

              </li>

            );
          })}
        </ul>

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
