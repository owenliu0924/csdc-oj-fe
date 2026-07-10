import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function backendBase() {
  return (process.env.OJ_BACKEND_URL || "http://127.0.0.1:8080").replace(
    /\/$/,
    ""
  );
}

function safeJoin(parts: string[]) {
  const joined = parts.map((p) => decodeURIComponent(p)).join("/");
  if (!joined || joined.includes("..") || joined.startsWith("/")) {
    return null;
  }
  return joined;
}

async function proxy(req: NextRequest, path: string[]) {
  const rel = safeJoin(path);
  if (!rel) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }

  const target = `${backendBase()}/public/${rel}${new URL(req.url).search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: {
        Accept: req.headers.get("accept") || "*/*",
        ...(req.headers.get("range")
          ? { Range: req.headers.get("range")! }
          : {}),
      },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach media backend" },
      { status: 502 }
    );
  }

  const headers = new Headers();
  for (const key of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
    "cache-control",
  ]) {
    const v = upstream.headers.get(key);
    if (v) headers.set(key, v);
  }
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "public, max-age=3600, stale-while-revalidate=86400");
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function HEAD(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
