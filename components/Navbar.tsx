"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-3 flex items-center justify-between 
        bg-gradient-to-r from-purple-900/90 via-black/80 to-purple-950/90 
        backdrop-blur-xl shadow-lg border-b border-purple-700/40">
        
        {/* Left: Profile + Logo */}
        <div className="flex items-center gap-4">
          {/* Profile Avatar with Neon Ring */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden 
            border-4 border-transparent bg-clip-border 
            animate-spin-slow bg-gradient-to-tr from-pink-500 via-yellow-400 to-blue-500 shadow-xl">
            <Image
              src="/profile/tevona.jpg"
              alt="Profile"
              fill
              className="object-cover rounded-full"
            />
          </div>

          {/* Logo Text */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-wider 
              bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 
              bg-clip-text text-transparent drop-shadow-lg">
              TEVONA
            </h1>
            <span className="text-sm text-purple-300 font-medium tracking-wide">
              Next-Gen Intelligence Hub
            </span>
          </div>
        </div>

        {/* Right: Hamburger Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white/10 hover:bg-white/20 
            border border-white/20 text-white transition"
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Sidebar (slide-in) */}
      {isOpen && (
        <div className="fixed top-0 right-0 w-64 h-full z-40 
          bg-gradient-to-b from-purple-950/95 via-black/90 to-purple-900/95 
          shadow-2xl border-l border-purple-700/40 p-6 
          animate-slide-in">
          <h2 className="text-lg font-bold text-white mb-6">Menu</h2>
          <ul className="space-y-4">
            <li className="hover:text-pink-400 transition cursor-pointer">Home</li>
            <li className="hover:text-green-400 transition cursor-pointer">Downloads</li>
            <li className="hover:text-blue-400 transition cursor-pointer">AI Tools</li>
            <li className="hover:text-yellow-400 transition cursor-pointer">Community</li>
            <li className="hover:text-purple-400 transition cursor-pointer">About</li>
          </ul>
        </div>
      )}
    </>
  );
    }
