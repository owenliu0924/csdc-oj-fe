"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GlassCard } from "@/components/glass/glass-card";
import { AuthForm } from "@/components/oj/auth-form";
import { useWebsiteStore } from "@/stores/website";

export default function RegisterPage() {
  const t = useTranslations("m");
  const router = useRouter();
  const website = useWebsiteStore((s) => s.website);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center">
      <GlassCard className="w-full space-y-5" strong>
        <div>
          <h1 className="text-lg font-medium tracking-tight">
            {t("Welcome_to")}{" "}
            {website.website_name_shortcut || website.website_name || "OJ"}
          </h1>

          <p className="mt-1 text-sm text-muted">{t("UserRegister")}</p>

        </div>

        <AuthForm
          mode="register"
          onModeChange={(m) => {
            if (m === "login") router.push("/login");
          }}
          onSuccess={() => router.push("/login")}
        />
      </GlassCard>

    </div>

  );
}
