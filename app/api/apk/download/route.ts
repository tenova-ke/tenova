import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const res = await fetch(`https://ws75.aptoide.com/api/7/app/get/id:${id}`);
    const data = await res.json();

    if (!data?.node?.package) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const file = data.node.file;

    return NextResponse.json({
      success: true,
      id: data.node.id,
      name: data.node.name,
      package: data.node.package,
      version: file.vername,
      size: file.filesize,
      md5sum: file.md5sum,
      download_url: file.path, // actual link
      mirror_url: file.path_alt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Download failed", details: err.message }, { status: 500 });
  }
}
