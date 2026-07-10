import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = (process.env.OJ_BACKEND_URL || "").replace(/\/$/, "") || null;
  return NextResponse.json({ backendUrl });
}
