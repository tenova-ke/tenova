import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://en.ephoto360.com";
const LOGO_URL = `${BASE_URL}/tags/make-logo-online`;

export async function GET() {
  try {
    let results: any[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const url = page === 1 ? LOGO_URL : `${LOGO_URL}/${page}`;
      console.log(`Fetching: ${url}`);

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $(".list_effect > li").each((_, el) => {
        const title = $(el).find("a h3").text().trim();
        const href = $(el).find("a").attr("href");
        const thumbnail = $(el).find("img").attr("src");

        if (href && title) {
          results.push({
            title,
            url: BASE_URL + href,
            thumbnail: thumbnail?.startsWith("http")
              ? thumbnail
              : BASE_URL + thumbnail,
          });
        }
      });

      // Detect "next page"
      const nextLink = $(".pagination .next").length > 0;
      hasNext = nextLink;
      page++;
    }

    return NextResponse.json({
      status: 200,
      count: results.length,
      tools: results,
    });
  } catch (err: any) {
    console.error("❌ Error scraping logo tools:", err.message);
    return NextResponse.json({ status: 500, error: err.message });
  }
  }
