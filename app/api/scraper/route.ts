import { NextResponse } from "next/server";
import { scrapeHTML } from "@/lib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  try {
    const title = await scrapeHTML(url);
    return NextResponse.json({ title });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  }
