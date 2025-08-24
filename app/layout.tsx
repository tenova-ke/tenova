// app/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ✅ Google font (Poppins for youth/tech vibe)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Tevona Hub",
  description: "Next-Gen Youth Hub • Downloads • AI • Creativity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans relative overflow-x-hidden">
        
        {/* 🔥 Navbar */}
        <Navbar />

        {/* 🌌 Main Content */}
        <main className="flex-1 pt-20 pb-16 px-4 md:px-10">
          {children}
        </main>

        {/* ⚡ Footer */}
        <Footer />

        {/* 🌟 Subtle background glow */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 opacity-20 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
      </body>
    </html>
  );
  }
