"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import adminApi from "@/lib/api/admin";
import { useUserStore } from "@/stores/user";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const getProfile = useUserStore((s) => s.getProfile);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await adminApi.login(username, password);
      await getProfile();
      toast.success("OK");
      router.replace("/admin");
    } catch {

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="w-full max-w-sm space-y-4" strong>
        <h1 className="text-center text-xl font-semibold">
          {t("Welcome_to_Login")}
        </h1>

        <div className="space-y-2">
          <Label>{t("username")}</Label>

          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label>{t("password")}</Label>

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <Button className="w-full" onClick={submit} disabled={loading}>
          {t("GO")}
        </Button>

      </GlassCard>

    </div>

  );
}
