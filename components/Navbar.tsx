"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-card px-6 py-4 flex items-center justify-between">
      {/* Left: Profile Image */}
      <div className="flex items-center gap-3">
        <Image
          src="/profile/IMG-20250821-WA0021.jpg"
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full border-2 border-[var(--accent-green)] shadow-lg"
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-wider text-accent-green">
            TEVONA
          </h1>
          <span className="text-sm text-accent-purple font-medium tracking-wide">
            Next-Gen Intelligence Hub
          </span>
        </div>
      </div>
    </nav>
  );
}
