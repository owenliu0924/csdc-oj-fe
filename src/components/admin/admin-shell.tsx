"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Settings,
  Server,
  Trash2,
  BookOpen,
  Plus,
  Package,
  Trophy,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useUserStore } from "@/stores/user";
import { cn } from "@/lib/utils";
import ojApi from "@/lib/api/oj";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion/page-transition";
import { springSoft, springSnappy } from "@/lib/motion";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const isAdmin = useUserStore((s) => s.isAdminRole);
  const isSuperAdmin = useUserStore((s) => s.isSuperAdmin);
  const hasProblemPermission = useUserStore((s) => s.hasProblemPermission);
  const loaded = useUserStore((s) => s.loaded);
  const clearProfile = useUserStore((s) => s.clearProfile);
  const user = useUserStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!loaded) return;
    if (!isAuth() || !isAdmin()) {
      router.replace("/admin/login");
    }
  }, [loaded, isAuth, isAdmin, router]);

  if (pathname.endsWith("/admin/login") || pathname.includes("/admin/login")) {
    return <>{children}</>;

  }

  if (!loaded || !isAuth() || !isAdmin()) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)] text-sm">
        Loading…
      </div>

    );
  }

  const items: {
    href: string;
    label: string;
    icon: React.ElementType;
    show?: boolean;
  }[] = [
    { href: "/admin", label: t("Dashboard"), icon: LayoutDashboard },
    {
      href: "/admin/user",
      label: t("User"),
      icon: Users,
      show: isSuperAdmin(),
    },
    {
      href: "/admin/announcement",
      label: t("Announcement"),
      icon: Megaphone,
      show: isSuperAdmin(),
    },
    {
      href: "/admin/conf",
      label: t("System_Config"),
      icon: Settings,
      show: isSuperAdmin(),
    },
    {
      href: "/admin/judge-server",
      label: t("Judge_Server"),
      icon: Server,
      show: isSuperAdmin(),
    },
    {
      href: "/admin/prune-test-case",
      label: t("Prune_Test_Case"),
      icon: Trash2,
      show: isSuperAdmin(),
    },
    {
      href: "/admin/problems",
      label: t("Problem_List"),
      icon: BookOpen,
      show: hasProblemPermission(),
    },
    {
      href: "/admin/problem/create",
      label: t("Create_Problem"),
      icon: Plus,
      show: hasProblemPermission(),
    },
    {
      href: "/admin/problem/batch_ops",
      label: t("Export_Import_Problem"),
      icon: Package,
      show: hasProblemPermission(),
    },
    { href: "/admin/contest", label: t("Contest_List"), icon: Trophy },
    { href: "/admin/contest/create", label: t("Create_Contest"), icon: Plus },
  ];

  const logout = async () => {
    try {
      await ojApi.logout();
    } catch {

    }
    clearProfile();
    router.push("/admin/login");
  };

  const NavLinks = (
    <nav className="flex flex-col gap-0.5 p-3">
      <div className="mb-4 px-2.5 pt-1">
        <div className="text-[13px] font-semibold tracking-tight text-white">
          Admin
        </div>

        <div className="mt-0.5 text-[11px] text-[var(--faint)] truncate">
          {user().username}
        </div>

      </div>

      {items
        .filter((i) => i.show !== false)
        .map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin" || pathname.endsWith("/admin")
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-[var(--pink-soft)] text-[var(--pink-bright)] shadow-[0_0_0_1px_rgba(240,168,200,0.12)_inset]"
                  : "text-[var(--muted)] hover:bg-white/[0.05] hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  active ? "text-[var(--pink)]" : "opacity-60"
                )}
              />
              {item.label}
            </Link>

          );
        })}
    </nav>

  );

  return (
    <div className="page-shell flex min-h-screen min-w-0 max-w-full gap-3 overflow-x-clip p-3 sm:p-4">

      <motion.aside
        className="glass-sidebar hidden w-56 shrink-0 rounded-[var(--radius-xl)] lg:flex lg:flex-col"
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springSoft}
      >
        <div className="flex-1 overflow-y-auto">{NavLinks}</div>

        <div className="border-t border-white/[0.08] p-3">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1" asChild>
              <Link href="/">OJ</Link>

            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>

          </div>

        </div>

      </motion.aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="glass-sidebar absolute left-3 top-3 bottom-3 w-60 overflow-y-auto rounded-[var(--radius-xl)]"
              initial={reduce ? false : { opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springSoft}
            >
              {NavLinks}
            </motion.aside>

          </div>

        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <motion.header
          className="glass-nav flex h-[52px] items-center justify-between rounded-[var(--radius-xl)] px-4 lg:hidden"
          initial={reduce ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSnappy}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <span className="text-sm font-medium">Admin</span>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>

        </motion.header>

        <main className="min-h-0 min-w-0 max-w-full flex-1 overflow-x-auto overflow-y-auto pb-4">
          <PageTransition>{children}</PageTransition>

        </main>

      </div>

    </div>

  );
}
