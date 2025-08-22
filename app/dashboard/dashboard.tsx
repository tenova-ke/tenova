"use client";
import { useEffect, useRef, useState } from "react";

const SONGS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
  "https://www.youtube.com/watch?v=ktvTqknDobU"
];

export default function DashboardMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [song, setSong] = useState<string | null>(null);

  useEffect(() => {
    // pick random song
    const randomSong = SONGS[Math.floor(Math.random() * SONGS.length)];
    setSong(`/api/stream?url=${encodeURIComponent(randomSong)}`);
  }, []);

  useEffect(() => {
    const tryPlay = async () => {
      try {
        await audioRef.current?.play();
      } catch {
        console.log("Autoplay blocked, waiting for user interaction");
      }
    };
    if (song) tryPlay();
  }, [song]);

  return (
    <div className="p-4 text-center">
      {song && (
        <audio
          ref={audioRef}
          autoPlay
          controls
          src={song}
        />
      )}
    </div>
  );
}
