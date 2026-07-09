import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Use classic middleware.ts (Edge) for Cloudflare OpenNext.
 * Next.js 16 "proxy" defaults to Node.js runtime, which OpenNext CF does not support yet.
 */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|backgrounds|.*\\..*).*)"],
};
