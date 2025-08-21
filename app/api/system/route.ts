import { NextResponse } from "next/server";
import { getSystemInfo } from "@/lib";

export async function GET() {
  try {
    const info = await getSystemInfo();
    return NextResponse.json(info);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
