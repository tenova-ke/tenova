// app/dashboard/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Music } from "lucide-react";

const SONGS = [
  "/music/song1.mp3",
  "/music/song2.mp3",
  "/music/song3.mp3",
];

export default function Dashboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [song, setSong] = useState<string | null>(null);

  useEffect(() => {
    // pick random song
    const randomSong = SONGS[Math.floor(Math.random() * SONGS.length)];
    setSong(randomSong);
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
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🎛️ Tevona Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Music className="w-5 h-5" />
          <span>Now Playing</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl mb-2 font-semibold">Music Player</h2>
          {song && (
            <audio
              ref={audioRef}
              autoPlay
              controls
              src={song}
              className="w-full mt-2"
            />
          )}
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl mb-2 font-semibold">System Info</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl mb-2 font-semibold">Geo Info</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl mb-2 font-semibold">Scraper Tool</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </section>
    </main>
  );
}
