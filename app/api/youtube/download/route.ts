import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing video id ?id=" }, { status: 400 });
  }

  try {
    // 👇 Using a free worker proxy that gives direct mp3 links (yt-dl.click style)
    const apiUrl = `https://api.ryzpz.workers.dev/yt?url=https://www.youtube.com/watch?v=${id}`;
    const { data } = await axios.get(apiUrl);

    return NextResponse.json({
      status: 200,
      title: data.title,
      thumbnail: data.thumbnail,
      duration: data.duration,
      mp3: data.audio_url, // direct tunnel link
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
