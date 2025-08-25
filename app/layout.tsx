import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteShell from "./site-shell"; // client wrapper that checks the route

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Tevona Hub",
  description: "Next-Gen Youth Hub • Downloads • AI • Creativity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-[100svh] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden">
        {/* Shell decides whether to show global nav/footer (hidden on /music) */}
        <SiteShell navbar={<Navbar />} footer={<Footer />}>{children}</SiteShell>

        {/* subtle glow */}
        <div className="pointer-events-none fixed top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-r from-pink-500/30 via-yellow-400/25 to-blue-500/30 blur-[140px] rounded-full" />
      </body>
    </html>
  );
}
