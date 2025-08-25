// app/api/spotify/download/route.ts
import { NextResponse } from "next/server";

const GIFTED_BASE = process.env.GIFTED_API_BASE ?? "https://api.giftedtech.web.id";
const GIFTED_KEY = process.env.GIFTED_API_KEY ?? "gifted";

// Try list — first working wins
const ENDPOINTS = ["spotifydl", "spotifydlv2"];

async function callGifted(endpoint: string, spotifyUrl: string, timeout = 20000) {
  const qs = new URLSearchParams({ apikey: GIFTED_KEY, url: spotifyUrl }).toString();
  const url = `${GIFTED_BASE}/api/download/${endpoint}?${qs}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || !json.success) throw new Error("gifted success=false or invalid response");
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlParam = (searchParams.get("url") || "").trim();
    if (!urlParam) return NextResponse.json({ error: "Missing ?url=" }, { status: 400 });

    let lastErr: any = null;
    for (const ep of ENDPOINTS) {
      try {
        const json = await callGifted(ep, urlParam);
        // ensure there's a download_url
        const dl = json?.result?.download_url || json?.result?.download || json?.download_url;
        if (dl) {
          // Return the raw gifted JSON, frontend will extract download_url
          return NextResponse.json({ status: 200, provider: "gifted", endpoint: ep, result: json.result ?? json });
        } else {
          lastErr = `No download_url in ${ep}`;
        }
      } catch (e) {
        lastErr = e;
        // try next endpoint
      }
    }

    return NextResponse.json(
      { error: "No working downloader endpoint", details: String(lastErr) },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: String(err.message) }, { status: 500 });
  }
}
