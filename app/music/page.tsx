// app/music/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";

export default function MusicDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.get(
        `https://CreepyTech-creepy-ai.hf.space/download/spotify?url=${encodeURIComponent(
          url
        )}`
      );
      setResult(res.data);
    } catch (err: any) {
      setError("Failed to fetch download. Check the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-8">
      <h1 className="text-4xl font-bold text-accent-green mb-4 animate-bounce">
        Spotify MP3 Downloader
      </h1>
      <p className="text-muted mb-6">
        Paste a Spotify track or playlist URL below
      </p>

      <div className="flex w-full max-w-xl gap-2">
        <input
          type="text"
          placeholder="Enter Spotify URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-green"
        />
        <button
          onClick={handleDownload}
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-accent-green text-black font-semibold hover:scale-105 transition-transform animate-pulse disabled:opacity-50"
        >
          {loading ? "Loading..." : "Download"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="glass-card w-full max-w-xl mt-8 p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-accent-purple mb-2">
            {result.title || "Unknown Title"}
          </h2>
          <p className="text-muted mb-4">
            {result.artist || "Unknown Artist"}
          </p>
          <a
            href={result.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-xl bg-accent-blue text-black font-semibold hover:scale-105 transition-transform"
          >
            Download MP3
          </a>
        </div>
      )}
    </div>
  );
}
