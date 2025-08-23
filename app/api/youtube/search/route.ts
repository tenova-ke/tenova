import { NextResponse } from "next/server";
import axios from "axios";

const YT_API_KEY = process.env.YT_API_KEY || "AIzaSyDzNRcpZV82LPaHjRabNeZ26JqfiDiqY50";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query ?q=" }, { status: 400 });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      q
    )}&maxResults=10&key=${YT_API_KEY}`;

    const { data } = await axios.get(url);

    return NextResponse.json({
      results: data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
    }
