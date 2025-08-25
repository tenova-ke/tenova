import "./music.css";
import { ReactNode } from "react";
import { Music } from "lucide-react";

const icons = ["🎺","🎷","🎹","🎧","🎙️","🎸","🪕","🎻","🥁","🎛️","🎚️","🎤","🔊","📢","📯","🔉","🔈","🎶","🎵","🎼"];

export default function MusicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="music-layout">
      {/* Floating icons */}
      {icons.map((icon, i) => (
        <span
          key={i}
          className="icon"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${10 + Math.random() * 10}s`,
            fontSize: `${1.5 + Math.random() * 2}rem`,
          }}
        >
          {icon}
        </span>
      ))}

      {/* Navbar */}
      <nav className="flex items-center justify-center py-4 bg-black/50 backdrop-blur-md border-b border-white/20">
        <Music className="text-pink-400 mr-2" size={24} />
        <span className="font-bold text-xl">Tevona Music</span>
      </nav>

      {/* Page Content */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
