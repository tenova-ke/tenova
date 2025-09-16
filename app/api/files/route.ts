// app/api/files/route.ts
import { NextResponse } from "next/server";

const data = [
  // same structure as sampleData above, or generate dynamically from your storage
  { name: "ai", createdAt: new Date().toISOString() },
  /* ... */
];

export async function GET() {
  return NextResponse.json({ files: data });
}
