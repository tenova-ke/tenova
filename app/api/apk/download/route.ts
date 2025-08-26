import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pkg = searchParams.get("package");

    if (!id && !pkg) {
      return NextResponse.json({ error: "Missing id or package parameter" }, { status: 400 });
    }

    let res;
    if (id) {
      res = await fetch(`https://ws75.aptoide.com/api/7/app/get/id:${id}`);
    }
    if ((!res || !res.ok) && pkg) {
      res = await fetch(`https://ws75.aptoide.com/api/7/app/get/package:${pkg}`);
    }

    if (!res?.ok) {
      return NextResponse.json({ error: "Aptoide API failed", status: res?.status || 500 }, { status: res?.status || 500 });
    }

    const data = await res.json();
    const node = data?.node;
    const file = node?.file || node?.data?.file;

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
      download_url: file.path,
      mirror_url: file.path_alt || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Download failed", details: err.message }, { status: 500 });
  }
}
