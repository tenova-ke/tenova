import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter ?q=" }, { status: 400 });
  }

  try {
    const creepyUrl = `https://creepytech-creepy-ai.hf.space/search/spotify?s=${encodeURIComponent(query)}`;
    const res = await fetch(creepyUrl);

    if (!res.ok) {
      throw new Error(`Search API failed with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Spotify search failed", details: error.message },
      { status: 500 }
    );
  }
}
