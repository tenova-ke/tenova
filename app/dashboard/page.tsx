"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
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

export default function DashboardPage() {
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
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-slate-200">
        Loading system stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen text-red-400 font-semibold">
        Failed to load stats ❌
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 System Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center">
            <Server className="w-10 h-10 text-teal-400 mb-3" />
            <h2 className="text-lg font-semibold">Public IP</h2>
            <p className="text-xl mt-2">{stats.ip}</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center">
            <Cpu className="w-10 h-10 text-green-400 mb-3" />
            <h2 className="text-lg font-semibold">CPU</h2>
            <p className="text-sm mt-2">{stats.cpu}</p>
            <p className="text-sm text-slate-400">{stats.cores} Cores</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center">
            <HardDrive className="w-10 h-10 text-blue-400 mb-3" />
            <h2 className="text-lg font-semibold">Memory</h2>
            <p className="mt-2">
              {(stats.memory.free / 1024 / 1024 / 1024).toFixed(2)} GB free
            </p>
            <p className="text-sm text-slate-400">
              of {(stats.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl md:col-span-2">
          <CardContent className="p-6 flex flex-col items-center">
            <Gauge className="w-10 h-10 text-yellow-400 mb-3" />
            <h2 className="text-lg font-semibold">Last Updated</h2>
            <p className="mt-2">{new Date(stats.timestamp).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
        }
