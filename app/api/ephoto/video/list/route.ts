import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data/ephoto/video.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 500, error: "Failed to load video effects" },
      { status: 500 }
    );
  }
}
