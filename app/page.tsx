"use client";

import Slideshow from "@/components/Slideshow";
import MotivationGrid from "@/components/MotivationGrid";
import slides from "@/lib/slides";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-28 pb-16 text-center px-6">
        <Slideshow />

        {/* Title + Explore Button */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold mt-10 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400"
        >
          Welcome to Tevona Hub
        </motion.h1>

        <p className="mt-4 text-lg text-gray-300">
          Explore tools like Image Generator, Text to PDF, Music & Video Downloads, Ephoto Effects and more
        </p>

        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-8 py-4 bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 
              text-black font-bold rounded-full shadow-lg hover:shadow-neon transition"
          >
            🚀 Explore Dashboard
          </motion.button>
        </Link>
      </section>

      {/* Advertise Section */}
      <section className="py-12 px-6 text-center bg-black/20 backdrop-blur-lg">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-yellow-400"
        >
          Advertise With Us
        </motion.h2>
        <p className="mt-4 text-gray-300">
          Post your banners and business with us. Contact <span className="text-pink-400">Wanga</span> to get started.
        </p>
      </section>

      {/* Showcase Slides */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">🔥 Community Highlights</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {slides.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition"
            >
              <Image
                src={img}
                alt={`slide-${idx}`}
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Motivation Stats */}
      <section className="py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-center text-green-400 mb-10"
        >
          📊 Tevona Motivation Numbers
        </motion.h2>
        <MotivationGrid />
      </section>
    </main>
  );
      }
