// app/api/apk/download/route.ts
import { NextRequest, NextResponse } from "next/server";

const GIFTED_API = "https://api.giftedtech.web.id/api/download/apkdl";
const API_KEY = "gifted"; // Replace with your real API key if different

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appName = searchParams.get("name");

    if (!appName) {
      return NextResponse.json(
        { success: false, message: "Missing app name (?name=...)" },
        { status: 400 }
      );
    }

    // 1. Ask Gifted API for download link
    const giftedRes = await fetch(
      `${GIFTED_API}?apikey=${API_KEY}&appName=${encodeURIComponent(appName)}`
    );

    if (!giftedRes.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to reach Gifted API" },
        { status: 502 }
      );
    }

    const data = await giftedRes.json();

    if (!data.success || !data.result?.download_url) {
      return NextResponse.json(
        { success: false, message: "App not found or no download available" },
        { status: 404 }
      );
    }

    const downloadUrl = data.result.download_url;

    // 2. Fetch the APK file from Gifted's response
    const apkRes = await fetch(downloadUrl);

    if (!apkRes.ok || !apkRes.body) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch APK file" },
        { status: 500 }
      );
    }

    // 3. Stream APK directly to the user
    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.android.package-archive");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${data.result.appname || "app"}.apk"`
    );

    return new Response(apkRes.body, { headers });
  } catch (err: any) {
    console.error("APK download error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error", error: err.message },
      { status: 500 }
    );
  }
  }
