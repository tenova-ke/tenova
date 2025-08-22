import type { NextApiRequest, NextApiResponse } from "next";
import { publicIpv4 } from "public-ip";
import si from "systeminformation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let ip = "unknown";
    try {
      ip = await publicIpv4(); // ✅ modern API works with v6.0.1
    } catch (e) {
      // fallback if Render blocks IP lookup
      ip = (req.headers["x-forwarded-for"] || "unknown").toString();
    }

    const cpu = await si.cpu();
    const mem = await si.mem();

    res.status(200).json({
      status: "ok",
      ip,
      cpu: cpu.brand,
      cores: cpu.cores,
      memory: {
        total: mem.total,
        free: mem.free,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
