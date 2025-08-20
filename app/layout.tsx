// app/layout.tsx (Next.js 14+ App Router)
import { Inter, Poppins, Fira_Code } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400","600","700"], variable: "--font-poppins" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira" });

export const metadata = {
  title: "Tevona",
  description: "Creative hub for downloads, coding, and more."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${firaCode.variable}`}>
      <body className="bg-brand-dark text-brand-text">{children}</body>
    </html>
  );
}
