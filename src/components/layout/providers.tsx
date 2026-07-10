"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { useUserStore } from "@/stores/user";
import { useWebsiteStore } from "@/stores/website";
import { useAuthModalStore } from "@/stores/auth-modal";
import { setNeedLoginHandler, ensureCsrfCookie } from "@/lib/api/client";
import { AuthModal } from "@/components/oj/auth-modal";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AppearanceProvider } from "@/components/layout/appearance-provider";
import { WelcomeNotice } from "@/components/layout/welcome-notice";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "oj-toast",
          title: "oj-toast-title",
          description: "oj-toast-desc",
          success: "oj-toast-success",
          error: "oj-toast-error",
          warning: "oj-toast-warning",
          info: "oj-toast-info",
        },
      }}
    />
  );
}

export function AppProviders({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  const getProfile = useUserStore((s) => s.getProfile);
  const getWebsiteConfig = useWebsiteStore((s) => s.getWebsiteConfig);
  const openAuth = useAuthModalStore((s) => s.open);

  useEffect(() => {
    (async () => {
      await ensureCsrfCookie();
      await getProfile();
      getWebsiteConfig();
    })();
    setNeedLoginHandler(() => openAuth("login"));
    return () => setNeedLoginHandler(null);
  }, [getProfile, getWebsiteConfig, openAuth]);

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <AppearanceProvider>
        {children}
        <AuthModal />
        <WelcomeNotice />
        <ThemedToaster />
      </AppearanceProvider>

    </ThemeProvider>

  );
}
