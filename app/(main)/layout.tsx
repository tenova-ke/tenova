// app/(main)/layout.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 🔥 Navbar */}
      <Navbar />

      {/* 🌌 Main Content */}
      <main className="flex-1 pt-20 pb-16 px-4 md:px-10">{children}</main>

      {/* ⚡ Footer */}
      <Footer />

      {/* 🌟 Background glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 opacity-20 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
    </div>
  );
}
