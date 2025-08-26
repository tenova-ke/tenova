import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pkg = searchParams.get("package");

    if (!id && !pkg) {
      return NextResponse.json({ error: "Missing id or package parameter" }, { status: 400 });
    }

    // List of possible endpoints Aptoide uses
    const endpoints: string[] = [];

    if (id) {
      endpoints.push(`https://ws75.aptoide.com/api/7/app/get/id:${id}`);
      endpoints.push(`https://ws75.aptoide.com/api/7/app/get/app_id=${id}`);
      endpoints.push(`https://ws75.aptoide.com/api/7/app/get/apk_id=${id}`);
    }
    if (pkg) {
      endpoints.push(`https://ws75.aptoide.com/api/7/app/get/package:${pkg}`);
      endpoints.push(`https://ws75.aptoide.com/api/7/app/get/name=${pkg}`);
    }

    let data: any = null;
    let lastStatus = 0;

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        lastStatus = res.status;
        if (!res.ok) continue;

        const json = await res.json();
        const node = json?.node || json?.data;
        const file = node?.file || node?.data?.file;
        if (file?.path) {
          data = { node, file };
          break;
        }
      } catch {
        continue;
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: "No valid Aptoide response", lastStatus },
        { status: lastStatus || 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.node.id,
      name: data.node.name,
      package: data.node.package,
      version: data.file.vername,
      size: data.file.filesize,
      md5sum: data.file.md5sum,
      download_url: data.file.path,
      mirror_url: data.file.path_alt || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Download failed", details: err.message },
      { status: 500 }
    );
  }
}
