// app/api/spotify/download/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing ?url=" }, { status: 400 });
  }

  try {
    // ✅ Use spotifydl instead of spotifydlv2
    const giftedUrl = `https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(
      url
    )}`;

    const res = await fetch(giftedUrl);
    const data = await res.json();

    // Normalize response for frontend
    const downloadUrl =
      data?.result?.download_url ||
      data?.result?.url ||
      data?.download_url ||
      data?.url ||
      null;

    if (!downloadUrl) {
      throw new Error("No download_url returned");
    }

    return NextResponse.json({ result: { download_url: downloadUrl } });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Spotify download failed", details: e.message },
      { status: 500 }
    );
  }
      }
