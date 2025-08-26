import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appName = searchParams.get("name");

    if (!appName) {
      return NextResponse.json({ error: "Missing app name" }, { status: 400 });
    }

    // GiftedTech API endpoint
    const giftedUrl = `https://api.giftedtech.web.id/api/download/apkdl?apikey=gifted&appName=${encodeURIComponent(appName)}`;

    const res = await fetch(giftedUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Gifted API failed" }, { status: res.status });
    }

    const json = await res.json();
    if (!json.success || !json.result) {
      return NextResponse.json({ error: "No result from Gifted API" }, { status: 404 });
    }

    const result = json.result;

    return NextResponse.json({
      success: true,
      app: {
        name: result.appname,
        icon: result.appicon,
        developer: result.developer,
        mimetype: result.mimetype,
        download_url: result.download_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Download failed", details: err.message },
      { status: 500 }
    );
  }
    }
