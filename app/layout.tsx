// app/layout.tsx
// 🔹 Root layout applied to all pages

import "@/styles/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Tevona",
  description: "Creative tools, downloads, and community hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-dark text-brand-text min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
