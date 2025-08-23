import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, inputs } = await req.json();

    if (!url || !inputs || !Array.isArray(inputs)) {
      return NextResponse.json(
        { status: 400, error: "Missing url or inputs array" },
        { status: 400 }
      );
    }

    // Load the tool page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Find the form
    const form = $("form[action*='create-image']");
    if (!form.length) {
      return NextResponse.json(
        { status: 404, error: "Form not found in tool page" },
        { status: 404 }
      );
    }

    const action = form.attr("action");
    if (!action) {
      return NextResponse.json(
        { status: 404, error: "Form action not found" },
        { status: 404 }
      );
    }

    const params: any = {};
    let inputIndex = 0;

    form.find("input[name], textarea[name]").each((_, el) => {
      const name = $(el).attr("name");
      const type = $(el).attr("type");

      if (!name) return;

      if (type === "text" || $(el).is("textarea")) {
        // Assign user-provided text values in sequence
        if (inputs[inputIndex]) {
          params[name] = inputs[inputIndex];
          inputIndex++;
        }
      } else if (type === "hidden") {
        params[name] = $(el).attr("value") || "";
      }
    });

    // Submit form to generate image
    const submitUrl = url.startsWith("http")
      ? url.split("/").slice(0, 3).join("/") + action
      : "https://en.ephoto360.com" + action;

    const { data: resultHtml } = await axios.post(
      submitUrl,
      new URLSearchParams(params).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Extract image URL
    const $result = cheerio.load(resultHtml);
    const imgUrl = $result(".img-output img").attr("src");

    if (!imgUrl) {
      return NextResponse.json(
        { status: 500, error: "Failed to extract result image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 200,
      creator: "Tracker Wanga",
      project: "Tevona",
      tool: url,
      inputs,
      image: imgUrl.startsWith("http")
        ? imgUrl
        : "https://en.ephoto360.com" + imgUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 500, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
