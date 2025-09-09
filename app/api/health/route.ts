// app/api/health/route.ts
import { NextResponse } from "next/server";

/**
 * Health check endpoint
 * - Responds quickly with JSON
 * - Also pings your own Render domain to prove the server is alive
 * - Adds headers to avoid caching
 */

export async function GET() {
  const start = Date.now();
  let ok = false;
  let latency = -1;
  let error: string | null = null;

  try {
    // Ping your own base URL (replace with your real Render URL if needed)
    const selfUrl = process.env.BASE_URL || "https://tevona-jxmj.onrender.com";
    const res = await fetch(selfUrl, { method: "HEAD", cache: "no-store" });

    latency = Date.now() - start;
    ok = res.ok;
    if (!ok) {
      error = `status ${res.status}`;
    }
  } catch (err: any) {
    latency = Date.now() - start;
    error = err?.message || "fetch failed";
    ok = false;
  }

  return NextResponse.json(
    {
      status: ok ? "ok" : "error",
      uptime: process.uptime(), // seconds this instance is alive
      timestamp: new Date().toISOString(),
      latency,
      error,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
