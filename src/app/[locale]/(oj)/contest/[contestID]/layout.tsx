"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/oj/loading";
import { useContestStore } from "@/stores/contest";
import { useUserStore } from "@/stores/user";
import { useAuthModalStore } from "@/stores/auth-modal";
import ojApi from "@/lib/api/oj";
import { CONTEST_STATUS, CONTEST_STATUS_REVERSE } from "@/lib/constants";
import { utcToLocal } from "@/lib/time";
import { cn } from "@/lib/utils";
import { HtmlContent } from "@/components/editor/markdown-view";
import { toast } from "sonner";
import { springSnappy } from "@/lib/motion";

export default function ContestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ contestID: string }>;
}) {
  const { contestID } = use(params);
  const t = useTranslations("m");
  const pathname = usePathname();
  const contest = useContestStore((s) => s.contest);
  const loadContest = useContestStore((s) => s.loadContest);
  const clear = useContestStore((s) => s.clear);
  const tick = useContestStore((s) => s.tick);
  const contestStatus = useContestStore((s) => s.contestStatus);
  const countdown = useContestStore((s) => s.countdown);
  const menuDisabled = useContestStore((s) => s.contestMenuDisabled);
  const passwordFormVisible = useContestStore((s) => s.passwordFormVisible);
  const isContestAdmin = useContestStore((s) => s.isContestAdmin);
  const setAccess = useContestStore((s) => s.setAccess);
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const openAuth = useAuthModalStore((s) => s.open);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadContest(contestID)
      .catch(() => {})
      .finally(() => setLoading(false));
    const id = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(id);
      clear();
    };
  }, [contestID, loadContest, clear, tick]);

  const base = `/contest/${contestID}`;
  const tabs = [
    { href: base, label: t("Overview"), exact: true },
    { href: `${base}/problems`, label: t("Problems") },
    { href: `${base}/submissions`, label: t("Submissions") },
    { href: `${base}/rank`, label: t("Rankings") },
    { href: `${base}/announcements`, label: t("Announcements") },
  ];
  if (isContestAdmin() && contest.rule_type === "ACM") {
    tabs.push({ href: `${base}/helper`, label: t("Admin_Helper") });
  }

  const status = contestStatus();
  const statusInfo = status ? CONTEST_STATUS_REVERSE[status] : null;

  const unlock = async () => {
    if (!isAuth()) {
      openAuth("login");
      toast.error(t("Please_login_first"));
      return;
    }
    await ojApi.checkContestPassword(contestID, password);
    setAccess(true);
    toast.success(t("Success"));
  };

  if (loading && !contest.id) return <Loading />;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {contest.title}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
              <span>
                {t("StartAt")}: {utcToLocal(contest.start_time)}
              </span>

              <span>
                {t("EndAt")}: {utcToLocal(contest.end_time)}
              </span>

              <span>
                {t("ContestType")}:{" "}
                {contest.contest_type === "Public"
                  ? t("Public")
                  : t("Password_Protected")}
              </span>

              <span>
                {t("Creator")}: {contest.created_by?.username}
              </span>

            </div>

          </div>

          <div className="flex flex-col items-end gap-2">
            {statusInfo && (
              <Badge
                variant={
                  status === CONTEST_STATUS.UNDERWAY
                    ? "success"
                    : status === CONTEST_STATUS.NOT_START
                      ? "warning"
                      : "danger"
                }
              >
                {statusInfo.name}
              </Badge>

            )}
            <span className="font-mono text-sm text-white/70">
              {countdown()}
            </span>

          </div>

        </div>

        {passwordFormVisible() ? (
          <div className="mt-4 flex max-w-sm gap-2">
            <Input
              type="password"
              placeholder={t("LoginPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={unlock}>{t("Submit")}</Button>

          </div>

        ) : (
          <>
            <nav className="mt-4 flex flex-wrap gap-1 border-t border-white/10 pt-4">
              {tabs.map((tab) => {
                const active = tab.exact
                  ? pathname === tab.href || pathname === `${tab.href}/`
                  : pathname.startsWith(tab.href);
                const disabled = menuDisabled() && !tab.exact;
                return (
                  <Link
                    key={tab.href}
                    href={disabled ? base : tab.href}
                    className={cn(
                      "relative rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "text-[var(--pink-bright)]"
                        : "text-[var(--muted)] hover:bg-white/[0.05] hover:text-white",
                      disabled && "pointer-events-none opacity-40"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="contest-tab-pill"
                        className="absolute inset-0 rounded-lg bg-[var(--pink-soft)]"
                        transition={springSnappy}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>

                  </Link>

                );
              })}
            </nav>

          </>

        )}
      </GlassCard>

      {passwordFormVisible() ? (
        <GlassCard>
          <HtmlContent html={contest.description} />
        </GlassCard>

      ) : (
        children
      )}
    </div>

  );
}
