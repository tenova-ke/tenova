import { NextResponse } from "next/server";
import { runCode } from "@/lib";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const result = runCode(code);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
