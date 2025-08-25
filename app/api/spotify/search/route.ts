// app/api/spotify/search/route.ts
import { NextResponse } from "next/server";

const GIFTED_BASE = process.env.GIFTED_API_BASE ?? "https://api.giftedtech.web.id";
const GIFTED_KEY = process.env.GIFTED_API_KEY ?? "gifted";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ error: "Missing ?q=" }, { status: 400 });

    const url = `${GIFTED_BASE}/api/search/spotifysearch?apikey=${encodeURIComponent(
      GIFTED_KEY
    )}&query=${encodeURIComponent(q)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Gifted search failed", status: res.status },
        { status: 502 }
      );
    }

    const json = await res.json();
    // Gifted returns .results array — normalize to a friendly shape
    const items = Array.isArray(json.results) ? json.results : json.data || [];

    const normalized = items.map((it: any) => ({
      name: it.title || it.name,
      artists: it.artist || it.artists || "",
      id: it.id || "",
      link: it.url || it.track_url || "",
      image: it.thumbnail || it.image || null,
      duration: it.duration || it.duration_ms || null,
    }));

    return NextResponse.json({ status: 200, creator: "Tevona", result: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", details: String(err.message) }, { status: 500 });
  }
}
