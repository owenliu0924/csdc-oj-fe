"use client";

import { useTranslations, useLocale } from "next-intl";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/stores/user";
import { useWebsiteStore } from "@/stores/website";
import { useAuthModalStore } from "@/stores/auth-modal";
import { AppearancePanel } from "@/components/layout/appearance-panel";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ojApi from "@/lib/api/oj";
import { navBarVariants, springSnappy, springSoft } from "@/lib/motion";

export function Navbar() {
  const t = useTranslations("m");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const website = useWebsiteStore((s) => s.website);
  const profile = useUserStore((s) => s.profile);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isAdminRole = useUserStore((s) => s.isAdminRole);
  const clearProfile = useUserStore((s) => s.clearProfile);
  const openAuth = useAuthModalStore((s) => s.open);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  const nav = [
    { href: "/", label: t("Home") },
    { href: "/problem", label: t("NavProblems") },
    { href: "/contest", label: t("Contests") },
    { href: "/status", label: t("NavStatus") },
  ];

  const switchLocale = (next: string) => {

    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${
      60 * 60 * 24 * 365
    };samesite=lax`;
    router.replace(pathname, { locale: next });
  };

  const logout = async () => {
    try {
      await ojApi.logout();
    } catch {

    }
    clearProfile();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      className="sticky top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-4"
      variants={reduce ? undefined : navBarVariants}
      initial={reduce ? false : "initial"}
      animate="animate"
    >
      <div className="glass-nav mx-auto flex h-[52px] max-w-6xl items-center gap-1 rounded-[var(--radius-xl)] px-3 sm:px-4">
        <Link
          href="/"
          className="mr-2 shrink-0 px-1.5 text-[15px] font-semibold tracking-tight text-white transition-opacity hover:opacity-90 sm:mr-3"
        >
          {website.website_name || process.env.NEXT_PUBLIC_APP_NAME || "OJ"}
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  active
                    ? "text-[var(--pink-bright)]"
                    : "text-[var(--muted)] hover:text-white"
                )}
              >
                {active && !reduce && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--pink-soft)] shadow-[0_0_0_1px_rgba(240,168,200,0.15)_inset]"
                    transition={springSnappy}
                  />
                )}
                {active && reduce && (
                  <span className="absolute inset-0 rounded-xl bg-[var(--pink-soft)] shadow-[0_0_0_1px_rgba(240,168,200,0.15)_inset]" />
                )}
                <span className="relative z-10">{item.label}</span>

              </Link>

            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                  pathname.includes("rank")
                    ? "bg-[var(--pink-soft)] text-[var(--pink-bright)]"
                    : "text-[var(--muted)] hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {t("Rank")}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>

            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/acm-rank")}>
                {t("ACM_Rank")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/oi-rank")}>
                {t("OI_Rank")}
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-0.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-[var(--muted)] transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
              >
                {t("About")}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>

            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/about")}>
                {t("Judger")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/faq")}>
                {t("FAQ")}
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </nav>

        <div className="ml-auto flex items-center gap-1">
          <AppearancePanel />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Language"
              >
                <Globe className="h-3.5 w-3.5" />
              </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => switchLocale("zh-TW")}
                className={locale === "zh-TW" ? "bg-[var(--pink-soft)]" : ""}
              >
                繁體中文
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => switchLocale("en")}
                className={locale === "en" ? "bg-[var(--pink-soft)]" : ""}
              >
                English
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

          {!isAuthenticated() ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                type="button"
                onClick={() => openAuth("login")}
              >
                {t("Login")}
              </Button>

              {website.allow_register !== false && (
                <Button
                  size="sm"
                  className="hidden sm:inline-flex"
                  type="button"
                  onClick={() => openAuth("register")}
                >
                  {t("Register")}
                </Button>

              )}
              <Button
                size="sm"
                className="sm:hidden"
                type="button"
                onClick={() => openAuth("login")}
              >
                {t("Login")}
              </Button>

            </>

          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-[13px]">
                  <span className="max-w-[100px] truncate">
                    {profile.user?.username}
                  </span>

                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>

              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/user-home")}>
                  {t("MyHome")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/status?myself=1")}
                >
                  {t("MySubmissions")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/setting/profile")}
                >
                  {t("Settings")}
                </DropdownMenuItem>

                {isAdminRole() && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    {t("Management")}
                  </DropdownMenuItem>

                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  {t("Logout")}
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <motion.span
              key={mobileOpen ? "x" : "menu"}
              initial={reduce ? false : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={springSnappy}
              className="inline-flex"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </motion.span>

          </Button>

        </div>

      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            className="glass-nav mx-auto mt-2 max-w-6xl space-y-0.5 overflow-hidden rounded-[var(--radius-xl)] p-2 md:hidden"
            initial={
              reduce
                ? { opacity: 1 }
                : { opacity: 0, y: -10, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scale: 0.98 }
            }
            transition={springSoft}
          >
            {nav.map((item, i) => (
              <motion.div
                key={item.href}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i, ...springSnappy }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-[var(--pink-soft)] text-[var(--pink-bright)]"
                      : "text-[var(--fg-secondary)] hover:bg-white/[0.05]"
                  )}
                >
                  {item.label}
                </Link>

              </motion.div>

            ))}
            <Link
              href="/acm-rank"
              className="block rounded-xl px-3 py-2.5 text-sm text-[var(--fg-secondary)] hover:bg-white/[0.05]"
              onClick={() => setMobileOpen(false)}
            >
              {t("ACM_Rank")}
            </Link>

            <Link
              href="/oi-rank"
              className="block rounded-xl px-3 py-2.5 text-sm text-[var(--fg-secondary)] hover:bg-white/[0.05]"
              onClick={() => setMobileOpen(false)}
            >
              {t("OI_Rank")}
            </Link>

            {!isAuthenticated() && (
              <>
                <button
                  type="button"
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-[var(--pink-soft)]"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuth("login");
                  }}
                >
                  {t("Login")}
                </button>

                {website.allow_register !== false && (
                  <button
                    type="button"
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-[var(--pink-bright)] hover:bg-[var(--pink-soft)]"
                    onClick={() => {
                      setMobileOpen(false);
                      openAuth("register");
                    }}
                  >
                    {t("Register")}
                  </button>

                )}
              </>

            )}
          </motion.div>

        )}
      </AnimatePresence>

    </motion.header>

  );
}
