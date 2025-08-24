"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Music, Download, Cpu, Users } from "lucide-react";

export default function DashboardPage() {
  const tools = [
    {
      title: "🎵 Music",
      desc: "Stream & discover random songs",
      icon: <Music className="w-8 h-8 text-pink-400" />,
      href: "/dashboard/music",
    },
    {
      title: "⬇️ Downloads",
      desc: "YouTube, Spotify, Docs & more",
      icon: <Download className="w-8 h-8 text-yellow-400" />,
      href: "/dashboard/downloads",
    },
    {
      title: "🤖 AI Tools",
      desc: "Text, Images & creative utilities",
      icon: <Cpu className="w-8 h-8 text-blue-400" />,
      href: "/dashboard/ai",
    },
    {
      title: "🌍 Community",
      desc: "Share, connect, grow together",
      icon: <Users className="w-8 h-8 text-green-400" />,
      href: "/dashboard/community",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
          Welcome to Your Dashboard 🚀
        </h1>
        <p className="mt-3 text-gray-300">
          Explore tools, create, and have fun — all in one hub.
        </p>
      </motion.div>

      {/* Tools Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/10 rounded-2xl shadow-lg border border-white/20 backdrop-blur-lg hover:border-pink-400/40 transition"
          >
            <div className="flex items-center gap-4 mb-4">
              {tool.icon}
              <h2 className="text-xl font-bold">{tool.title}</h2>
            </div>
            <p className="text-gray-300 mb-4">{tool.desc}</p>
            <Link
              href={tool.href}
              className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 text-black font-semibold hover:opacity-90 transition"
            >
              Open
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Motivation Stats Placeholder */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-green-400 mb-6">
          📊 Motivation Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-white/10 rounded-xl">This Month: 12K visits</div>
          <div className="p-4 bg-white/10 rounded-xl">This Week: 3.5K visits</div>
          <div className="p-4 bg-white/10 rounded-xl">Today: 480 visits</div>
          <div className="p-4 bg-white/10 rounded-xl">Most Requested: Spotify</div>
        </div>
      </section>
    </main>
  );
      }
