"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlassPanel } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/oj/loading";
import { EmptyState } from "@/components/oj/empty-state";
import ojApi from "@/lib/api/oj";
import { utcToLocal } from "@/lib/time";
import { useUserStore } from "@/stores/user";

type Session = {
  session_key: string;
  ip: string;
  user_agent: string;
  last_activity: string;
  current_session?: boolean;
};

export default function SecuritySettingPage() {
  const t = useTranslations("m");
  const getProfile = useUserStore((s) => s.getProfile);
  const profile = useUserStore((s) => s.profile);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [tfaOpen, setTfaOpen] = useState(
    !!(profile as { two_factor_auth?: boolean }).two_factor_auth
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await ojApi.getSessions();
      setSessions((res.data.data as Session[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!tfaOpen) {
      ojApi
        .twoFactorAuth("get")
        .then((res) => {
          const data = res.data.data as { qrcode?: string; image?: string };
          setQr(data.qrcode || data.image || "");
        })
        .catch(() => {});
    }

  }, []);

  const revoke = async (key: string) => {
    await ojApi.deleteSession(key);
    toast.success(t("Success"));
    load();
  };

  const openTfa = async () => {
    await ojApi.twoFactorAuth("post", { code });
    toast.success(t("Success"));
    setTfaOpen(true);
    getProfile();
  };

  const closeTfa = async () => {
    await ojApi.twoFactorAuth("put", { code });
    toast.success(t("Success"));
    setTfaOpen(false);
    setCode("");
    getProfile();
  };

  return (
    <div className="space-y-4">
      <GlassPanel title={t("Sessions")}>
        {loading ? (
          <Loading />
        ) : sessions.length === 0 ? (
          <EmptyState message="—" />
        ) : (
          <ul className="divide-y divide-[var(--glass-border)]">
            {sessions.map((s) => (
              <li
                key={s.session_key}
                className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm tabular-nums">
                      {s.ip || "—"}
                    </span>

                    {s.current_session && (
                      <span className="text-[11px] text-[var(--pink-bright)]">
                        Current
                      </span>

                    )}
                  </div>

                  <p className="truncate text-xs text-[var(--muted)]">
                    {s.user_agent || "—"}
                  </p>

                  <p className="text-xs text-[var(--faint)]">
                    {utcToLocal(s.last_activity)}
                  </p>

                </div>

                {!s.current_session && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 self-start text-[var(--danger)] hover:bg-[rgba(240,113,120,0.12)] hover:text-[var(--danger)] sm:self-center"
                    onClick={() => revoke(s.session_key)}
                  >
                    Revoke
                  </Button>

                )}
              </li>

            ))}
          </ul>

        )}
      </GlassPanel>

      <GlassPanel title={t("Two_Factor_Authentication")}>
        {tfaOpen ? (
          <div className="max-w-sm space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Two-factor authentication is enabled.
            </p>

            <div className="space-y-2">
              <Label className="text-xs text-[var(--muted)]">
                Authenticator code
              </Label>

              <Input
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="one-time-code"
              />
            </div>

            <Button variant="danger" onClick={closeTfa}>
              Disable 2FA
            </Button>

          </div>

        ) : (
          <div className="max-w-sm space-y-3">
            {qr && (

              <img
                src={qr}
                alt="2FA QR"
                className="rounded-lg bg-white p-2"
              />
            )}
            <div className="space-y-2">
              <Label className="text-xs text-[var(--muted)]">
                Authenticator code
              </Label>

              <Input
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="one-time-code"
              />
            </div>

            <Button onClick={openTfa}>Enable 2FA</Button>

          </div>

        )}
      </GlassPanel>

    </div>

  );
}
