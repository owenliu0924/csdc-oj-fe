import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND = (process.env.OJ_BACKEND_URL || "http://127.0.0.1:8080").replace(
  /\/$/,
  ""
);

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

async function proxy(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  const targetPath = path.join("/");
  const target = `${BACKEND}/api/${targetPath}${url.search}`;

  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  headers.set("Referer", `${BACKEND}/`);
  headers.set("Origin", BACKEND);
  headers.set("Host", new URL(BACKEND).host);

  const csrf =
    req.headers.get("x-csrftoken") ||
    req.headers.get("X-CSRFToken") ||
    getCookieValue(cookie, "csrftoken");
  if (csrf) {
    headers.set("X-CSRFToken", csrf);
  }

  const method = req.method.toUpperCase();
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,

    redirect: "manual",
  });

  const responseHeaders = new Headers();
  const passHeaders = [
    "content-type",
    "content-length",
    "content-disposition",
    "cache-control",
  ];
  for (const key of passHeaders) {
    const v = upstream.headers.get(key);
    if (v) responseHeaders.set(key, v);
  }

  const anyHeaders = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : [];
  if (setCookies.length > 0) {
    for (const c of setCookies) {

      const cleaned = c
        .split(";")
        .map((p) => p.trim())
        .filter((p) => !/^domain=/i.test(p))
        .join("; ");
      responseHeaders.append("set-cookie", cleaned);
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) {
      const cleaned = single
        .split(";")
        .map((p) => p.trim())
        .filter((p) => !/^domain=/i.test(p))
        .join("; ");
      responseHeaders.set("set-cookie", cleaned);
    }
  }

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
