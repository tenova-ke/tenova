import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing ?query=" }, { status: 400 });
  }

  try {
    // Gifted API endpoint for Xvideos search
    const apiUrl = `https://api.giftedtech.web.id/api/search/xvideossearch?apikey=gifted&query=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.results) {
      return NextResponse.json(
        { error: "Failed to fetch search results from Xvideos API" },
        { status: 502 }
      );
    }

    // Forward Gifted API response
    return NextResponse.json({
      status: 200,
      provider: "GiftedTech",
      results: data.results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Xvideos search failed", details: String(err) },
      { status: 500 }
    );
  }
}
