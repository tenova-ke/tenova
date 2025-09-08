// app/api/healthz/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Optionally, you can add extra checks here:
  // e.g. DB connectivity, external API availability, etc.
  return NextResponse.json({
    status: "ok",
    timestamp: Date.now(),
  });
}
