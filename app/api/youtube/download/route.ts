// app/api/youtube/download/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";        // don't use edge for this
export const dynamic = "force-dynamic"; // no caching, always run server-side

const GIFTED_BASE = process.env.GIFTED_API_BASE || "https://api.giftedtech.web.id";
const GIFTED_KEY  = process.env.GIFTED_API_KEY  || "gifted_api_jsgt5su7s";

// We’ll try a few Gifted endpoints and use the first that returns a direct audio URL
const ENDPOINTS = [
  "ytmp3",   // returns { result.download_url }
  "ytdlv2",  // returns { result.audio_url, result.video_url }
  "dlmp3",   // returns { result.download_url } (auto server)
  "yta"      // returns mp3 (varies), we’ll still try to normalize
];

type GiftedResp = {
  status?: number;
  success?: boolean;
  result?: any;
};

function normalizeToAudioUrl(endpoint: string, data: GiftedResp) {
  const r = data?.result || {};
  // Common shapes
  const download =
    r.download_url ||
    r.audio_url ||
    r.url || // some variants
    null;

  if (!download) return null;

  // Best-effort metadata
  return {
    endpoint,
    id: r.id || r.videoId || undefined,
    title: r.title || undefined,
    thumbnail: r.thumbnail || r.thumb || undefined,
    quality:
      r.quality ||
      r.audi_quality ||
      r.audio_quality ||
      undefined,
    download_url: download as string,
    raw: r,
  };
}

async function callGifted(endpoint: string, ytUrl: string, signal: AbortSignal) {
  const qs = new URLSearchParams({
    apikey: GIFTED_KEY,
    url: ytUrl,
  });
  const url = `${GIFTED_BASE}/api/download/${endpoint}?${qs.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    // a few providers are picky about UA; send a reasonable one
    headers: { "User-Agent": "Mozilla/5.0 (TevonaDownloader/1.0)" },
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    // Try next endpoint
    throw new Error(`Gifted ${endpoint} HTTP ${res.status}`);
  }

  const json = (await res.json()) as GiftedResp;
  if (!json?.success) {
    throw new Error(`Gifted ${endpoint} responded success=false`);
  }

  const norm = normalizeToAudioUrl(endpoint, json);
  if (!norm?.download_url) {
    throw new Error(`Gifted ${endpoint} returned no audio url`);
  }
  return norm;
}

function toYoutubeUrl(urlOrId: string) {
  // if they passed a bare video id, make a full URL
  if (/^[a-zA-Z0-9_-]{6,20}$/.test(urlOrId) && !/^https?:\/\//.test(urlOrId)) {
    return `https://youtu.be/${urlOrId}`;
  }
  return urlOrId;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const input = (searchParams.get("url") || searchParams.get("id") || "").trim();
    if (!input) {
      return NextResponse.json({ error: "Missing ?url= or ?id=" }, { status: 400 });
    }

    const ytUrl = toYoutubeUrl(input);
    const redirect = searchParams.get("redirect"); // if present -> 302 to file
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    let best: Awaited<ReturnType<typeof callGifted>> | null = null;
    let lastErr: unknown = null;

    // Try endpoints in order
    for (const ep of ENDPOINTS) {
      try {
        best = await callGifted(ep, ytUrl, controller.signal);
        if (best) break;
      } catch (e) {
        lastErr = e;
        // continue to next
      }
    }

    clearTimeout(timer);

    if (!best) {
      return NextResponse.json(
        { error: "No working downloader endpoint", details: String(lastErr || "unknown") },
        { status: 502 }
      );
    }

    // If ?redirect=1 (or any truthy), send a 302 straight to the file CDN
    if (redirect) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: best.download_url,
          "Cache-Control": "no-store",
        },
      });
    }

    // Otherwise return JSON (frontend can decide what to do)
    return NextResponse.json(
      {
        status: 200,
        success: true,
        provider: "gifted",
        endpoint: best.endpoint,
        result: {
          id: best.id,
          title: best.title,
          thumbnail: best.thumbnail,
          quality: best.quality,
          download_url: best.download_url,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
