// app/api/youtube/download/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedTunnel(u: URL) {
  // Be strict to avoid open redirects. These tunnel hosts rotate, but all end with yt-dl.click
  return u.hostname.endsWith("yt-dl.click");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("url");
    const file = (searchParams.get("filename") || "audio.mp3").replace(/[^\w.\- ]+/g, "_");
    const streamMode = searchParams.get("stream");

    if (!raw) {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!isAllowedTunnel(target)) {
      return new Response(JSON.stringify({ error: "Host not allowed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // OPTION A (default): 302 redirect to the tunnel link (best for large files, avoids CORS/fetch issues)
    if (!streamMode) {
      // Do NOT use POST from the client; use a normal <a href> or window.location to this GET route.
      return new Response(null, {
        status: 302,
        headers: {
          Location: target.toString(),
          "Cache-Control": "no-store",
        },
      });
    }

    // OPTION B: stream through our server as an attachment (?stream=1)
    const upstream = await fetch(target.toString(), {
      // never cache (links are short-lived)
      cache: "no-store",
      // some tunnel hosts require a reasonable UA
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: "Upstream failed", status: upstream.status }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    // stream body directly to client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "no-store",
        // pass through length if present (not required)
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
                         }
