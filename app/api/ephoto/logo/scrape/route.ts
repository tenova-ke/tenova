// app/api/ephoto/logo/scrape/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BASE_URL = "https://en.ephoto360.com";

export async function GET() {
  try {
    // Load the logo category page
    const res = await fetch(`${BASE_URL}/logo.html`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TevonaBot/1.0)",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: { name: string; link: string; thumbnail: string }[] = [];

    // Grab all logo tools
    $(".list_effect .item").each((_, el) => {
      const name = $(el).find("a").attr("title") || "";
      const link = BASE_URL + ($(el).find("a").attr("href") || "");
      const thumbnail = $(el).find("img").attr("src") || "";

      if (name && link) {
        results.push({ name, link, thumbnail });
      }
    });

    return NextResponse.json({
      status: 200,
      success: true,
      tools: results,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 500,
      error: "Failed to scrape logo tools",
      details: err.message,
    });
  }
}
