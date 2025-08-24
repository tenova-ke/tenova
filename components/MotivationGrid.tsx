"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Stat {
  label: string;
  value: number;
  icon: string;
}

export default function MotivationGrid() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    // Fake dynamic data for now (replace with API later)
    setStats([
      { label: "This Month’s Visits", value: 15420, icon: "📅" },
      { label: "This Week’s Visits", value: 4321, icon: "📊" },
      { label: "Today’s Visits", value: 312, icon: "📆" },
      { label: "Total Requests", value: 89120, icon: "⚡" },
      { label: "This Week’s Most Requested Tool", value: 0, icon: "🔥" },
    ]);
  }, []);

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 px-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-700/40 via-pink-600/30 to-blue-700/30 
            backdrop-blur-lg border border-white/10 shadow-lg hover:scale-105 hover:shadow-neon transition-transform"
        >
          <div className="text-4xl">{stat.icon}</div>

          {/* Animated Numbers */}
          {stat.label === "This Week’s Most Requested Tool" ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-yellow-400 mt-3"
            >
              Spotify Downloader 🎶
            </motion.p>
          ) : (
            <motion.h2
              key={stat.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="text-2xl font-extrabold text-white mt-3"
            >
              {stat.value.toLocaleString()}
            </motion.h2>
          )}

          <p className="text-sm text-gray-300 mt-2">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
