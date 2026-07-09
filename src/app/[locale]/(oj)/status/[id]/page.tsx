"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/oj/status-badge";
import { CodeHighlight } from "@/components/editor/code-highlight";
import { Loading } from "@/components/oj/loading";
import { Link } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { JUDGE_STATUS } from "@/lib/constants";
import {
  submissionMemoryFormat,
  submissionTimeFormat,
} from "@/lib/utils";
import { useUserStore } from "@/stores/user";

type Submission = {
  id: string;
  result: number;
  language: string;
  username: string;
  code: string;
  shared: boolean;
  can_unshare?: boolean;
  statistic_info?: {
    time_cost?: number;
    memory_cost?: number;
    err_info?: string;
    score?: number;
  };
  info?: {
    data?: {
      result: number;
      cpu_time: number;
      memory: number;
      real_time: number;
      signal: number;
      error: number;
      test_case: string;
    }[];
  };
  problem?: string | number;
};

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("m");
  const isAdmin = useUserStore((s) => s.isAdminRole);
  const [sub, setSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ojApi.getSubmission(id);
      setSub(res.data.data as Submission);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const share = async (shared: boolean) => {
    await ojApi.updateSubmission({ id, shared });
    toast.success(t("Succeeded"));
    load();
  };

  const rejudge = async () => {
    await ojApi.submissionRejudge(id);
    toast.success(t("Succeeded"));
    load();
  };

  if (loading || !sub) return <Loading />;

  const isCE = sub.result === -2;
  const status = JUDGE_STATUS[String(sub.result)];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <GlassPanel>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={sub.result} className="text-sm px-3 py-1" />
          <span className="text-lg font-semibold">{status?.name}</span>

        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {isCE ? (
            <pre className="w-full whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-rose-300 text-xs">
              {sub.statistic_info?.err_info}
            </pre>

          ) : (
            <>
              <span>
                {t("Time")}: {submissionTimeFormat(sub.statistic_info?.time_cost)}
              </span>

              <span>
                {t("Memory")}:{" "}
                {submissionMemoryFormat(sub.statistic_info?.memory_cost)}
              </span>

              <span>
                {t("Lang")}: {sub.language}
              </span>

              <span>
                {t("Author")}:{" "}
                <Link
                  href={`/user-home?username=${sub.username}`}
                  className="text-white/70 hover:underline"
                >
                  {sub.username}
                </Link>

              </span>

            </>

          )}
        </div>

      </GlassPanel>

      {sub.info?.data && !isCE && (
        <GlassPanel title="Test Cases">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted">
                  <th className="pb-2 pr-3">#</th>

                  <th className="pb-2 pr-3">{t("Status")}</th>

                  <th className="pb-2 pr-3">{t("Time")}</th>

                  <th className="pb-2 pr-3">{t("Memory")}</th>

                  <th className="pb-2 pr-3">{t("Real_Time")}</th>

                  <th className="pb-2">{t("Signal")}</th>

                </tr>

              </thead>

              <tbody>
                {sub.info.data.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 pr-3">{row.test_case || i + 1}</td>

                    <td className="py-2 pr-3">
                      <StatusBadge status={row.result} />
                    </td>

                    <td className="py-2 pr-3">{row.cpu_time}ms</td>

                    <td className="py-2 pr-3">
                      {submissionMemoryFormat(row.memory)}
                    </td>

                    <td className="py-2 pr-3">{row.real_time}ms</td>

                    <td className="py-2">{row.signal}</td>

                  </tr>

                ))}
              </tbody>

            </table>

          </div>

        </GlassPanel>

      )}

      <GlassPanel title="Code">
        <CodeHighlight code={sub.code || ""} language={sub.language} />
        <div className="mt-4 flex gap-2">
          {sub.can_unshare && (
            <Button
              variant={sub.shared ? "secondary" : "default"}
              onClick={() => share(!sub.shared)}
            >
              {sub.shared ? t("UnShare") : t("Share")}
            </Button>

          )}
          {isAdmin() && (
            <Button variant="outline" onClick={rejudge}>
              {t("Rejudge")}
            </Button>

          )}
        </div>

      </GlassPanel>

    </div>

  );
}
