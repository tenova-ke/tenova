"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Cpu, Server, Gauge, HardDrive } from "lucide-react";

interface Stats {
  status: string;
  ip: string;
  cpu: string;
  cores: number;
  memory: {
    total: number;
    free: number;
  };
  timestamp: string;
}

export default function SystemInfo() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-white">
        Loading system stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        Failed to load stats ❌
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Public IP */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_20px_#00FF9F]">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Server className="w-10 h-10 text-[#00FF9F] mb-3" />
          <h2 className="text-lg font-semibold text-white">Public IP</h2>
          <p className="text-xl mt-2 text-[#00FF9F]">{stats.ip}</p>
        </CardContent>
      </Card>

      {/* CPU */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_20px_#9D00FF]">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Cpu className="w-10 h-10 text-[#9D00FF] mb-3" />
          <h2 className="text-lg font-semibold text-white">CPU</h2>
          <p className="text-sm mt-2">{stats.cpu}</p>
          <p className="text-sm text-gray-400">{stats.cores} Cores</p>
        </CardContent>
      </Card>

      {/* Memory */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_20px_#00CFFF]">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <HardDrive className="w-10 h-10 text-[#00CFFF] mb-3" />
          <h2 className="text-lg font-semibold text-white">Memory</h2>
          <p className="mt-2 text-[#00CFFF]">
            {(stats.memory.free / 1024 / 1024 / 1024).toFixed(2)} GB free
          </p>
          <p className="text-sm text-gray-400">
            of {(stats.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_20px_#FFD700] md:col-span-2">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Gauge className="w-10 h-10 text-[#FFD700] mb-3" />
          <h2 className="text-lg font-semibold text-white">Last Updated</h2>
          <p className="mt-2 text-gray-300">
            {new Date(stats.timestamp).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
