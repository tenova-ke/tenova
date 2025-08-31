import { NextRequest, NextResponse } from "next/server";

const API_KEY = "gifted_api_jsgt5su7s"; // replace with your real key
const BASE = "https://api.giftedtech.web.id/api/download";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const server = searchParams.get("server") || "ytv"; // ytv, ytdlv2, ytdlv3
    const stream = searchParams.get("stream");

    if (!url) {
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    // Build Gifted endpoint
    const endpoint = `${BASE}/${server}?apikey=${API_KEY}&url=${encodeURIComponent(url)}`;

    // Fetch Gifted response
    const res = await fetch(endpoint);
    const data = await res.json();

    if (!data || !data.result?.download_url) {
      return NextResponse.json(
        { error: "Failed to fetch video", details: data },
        { status: 500 }
      );
    }

    // If stream=1 → pipe the video directly
    if (stream === "1") {
      const videoRes = await fetch(data.result.download_url);
      return new NextResponse(videoRes.body, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `inline; filename="${encodeURIComponent(
            data.result.title || "video"
          )}.mp4"`,
        },
      });
    }

    // Otherwise → return JSON metadata
    return NextResponse.json({
      status: 200,
      title: data.result.title,
      quality: data.result.quality,
      duration: data.result.duration,
      thumbnail: data.result.thumbnail,
      download_url: data.result.download_url,
      source: server,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal error", details: err.message },
      { status: 500 }
    );
  }
}
