"use client";

import Link from "next/link";
import { Mail, Phone, Github, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-white/10 backdrop-blur-md border-t border-white/20 text-white px-6 py-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
            TEVONA
          </span>
          <span className="text-sm text-gray-300">Youth Hub</span>
        </div>

        {/* Center: Links */}
        <div className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-pink-400 transition">Home</Link>
          <Link href="/dashboard" className="hover:text-green-400 transition">Dashboard</Link>
          <Link href="/ai" className="hover:text-blue-400 transition">AI</Link>
          <Link href="/ephoto" className="hover:text-purple-400 transition">Ephoto</Link>
        </div>

        {/* Right: Contact */}
        <div className="flex flex-col items-center md:items-end gap-2 text-sm">
          <div className="flex items-center gap-2 hover:text-green-400 transition">
            <MessageCircle size={16} />
            <a href="https://wa.me/254758476795" target="_blank" rel="noopener noreferrer">
              +254 758 476 795
            </a>
          </div>
          <div className="flex items-center gap-2 hover:text-yellow-400 transition">
            <Mail size={16} />
            <a href="mailto:tevona09@gmail.com">tevona09@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-6 pt-4 border-t border-white/20 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Tevona. Built with ❤️ by Tracker Wanga. All Rights Reserved.
      </div>
    </footer>
  );
}
