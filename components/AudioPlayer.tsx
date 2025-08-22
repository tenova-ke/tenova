"use client";
import { useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { Music } from "lucide-react";

interface StreamResponse {
  status: string;
  message: string;
  url: string;
}

export default function MusicCard() {
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await fetch("https://tevona-api.onrender.com/api/stream");
        const data: StreamResponse = await res.json();
        setSongUrl(data.url);
      } catch (err) {
        console.error("❌ Failed to fetch song:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-white shadow-lg flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center gap-2 text-blue-600 text-xl font-semibold">
        <Music size={22} />
        <span>Now Playing</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading song...</p>
      ) : songUrl ? (
        <AudioPlayer url={songUrl} />
      ) : (
        <p className="text-red-500">⚠️ No song available</p>
      )}
    </div>
  );
}
