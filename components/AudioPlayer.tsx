"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  url?: string; // ✅ optional so it works even if no prop is passed
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay blocked:", err.message);
        setIsPlaying(false);
      });
    }
  }, [url]); // ✅ re-run when url changes

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center gap-3 border rounded-xl bg-card shadow-md">
      <audio
        ref={audioRef}
        src={url || "/api/stream"} // ✅ use passed url OR fallback
        autoPlay
      />
      <button
        onClick={togglePlay}
        className="px-4 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
