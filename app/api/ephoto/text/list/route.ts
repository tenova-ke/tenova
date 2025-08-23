import { NextResponse } from "next/server";
import textTools from "@/data/ephoto/text.json";

export async function GET() {
  return NextResponse.json(textTools);
}
