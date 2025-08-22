"use client";
import { useEffect, useState } from "react";

type Stats = {
  runtime: string;
  ram: { used: string; total: string };
  cpuLoad: string;
  ip: string;
  status: string;
  response: string;
  refreshed: string;
};

export default function ServerStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <p className="text-center text-gray-400">Loading stats...</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-sky-900/40 via-teal-800/30 to-green-900/30 rounded-2xl backdrop-blur-lg shadow-lg">
      
      {/* Uptime */}
      <div className="p-4 rounded-xl bg-white/10 shadow-md border border-white/20 text-center">
        <h3 className="text-sky-300 font-bold text-lg">Server Uptime</h3>
        <p className="text-white text-xl mt-2">{stats.runtime}</p>
      </div>

      {/* RAM */}
      <div className="p-4 rounded-xl bg-white/10 shadow-md border border-white/20 text-center">
        <h3 className="text-green-300 font-bold text-lg">RAM Usage</h3>
        <p className="text-white text-xl mt-2">
          {stats.ram.used} GB / {stats.ram.total} GB
        </p>
      </div>

      {/* CPU */}
      <div className="p-4 rounded-xl bg-white/10 shadow-md border border-white/20 text-center">
        <h3 className="text-blue-300 font-bold text-lg">CPU Load</h3>
        <p className="text-white text-xl mt-2">{stats.cpuLoad}%</p>
      </div>

      {/* IP */}
      <div className="p-4 rounded-xl bg-white/10 shadow-md border border-white/20 text-center">
        <h3 className="text-teal-300 font-bold text-lg">Public IP</h3>
        <p className="text-white text-lg mt-2">{stats.ip}</p>
      </div>

      {/* API Status */}
      <div className="p-4 rounded-xl bg-white/10 shadow-md border border-white/20 text-center">
        <h3 className="text-green-400 font-bold text-lg">API Status</h3>
        <p className="text-white text-lg mt-2">{stats.status}</p>
        <p className="text-sm text-gray-300">Response: {stats.response}</p>
      </div>

      {/* Last Refreshed */}
      <div className="p-4 rounded-xl bg-white/10 shadow-md border border-white/20 text-center">
        <h3 className="text-sky-400 font-bold text-lg">Last Updated</h3>
        <p className="text-white text-lg mt-2">
          {new Date(stats.refreshed).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
