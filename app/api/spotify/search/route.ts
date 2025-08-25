// app/api/spotify/search/route.ts
import { NextResponse } from "next/server";

const GIFTED_BASE = process.env.GIFTED_API_BASE ?? "https://api.giftedtech.web.id";
const GIFTED_KEY = process.env.GIFTED_API_KEY ?? "gifted";

async function getOEmbedCover(trackUrl: string) {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.thumbnail_url || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Missing ?q=" }, { status: 400 });

  const url = `${GIFTED_BASE}/api/search/spotifysearch?apikey=${encodeURIComponent(GIFTED_KEY)}&query=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    const items: any[] = Array.isArray(json.results) ? json.results : [];

    // enrich each with cover art
    const enriched = await Promise.all(
      items.map(async (it: any) => {
        const link = it.url || "";
        const cover = await getOEmbedCover(link);
        return {
          name: it.title,
          artists: it.artist,
          id: it.id,
          link,
          image: cover,
          duration: it.duration,
        };
      })
    );

    return NextResponse.json({ status: 200, result: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
      }
