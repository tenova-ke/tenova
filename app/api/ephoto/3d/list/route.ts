import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data/ephoto/3d.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);

    return NextResponse.json(jsonData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        creator: "Tracker Wanga",
        project: "Tevona",
        message: "Failed to load 3D Effects list",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
