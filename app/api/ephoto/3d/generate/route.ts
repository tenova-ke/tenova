import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

const TOOLS: Record<string, string> = {
  "Wooden 3D Text Effect": "https://en.ephoto360.com/wooden-3d-text-effect-59.html",
  "3D Text Effect": "https://en.ephoto360.com/3d-text-effect-172.html",
  "3D Cubic Text Effect Online": "https://en.ephoto360.com/3d-cubic-text-effect-online-88.html",
  "Free 3D Hologram Text Effect": "https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html",
  "Text Metal 3D (Metallic Effect)": "https://en.ephoto360.com/text-metal-3d-277.html",
  "3D Silver Text Effect": "https://en.ephoto360.com/3d-silver-text-effect-273.html",
  "3D Shiny Metallic Text Effect Online": "https://en.ephoto360.com/create-a-3d-shiny-metallic-text-effect-online-685.html",
  "3D Photo Effects for Facebook (Depth Map)": "https://en.ephoto360.com/3d-photo-effects-for-facebook-digital-camera-theme-412.html",
  "3D Gradient Text Effect Online": "https://en.ephoto360.com/create-3d-gradient-text-effect-online-686.html",
  "Glossy Silver 3D Text Effect Online": "https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html",
};

// Extract tool ID and required inputs
async function extractToolInfo(url: string): Promise<{ id: string; inputs: number }> {
  const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(data);

  const formId = $("form input[name=id]").attr("value");
  const inputsCount = $("form input[name='text[]']").length;

  return {
    id: formId || "",
    inputs: inputsCount || 1,
  };
}

async function generateImage(toolUrl: string, texts: string[]) {
  try {
    const { id, inputs } = await extractToolInfo(toolUrl);
    if (!id) return { success: false, error: "Tool ID not found" };

    // Ensure correct number of texts
    const filledTexts = [...texts];
    while (filledTexts.length < inputs) {
      filledTexts.push(""); // Fill empty if user gave fewer
    }

    const endpoint = "https://en.ephoto360.com/effect/create-image";
    const payload = new URLSearchParams();
    payload.append("id", id);
    filledTexts.forEach(t => payload.append("text[]", t));
    payload.append("submit", "Go");

    const { data } = await axios.post(endpoint, payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (data?.success && data?.image) {
      return { success: true, image_url: data.image };
    }

    return { success: false, error: "Failed to generate image" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool, texts } = body;

    if (!tool || !texts) {
      return NextResponse.json({ status: 400, error: "Missing tool or texts" });
    }

    if (!Array.isArray(texts)) {
      return NextResponse.json({ status: 400, error: "Texts must be an array" });
    }

    const toolUrl = TOOLS[tool];
    if (!toolUrl) {
      return NextResponse.json({ status: 404, error: "Tool not found" });
    }

    const result = await generateImage(toolUrl, texts);

    return NextResponse.json({
      status: result.success ? 200 : 500,
      creator: "Tracker Wanga",
      project: "Tevona",
      category: "3D Effects",
      tool,
      input: texts,
      output: result,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 500, error: err.message });
  }
}
