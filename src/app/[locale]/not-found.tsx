"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/glass-card";

export default function NotFound() {
  const t = useTranslations("m");
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <GlassCard className="max-w-md text-center">
        <p className="text-6xl font-bold text-white/10">404</p>

        <p className="mt-2 text-muted">Page not found</p>

        <Button asChild className="mt-6">
          <Link href="/">{t("Go_Home")}</Link>

        </Button>

      </GlassCard>

    </div>

  );
}
