"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { GlassPanel, GlassCard } from "@/components/glass/glass-card";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import ojApi from "@/lib/api/oj";
import { useUserStore } from "@/stores/user";
import type { Profile } from "@/stores/user";
import { Mail, Globe } from "lucide-react";

export default function UserHomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <UserHomeInner />
    </Suspense>
  );
}

function UserHomeInner() {
  const t = useTranslations("m");
  const searchParams = useSearchParams();
  const router = useRouter();
  const self = useUserStore((s) => s.profile);
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const me = useUserStore((s) => s.user);
  const username = searchParams.get("username") || self.user?.username;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      if (!isAuth()) {
        router.push("/");
        return;
      }
      setProfile(self);
      setLoading(false);
      return;
    }
    setLoading(true);
    ojApi
      .getUserInfo(username)
      .then((res) => setProfile((res.data.data as Profile) || {}))
      .finally(() => setLoading(false));
  }, [username, self, isAuth, router]);

  if (loading) return <Loading />;
  if (!profile?.user) return <EmptyState message={t("UserHomeIntro")} />;

  const solved: string[] = [];
  for (const problems of [
    profile.acm_problems_status?.problems || {},
    profile.oi_problems_status?.problems || {},
  ]) {
    for (const pid of Object.keys(problems)) {
      const item = problems[pid] as { status?: number; _id?: string };
      if (item?.status === 0) {
        solved.push(item._id || pid);
      }
    }
  }
  const uniqueSolved = [...new Set(solved)].sort();

  const isSelf =
    !searchParams.get("username") ||
    searchParams.get("username") === me()?.username;

  const github =
    typeof profile.github === "string" ? profile.github : "";
  const blog = typeof profile.blog === "string" ? profile.blog : "";
  const email =
    typeof profile.user.email === "string" ? profile.user.email : "";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <GlassCard className="flex items-center gap-4">
        <img
          src={(profile.avatar as string) || "/favicon.ico"}
          alt=""
          className="h-16 w-16 rounded-full border border-white/10 object-cover"
        />
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight">
            {profile.user.username}
            {profile.school ? (
              <span className="ml-1 text-sm font-normal text-[var(--muted)]">
                @{profile.school}
              </span>
            ) : null}
          </p>
          {profile.mood ? (
            <p className="mt-0.5 text-sm text-[var(--muted)]">{profile.mood}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-3">
            {github ? (
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--muted)] hover:text-foreground"
              >
                GitHub
              </a>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                className="text-[var(--muted)] hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
              </a>
            ) : null}
            {blog ? (
              <a
                href={blog}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--muted)] hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="text-center">
          <p className="text-xs text-[var(--muted)]">{t("UserHomeSolved")}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {profile.accepted_number ?? 0}
          </p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-[var(--muted)]">
            {t("UserHomeserSubmissions")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {profile.submission_number ?? 0}
          </p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xs text-[var(--muted)]">{t("UserHomeScore")}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {profile.total_score ?? 0}
          </p>
        </GlassCard>
      </div>

      <GlassPanel title={t("List_Solved_Problems")}>
        {uniqueSolved.length === 0 ? (
          <EmptyState message={t("UserHomeIntro")} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {uniqueSolved.map((id) => (
              <Button key={id} size="sm" variant="secondary" asChild>
                <Link href={`/problem/${id}`}>{id}</Link>
              </Button>
            ))}
          </div>
        )}
        {isSelf && uniqueSolved.length > 0 && profile.user?.id != null ? (
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await ojApi.freshDisplayID(profile.user!.id!);
                const res = await ojApi.getUserInfo(username);
                setProfile((res.data.data as Profile) || {});
              }}
            >
              Regenerate
            </Button>
          </div>
        ) : null}
      </GlassPanel>
    </div>
  );
}
