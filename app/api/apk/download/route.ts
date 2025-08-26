import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const res = await fetch(`https://ws75.aptoide.com/api/7/app/get/id:${id}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Aptoide API failed", status: res.status }, { status: res.status });
    }
    const data = await res.json();

    const node = data?.node;
    if (!node) {
      return NextResponse.json({ error: "App not found in response" }, { status: 404 });
    }

    const file = node.file || node.data?.file;
    if (!file?.path) {
      return NextResponse.json({ error: "No downloadable file found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: node.id,
      name: node.name,
      package: node.package,
      version: file.vername,
      size: file.filesize,
      md5sum: file.md5sum,
      download_url: file.path, // ✅ always send this
      mirror_url: file.path_alt || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Download failed", details: err.message }, { status: 500 });
  }
        }
