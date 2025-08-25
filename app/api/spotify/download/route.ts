import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter ?url=" }, { status: 400 });
  }

  try {
    // Extract track ID
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid Spotify track URL" }, { status: 400 });
    }

    const trackId = match[1];
    const fabdlUrl = `https://api.fabdl.com/spotify/download-mp3/${trackId}`;

    const res = await fetch(fabdlUrl);
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
