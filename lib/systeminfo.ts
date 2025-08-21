import si from "systeminformation";
import publicIp from "public-ip";
import geoip from "geoip-lite";
import dayjs from "dayjs";

export async function getSystemInfo() {
  const cpu = await si.cpu();
  const mem = await si.mem();
  const os = await si.osInfo();
  const ip = await publicIp.v4();
  const geo = geoip.lookup(ip || "") || {};

  return {
    time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    os: os.distro,
    cpu: cpu.brand,
    totalMem: (mem.total / 1e9).toFixed(2) + " GB",
    ip,
    geo
  };
    }
