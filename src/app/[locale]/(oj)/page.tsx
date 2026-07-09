"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { GlassPanel } from "@/components/glass/glass-card";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { CONTEST_STATUS } from "@/lib/constants";
import { duration, utcToLocal } from "@/lib/time";
import { Calendar, Clock, Trophy, RefreshCw } from "lucide-react";
import { HtmlContent } from "@/components/editor/markdown-view";
import { springSoft } from "@/lib/motion";

type Announcement = {
  id: number;
  title: string;
  content: string;
  create_time: string;
  created_by: { username: string };
};

type Contest = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  rule_type: string;
};

export default function HomePage() {
  const t = useTranslations("m");
  const [contests, setContests] = useState<Contest[]>([]);
  const [index, setIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadAnnouncements = async (p = page) => {
    const res = await ojApi.getAnnouncementList((p - 1) * limit, limit);
    const data = res.data.data as { results: Announcement[]; total: number };
    setAnnouncements(data.results || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cRes] = await Promise.all([
          ojApi.getContestList(0, 5, { status: CONTEST_STATUS.NOT_START }),
          loadAnnouncements(1),
        ]);
        const cData = cRes.data.data as { results: Contest[] };
        setContests(cData.results || []);
      } catch {

      } finally {
        setLoading(false);
      }
    })();

  }, []);

  useEffect(() => {
    if (contests.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % contests.length);
    }, 6000);
    return () => clearInterval(id);
  }, [contests.length]);

  if (loading) return <Loading />;

  const contest = contests[index];

  return (
    <div className="space-y-6">
      {contest && (
        <GlassPanel
          title={
            <Link
              href={`/contest/${contest.id}`}
              className="hover:text-white transition-colors"
            >
              {contest.title}
            </Link>

          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={springSoft}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="info" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {utcToLocal(contest.start_time, "YYYY-M-D HH:mm")}
                </Badge>

                <Badge variant="success" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {duration(contest.start_time, contest.end_time)}
                </Badge>

                <Badge variant="warning" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {contest.rule_type}
                </Badge>

              </div>

              <HtmlContent html={contest.description} />
            </motion.div>

          </AnimatePresence>

          {contests.length > 1 && (
            <div className="mt-4 flex justify-center gap-1.5">
              {contests.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="relative h-1.5 w-6 overflow-hidden rounded-full bg-white/15"
                >
                  {i === index && (
                    <motion.span
                      layoutId="contest-dot"
                      className="absolute inset-0 rounded-full bg-[var(--pink)]"
                      transition={springSoft}
                    />
                  )}
                </button>

              ))}
            </div>

          )}
        </GlassPanel>

      )}

      <GlassPanel
        title={t("Announcements")}
        extra={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadAnnouncements(page)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

        }
      >
        {announcements.length === 0 ? (
          <EmptyState message={t("No_Announcements")} />
        ) : (
          <ul className="divide-y divide-white/5">
            {announcements.map((a) => (
              <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium">{a.title}</h3>

                  <span className="text-xs text-muted">
                    {t("By")} {a.created_by?.username} ·{" "}
                    {utcToLocal(a.create_time)}
                  </span>

                </div>

                <HtmlContent html={a.content} className="mt-2 text-sm" />
              </li>

            ))}
          </ul>

        )}
        {total > limit && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                loadAnnouncements(p);
              }}
            >
              {t("Back")}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={page * limit >= total}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                loadAnnouncements(p);
              }}
            >
              →
            </Button>

          </div>

        )}
      </GlassPanel>

    </div>

  );
}
