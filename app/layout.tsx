import "../globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteShell from "./site-shell";

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
      <body className="min-h-[100dvh] min-w-[100vw] bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#24243e] text-white overflow-x-hidden flex flex-col">
        {/* Shell decides whether to show global nav/footer (hidden on /music) */}
        <SiteShell navbar={<Navbar />} footer={<Footer />}>
          <main className="flex-1 w-full flex flex-col items-center justify-start px-4 md:px-10 pt-20 pb-16 z-10">
            {children}
          </main>
        </SiteShell>

        {/* Modern subtle background glow */}
        <div className="pointer-events-none fixed top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/25 via-yellow-400/18 to-blue-500/22 opacity-30 blur-[150px] rounded-full z-0" />
      </body>
    </html>
  );
}
