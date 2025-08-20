// components/Navbar.tsx
// 🔹 Top navigation bar

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <motion.header
      className="bg-brand-card/60 backdrop-blur-lg border-b border-brand-accent/20 sticky top-0 z-50"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link href="/" className="font-bold text-xl text-brand-accent">
          🚀 Tevona
        </Link>

        <nav className="flex gap-6">
          <Link href="/downloads">Downloads</Link>
          <Link href="/community">Community</Link>
          <Link href="/tools">Tools</Link>
        </nav>

        <Button variant="primary">Sign In</Button>
      </div>
    </motion.header>
  );
}
