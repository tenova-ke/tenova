"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Activity,
  MemoryStick,
  Globe,
  Server,
  RefreshCcw,
} from "lucide-react";

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

  if (!stats)
    return (
      <p className="text-center text-gray-400 animate-pulse">
        Loading server stats...
      </p>
    );

  const statCards = [
    {
      icon: <Server size={28} className="text-sky-400" />,
      label: "Uptime",
      value: stats.runtime,
      color: "from-sky-900/40 to-sky-600/20",
    },
    {
      icon: <MemoryStick size={28} className="text-green-400" />,
      label: "RAM Usage",
      value: `${stats.ram.used} / ${stats.ram.total} GB`,
      color: "from-green-900/40 to-green-600/20",
    },
    {
      icon: <Cpu size={28} className="text-pink-400" />,
      label: "CPU Load",
      value: `${stats.cpuLoad}%`,
      color: "from-pink-900/40 to-pink-600/20",
    },
    {
      icon: <Globe size={28} className="text-teal-400" />,
      label: "Public IP",
      value: stats.ip,
      color: "from-teal-900/40 to-teal-600/20",
    },
    {
      icon: <Activity size={28} className="text-yellow-400" />,
      label: "API Status",
      value: stats.status,
      sub: `Response: ${stats.response}`,
      color: "from-yellow-900/40 to-yellow-600/20",
    },
    {
      icon: <RefreshCcw size={28} className="text-purple-400" />,
      label: "Last Updated",
      value: new Date(stats.refreshed).toLocaleTimeString(),
      color: "from-purple-900/40 to-purple-600/20",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 p-6">
      {statCards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          whileHover={{ scale: 1.05 }}
          className={`p-5 rounded-2xl shadow-lg border border-white/20 
            bg-gradient-to-br ${card.color} backdrop-blur-xl`}
        >
          <div className="flex items-center gap-3">
            {card.icon}
            <h3 className="text-lg font-bold text-white drop-shadow-sm">
              {card.label}
            </h3>
          </div>
          <p className="text-2xl text-white font-extrabold mt-3">
            {card.value}
          </p>
          {card.sub && (
            <p className="text-sm text-gray-300 mt-1 italic">{card.sub}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
  }
