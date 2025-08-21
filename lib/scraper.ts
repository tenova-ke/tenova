// lib/scraper.ts
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeHTML(url: string) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("title").text(); // Example: return the page title
  }
