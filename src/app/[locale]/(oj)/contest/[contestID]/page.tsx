"use client";

import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";
import { HtmlContent } from "@/components/editor/markdown-view";
import { useContestStore } from "@/stores/contest";
import { utcToLocal } from "@/lib/time";

export default function ContestOverviewPage() {
  const t = useTranslations("m");
  const contest = useContestStore((s) => s.contest);

  return (
    <GlassPanel title={t("Overview")}>
      <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">{t("StartAt")}</dt>

          <dd>{utcToLocal(contest.start_time)}</dd>

        </div>

        <div>
          <dt className="text-muted">{t("EndAt")}</dt>

          <dd>{utcToLocal(contest.end_time)}</dd>

        </div>

        <div>
          <dt className="text-muted">{t("Rule")}</dt>

          <dd>{contest.rule_type}</dd>

        </div>

        <div>
          <dt className="text-muted">{t("Creator")}</dt>

          <dd>{contest.created_by?.username}</dd>

        </div>

      </dl>

      <HtmlContent html={contest.description} />
    </GlassPanel>

  );
}
