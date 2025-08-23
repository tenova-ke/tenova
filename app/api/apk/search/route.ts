import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const res = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    // Filter out download URLs for security & separation
    const results = data?.datalist?.list?.map((app: any) => ({
      id: app.id,
      name: app.name,
      package: app.package,
      version: app.file?.vername,
      size: app.file?.filesize,
      md5sum: app.file?.md5sum,
      icon: app.icon,
      developer: app.developer?.name,
      store: app.store?.name,
      downloads: app.stats?.downloads,
      rating: app.stats?.rating?.avg,
    }));

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: "Search failed", details: err.message }, { status: 500 });
  }
}
