"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user";
import { useAuthModalStore } from "@/stores/auth-modal";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/glass/glass-card";

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("m");
  const pathname = usePathname();
  const router = useRouter();
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const loaded = useUserStore((s) => s.loaded);
  const openAuth = useAuthModalStore((s) => s.open);

  useEffect(() => {
    if (loaded && !isAuth()) {
      openAuth("login");
      router.push("/");
    }
  }, [loaded, isAuth, openAuth, router]);

  const tabs = [
    { href: "/setting/profile", label: t("Profile") },
    { href: "/setting/account", label: t("Account") },
    { href: "/setting/security", label: t("Security") },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <GlassCard className="p-2" padding={false}>
        <nav className="flex gap-1 p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-center text-sm transition-colors",
                pathname.startsWith(tab.href)
                  ? "bg-[var(--pink-soft)] text-[var(--pink-bright)]"
                  : "text-[var(--muted)] hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {tab.label}
            </Link>

          ))}
        </nav>

      </GlassCard>

      {children}
    </div>

  );
}
