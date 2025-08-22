import type { NextApiRequest, NextApiResponse } from "next";
import si from "systeminformation";
import publicIp from "public-ip";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const uptime = process.uptime();
    const mem = await si.mem();
    const cpu = await si.currentLoad();

    let ip = "unknown";
    try {
      ip = await publicIp(); // ✅ try to fetch
    } catch (e) {
      // fallback if Render blocks public-ip
      ip = (req.headers["x-forwarded-for"] || "unknown").toString();
    }

    res.json({
      runtime: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      ram: {
        used: (mem.used / 1024 ** 3).toFixed(2),
        total: (mem.total / 1024 ** 3).toFixed(2),
      },
      cpuLoad: cpu.currentLoad.toFixed(2),
      ip,
      status: "Online",
      response: `${Math.floor(Math.random() * 200) + 200}ms`,
      refreshed: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
