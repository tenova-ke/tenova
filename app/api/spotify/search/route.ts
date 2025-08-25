import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter ?q=" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://apis.prexzyvilla.site/search/spotify?query=${encodeURIComponent(query)}`
    );

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
