"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slides from "@/lib/slides";

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent">
      {/* Image */}
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[400px]"
      >
        <Image
          src={slides[current].image}
          alt={`slide-${current}`}
          fill
          priority
          className="object-cover"
        />

        {/* Caption Overlay */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white text-2xl font-bold drop-shadow-lg"
          >
            {slides[current].title}
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-sm mt-2"
          >
            {slides[current].subtitle}
          </motion.p>
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-pink-500/70 transition shadow-lg"
      >
        <ChevronLeft size={22} className="text-white" />
      </button>
      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-pink-500/70 transition shadow-lg"
      >
        <ChevronRight size={22} className="text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center gap-3">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setCurrent(idx)}
            whileHover={{ scale: 1.3 }}
            className={`w-3 h-3 rounded-full transition-all shadow-lg ${
              idx === current
                ? "bg-pink-500 shadow-pink-500/70"
                : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
        }
