// app/music/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";

type Video = {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
};

export default function MusicPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Video[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (videoId: string, title: string) => {
    // call our backend download API
    window.location.href = `/api/youtube/download?url=https://www.youtube.com/watch?v=${videoId}&filename=${encodeURIComponent(
      title + ".mp3"
    )}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">🎵 YouTube Music Downloader</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search for music..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((video) => (
          <div
            key={video.videoId}
            className="bg-gray-900 rounded-xl p-4 shadow-md flex flex-col"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="rounded-lg mb-3"
            />
            <h2 className="text-lg font-semibold mb-1 line-clamp-2">{video.title}</h2>
            <p className="text-sm text-gray-400 mb-3">{video.duration}</p>
            <button
              onClick={() => handleDownload(video.videoId, video.title)}
              className="mt-auto px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
            >
              ⬇ Download MP3
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
