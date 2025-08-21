// lib/systemInfo.ts
import si from "systeminformation";

export async function getSystemInfo() {
  const cpu = await si.cpu();
  const mem = await si.mem();
  const os = await si.osInfo();

  return {
    cpu: cpu.manufacturer + " " + cpu.brand,
    cores: cpu.cores,
    memory: (mem.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
    os: os.distro + " " + os.release,
  };
}
