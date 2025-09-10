// app/api/keepalive/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Very small, fast JSON response
  return NextResponse.json({
    status: "ok",
    ts: new Date().toISOString(),
  });
  }
