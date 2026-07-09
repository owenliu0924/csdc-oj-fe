import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/components/layout/providers";
import { THEME_COOKIE } from "@/components/layout/theme-provider";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "zh-TW" | "en")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const defaultTheme =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : "dark";

  return (
    <NextIntlClientProvider messages={messages}>
      <AppProviders defaultTheme={defaultTheme}>{children}</AppProviders>

    </NextIntlClientProvider>

  );
}
