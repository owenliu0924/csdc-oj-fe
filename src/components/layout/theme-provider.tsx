"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

const THEME_COOKIE = "csdc-oj-theme";

function ThemeCookieSync() {
  const { theme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    const value = theme === "system" ? resolvedTheme : theme;
    if (!value) return;

    document.cookie = `${THEME_COOKIE}=${value};path=/;max-age=${
      60 * 60 * 24 * 365
    };samesite=lax`;
  }, [theme, resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      storageKey={THEME_COOKIE}
      disableTransitionOnChange
    >
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>

  );
}

export { THEME_COOKIE };
