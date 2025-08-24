"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          {/* Inline SVG Logo */}
          <svg
            className="h-10 w-10"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4D6D" />
                <stop offset="50%" stopColor="#FF914D" />
                <stop offset="100%" stopColor="#FACC15" />
              </linearGradient>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF4D6D" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <circle
              cx="200"
              cy="200"
              r="180"
              stroke="url(#ringGradient)"
              strokeWidth="8"
              fill="none"
            />
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              fontFamily="Poppins, sans-serif"
              fontSize="70"
              fontWeight="800"
              fill="url(#textGradient)"
              stroke="#111"
              strokeWidth="2"
            >
              T
            </text>
          </svg>
          <span className="text-lg font-extrabold bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
            TEVONA
          </span>
        </Link>
      </div>

      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-white/20 transition"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      {open && (
        <div className="fixed top-0 right-0 h-full w-64 bg-white/10 backdrop-blur-md border-l border-white/20 shadow-xl z-50 p-6 flex flex-col gap-6 animate-slideIn">
          <button onClick={() => setOpen(false)} className="self-end">
            <X className="w-6 h-6 text-white" />
          </button>
          <Link href="/dashboard" className="hover:text-pink-400 transition">Dashboard</Link>
          <Link href="/spotify" className="hover:text-green-400 transition">Spotify</Link>
          <Link href="/video" className="hover:text-red-400 transition">Video</Link>
          <Link href="/apk" className="hover:text-yellow-400 transition">APK</Link>
          <Link href="/ephoto" className="hover:text-blue-400 transition">Ephoto</Link>
          <Link href="/ai" className="hover:text-purple-400 transition">AI Assistant</Link>
        </div>
      )}
    </nav>
  );
          }
