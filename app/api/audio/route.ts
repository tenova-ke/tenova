import { NextResponse } from "next/server";
import { streamAudio } from "@/lib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return NextResponse.json({ error: "Missing audio URL" }, { status: 400 });

  try {
    const { info } = await streamAudio(url);
    return NextResponse.json({ title: info.title, duration: info.durationRaw });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
