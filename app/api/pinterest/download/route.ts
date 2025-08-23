import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing ?url=" }, { status: 400 });
  }

  try {
    // Gifted API for Pinterest downloads
    const apiUrl = `https://api.giftedtech.web.id/api/download/pinterest?apikey=gifted&url=${encodeURIComponent(
      url
    )}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.result) {
      return NextResponse.json(
        { error: "Failed to fetch from Pinterest API" },
        { status: 502 }
      );
    }

    // Pass through Gifted API response
    return NextResponse.json({
      status: 200,
      provider: "GiftedTech",
      result: data.result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Pinterest download failed", details: String(err) },
      { status: 500 }
    );
  }
}
