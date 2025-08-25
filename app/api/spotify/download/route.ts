import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter ?url=" },
      { status: 400 }
    );
  }

  try {
    // Gifted API (requires apikey)
    const giftedUrl = `https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(url)}`;
    const res = await fetch(giftedUrl);

    if (!res.ok) {
      throw new Error(`Download API failed with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Spotify download failed", details: error.message },
      { status: 500 }
    );
  }
}
