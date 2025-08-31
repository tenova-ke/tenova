// app/api/spotify/download/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing ?url=" }, { status: 400 });

  try {
    // use gifted spotifydl endpoint (working)
    const giftedUrl = `https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`;

    // send a reasonable UA and accept header
    const res = await fetch(giftedUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (TevonaDownloader/1.0)",
        Accept: "application/json, text/*",
      },
      cache: "no-store",
    });

    // If provider returned JSON, parse normally
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("application/ld+json")) {
      const json = await res.json();
      const downloadUrl =
        json?.result?.download_url || json?.result?.url || json?.download_url || json?.url || null;
      if (!downloadUrl) {
        throw new Error("No download_url in JSON response");
      }
      return NextResponse.json({ result: { download_url: downloadUrl } });
    }

    // If not JSON, attempt to parse text and extract a URL
    const text = await res.text();

    // try to locate likely download links (fabdl, api.fabdl.com, download-mp3, /spotify/download-mp3/)
    const urlRegex = /(https?:\/\/[^\s"']+(?:fabdl\.com|download-mp3|spotify\/download-mp3|download_mp3)[^\s"']*)/i;
    const generalUrlRegex = /(https?:\/\/[^\s"']+\.(?:mp3|m4a|mp4|json)[^\s"']*)/i;

    let match = text.match(urlRegex) || text.match(generalUrlRegex);
    if (match && match[0]) {
      const downloadUrl = match[0].replace(/&amp;/g, "&");
      return NextResponse.json({ result: { download_url: downloadUrl } });
    }

    // If none found, return raw text for debugging in body
    throw new Error("Provider returned non-JSON and no download link found (HTML/Text response)");
  } catch (err: any) {
    // return the error and any helpful message
    return NextResponse.json(
      { error: "Spotify download failed", details: String(err.message || err) },
      { status: 500 }
    );
  }
    }
