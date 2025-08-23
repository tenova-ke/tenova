// scripts/scrape-ephoto-logo.ts
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://en.ephoto360.com";
const LOGO_URL = `${BASE_URL}/tags/make-logo-online`;

async function scrapeLogos() {
  let results: any[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const url = page === 1 ? LOGO_URL : `${LOGO_URL}/${page}`;
    console.log(`Fetching: ${url}`);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Find each tool card
    $(".list_effect > li").each((_, el) => {
      const title = $(el).find("a h3").text().trim();
      const href = $(el).find("a").attr("href");
      const thumbnail = $(el).find("img").attr("src");

      if (href && title) {
        results.push({
          title,
          url: BASE_URL + href,
          thumbnail: thumbnail?.startsWith("http") ? thumbnail : BASE_URL + thumbnail,
        });
      }
    });

    // Check if "next page" exists
    const nextLink = $(".pagination .next").length > 0;
    hasNext = nextLink;
    page++;
  }

  // Save JSON file
  fs.writeFileSync("ephoto_logo_tools.json", JSON.stringify(results, null, 2));
  console.log(`✅ Scraped ${results.length} logo tools!`);
}

scrapeLogos().catch(console.error);
