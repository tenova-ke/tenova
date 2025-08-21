// components/PopupGrid.tsx
"use client";
import { useState, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";

const apiEndpoints = [
  "https://api.giftedtech.web.id/api/download/ytdlv2?apikey=gifted&url=https%3A%2F%2Fyoutu.be%2F60ItHLz5WEA%3Ffeature%3Dshared",
  "https://api.giftedtech.web.id/api/download/ytdl?apikey=gifted&url=https%3A%2F%2Fyoutu.be%2F60ItHLz5WEA%3Ffeature%3Dshared",
  "https://api.giftedtech.web.id/api/download/ytaudio?apikey=gifted&format=128kbps&url=https%3A%2F%2Fyoutu.be%2F60ItHLz5WEA%3Ffeature%3Dshared",
  "https://api.giftedtech.web.id/api/download/ytmusic?apikey=gifted&quality=128kbps&url=https%3A%2F%2Fyoutu.be%2FqF-JLqKtr2Q%3Ffeature%3Dshared"
];

export default function PopupGrid() {
  const [open, setOpen] = useState(true);
  const [playUrl, setPlayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setPlayUrl(null);
  }, [open]);

  const startPlaying = () => {
    const random = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
    setPlayUrl(random);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/50 shadow-[0_0_20px_#22d3ee] rounded-2xl p-6 w-80 text-center">
        <h2 className="text-xl font-bold text-cyan-300 mb-4">Welcome to Tevona</h2>
        <div className="grid gap-4">
          <button
            onClick={startPlaying}
            className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500"
          >
            ▶ Start Playing
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500"
          >
            ✖ Exit
          </button>
        </div>
        {playUrl && <AudioPlayer url={playUrl} />}
      </div>
    </div>
  );
}
