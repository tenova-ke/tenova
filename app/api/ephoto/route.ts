import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tool = searchParams.get("tool");
  const text = searchParams.get("text");

  if (!tool || !text) {
    return NextResponse.json({ success: false, error: "Missing tool or text" }, { status: 400 });
  }

  try {
    const url = `https://api.giftedtech.web.id/api/ephoto360/${tool}?apikey=gifted&text=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success && data.result?.image_url) {
      return NextResponse.json({ success: true, image: data.result.image_url });
    }

    return NextResponse.json({ success: false, error: "Failed to generate", raw: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
