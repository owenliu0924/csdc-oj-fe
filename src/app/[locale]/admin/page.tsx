"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel, GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/oj/loading";
import adminApi from "@/lib/api/admin";
import { useUserStore } from "@/stores/user";
import { utcToLocal } from "@/lib/time";
import DOMPurify from "isomorphic-dompurify";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const profile = useUserStore((s) => s.profile);
  const user = useUserStore((s) => s.user);
  const isSuperAdmin = useUserStore((s) => s.isSuperAdmin);
  const [info, setInfo] = useState<{
    user_count?: number;
    today_submission_count?: number;
    recent_contest_count?: number;
    judge_server_count?: number;
    env?: { FORCE_HTTPS?: boolean; STATIC_CDN_HOST?: string };
  }>({});
  const [sessions, setSessions] = useState<
    { ip: string; last_activity: string; user_agent: string; current_session?: boolean }[]
  >([]);
  const [releases, setReleases] = useState<
    { title: string; body?: string; new_version?: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dash, sess, rel] = await Promise.all([
          isSuperAdmin()
            ? adminApi.getDashboardInfo()
            : Promise.resolve(null),
          adminApi.getSessions(),
          isSuperAdmin()
            ? adminApi.getReleaseNotes().catch(() => null)
            : Promise.resolve(null),
        ]);
        if (dash) setInfo((dash.data.data as typeof info) || {});
        setSessions((sess.data.data as typeof sessions) || []);
        if (rel)
          setReleases(
            ((rel.data.data as { results?: typeof releases })?.results ||
              (rel.data.data as typeof releases) ||
              []) as typeof releases
          );
      } finally {
        setLoading(false);
      }
    })();
  }, [isSuperAdmin]);

  if (loading) return <Loading />;

  const current = sessions.find((s) => s.current_session) || sessions[0];
  const https =
    typeof window !== "undefined" && window.location.protocol === "https:";

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <GlassCard>
          <div className="flex items-center gap-3">

            <img
              src={(profile.avatar as string) || "/favicon.ico"}
              className="h-14 w-14 rounded-full border border-white/10"
              alt=""
            />
            <div>
              <p className="font-semibold">{user().username}</p>

              <p className="text-xs text-muted">{user().admin_type}</p>

            </div>

          </div>

          {current && (
            <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-xs text-muted">
              <p className="font-medium text-foreground/80">{t("Last_Login")}</p>

              <p>Time: {utcToLocal(current.last_activity)}</p>

              <p>IP: {current.ip}</p>

            </div>

          )}
        </GlassCard>

        {isSuperAdmin() && (
          <GlassPanel title={t("System_Overview")}>
            <div className="space-y-2 text-sm">
              <p>
                {t("DashBoardJudge_Server")}: {info.judge_server_count ?? "—"}
              </p>

              <p className="flex items-center gap-2">
                {t("HTTPS_Status")}:{" "}
                <Badge variant={https ? "success" : "danger"}>
                  {https ? "Enabled" : "Disabled"}
                </Badge>

              </p>

              <p className="flex items-center gap-2">
                {t("Force_HTTPS")}:{" "}
                <Badge variant={info.env?.FORCE_HTTPS ? "success" : "danger"}>
                  {info.env?.FORCE_HTTPS ? "Enabled" : "Disabled"}
                </Badge>

              </p>

              <p className="flex items-center gap-2">
                {t("CDN_HOST")}:{" "}
                <Badge variant={info.env?.STATIC_CDN_HOST ? "info" : "warning"}>
                  {info.env?.STATIC_CDN_HOST || "Not Use"}
                </Badge>

              </p>

            </div>

          </GlassPanel>

        )}
      </div>

      <div className="space-y-4">
        {isSuperAdmin() && (
          <div className="grid gap-3 sm:grid-cols-3">
            <GlassCard className="text-center sm:text-left">
              <div className="text-2xl font-semibold tracking-tight">
                {info.user_count ?? 0}
              </div>

              <div className="mt-1 text-xs text-muted">Total Users</div>

            </GlassCard>

            <GlassCard className="text-center sm:text-left">
              <div className="text-2xl font-semibold tracking-tight">
                {info.today_submission_count ?? 0}
              </div>

              <div className="mt-1 text-xs text-muted">Today Submissions</div>

            </GlassCard>

            <GlassCard className="text-center sm:text-left">
              <div className="text-2xl font-semibold tracking-tight">
                {info.recent_contest_count ?? 0}
              </div>

              <div className="mt-1 text-xs text-muted">Recent Contests</div>

            </GlassCard>

          </div>

        )}

        {isSuperAdmin() && releases.length > 0 && (
          <GlassPanel title="Release Notes">
            <div className="space-y-3">
              {releases.slice(0, 5).map((r, i) => (
                <details
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <summary className="cursor-pointer font-medium">
                    {r.title}{" "}
                    {r.new_version && (
                      <Badge variant="success" className="ml-2">
                        New
                      </Badge>

                    )}
                  </summary>

                  {r.body && (
                    <div
                      className="mt-2 text-sm text-muted prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(r.body) }}
                    />
                  )}
                </details>

              ))}
            </div>

          </GlassPanel>

        )}
      </div>

    </div>

  );
}
