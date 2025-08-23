import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url, inputs } = await req.json();
    if (!url || !inputs || typeof inputs !== "object") {
      return NextResponse.json(
        { status: 400, error: "Missing url or inputs object" },
        { status: 400 }
      );
    }

    // Load page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Grab CSRF token
    const token = $('input[name="token"]').attr("value");

    // Prepare form data
    const formData: any = { token };
    for (const [key, value] of Object.entries(inputs)) {
      formData[key] = value;
    }

    // Submit
    const submitUrl = url.replace(".html", "");
    const { data: resultPage } = await axios.post(submitUrl, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const $$ = cheerio.load(resultPage);

    // Find generated media (video or gif)
    const videoUrl =
      $$("video source").attr("src") ||
      $$("a[href$='.mp4']").attr("href") ||
      $$("img").attr("src");

    if (!videoUrl) {
      return NextResponse.json(
        { status: 500, error: "Failed to extract video" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 200,
      creator: "Tracker Wanga",
      project: "Tevona",
      type: "video",
      result: { video_url: videoUrl.startsWith("http") ? videoUrl : `https://en.ephoto360.com${videoUrl}` },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 500, error: (error as Error).message },
      { status: 500 }
    );
  }
}
