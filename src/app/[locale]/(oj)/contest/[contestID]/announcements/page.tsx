"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import { HtmlContent } from "@/components/editor/markdown-view";
import ojApi from "@/lib/api/oj";
import { utcToLocal } from "@/lib/time";

type Announcement = {
  id: number;
  title: string;
  content: string;
  create_time: string;
  created_by?: { username: string };
};

export default function ContestAnnouncementsPage({
  params,
}: {
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ojApi
      .getContestAnnouncementList(contestID)
      .then((res) => setList((res.data.data as Announcement[]) || []))
      .finally(() => setLoading(false));
  }, [contestID]);

  if (loading) return <Loading />;

  return (
    <GlassPanel title={t("Contest_Announcements")}>
      {list.length === 0 ? (
        <EmptyState message={t("No_Announcements")} />
      ) : (
        <ul className="divide-y divide-white/5">
          {list.map((a) => (
            <li key={a.id} className="py-4 first:pt-0">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-medium">{a.title}</h3>

                <span className="text-xs text-muted">
                  {t("By")} {a.created_by?.username} · {utcToLocal(a.create_time)}
                </span>

              </div>

              <HtmlContent html={a.content} className="mt-2 text-sm" />
            </li>

          ))}
        </ul>

      )}
    </GlassPanel>

  );
}
