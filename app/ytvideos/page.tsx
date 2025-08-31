"use client";

import { useState } from "react";

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  author: { name: string; url: string };
  duration: { timestamp: string };
}

export default function YoutubePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);

  // 🔍 Search API
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.giftedtech.web.id/api/search/yts?apikey=gifted_api_jsgt5su7s&query=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (data?.results) setResults(data.results);
    } catch (err) {
      console.error(err);
      alert("Search failed ❌");
    } finally {
      setLoading(false);
    }
  }

  // 🎥 Get Video URL (ytmp4 → ytdlv2 fallback)
  async function getVideoUrl(videoUrl: string) {
    try {
      let res = await fetch(
        `https://api.giftedtech.web.id/api/download/ytmp4?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
          videoUrl
        )}`
      );
      let data = await res.json();
      if (data?.result?.download_url) return data.result.download_url;

      res = await fetch(
        `https://api.giftedtech.web.id/api/download/ytdlv2?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
          videoUrl
        )}`
      );
      data = await res.json();
      if (data?.result?.video_url) return data.result.video_url;

      throw new Error("No link found");
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // ▶️ Watch inline
  async function handleWatch(videoUrl: string) {
    const link = await getVideoUrl(videoUrl);
    if (link) {
      setPlayerSrc(link);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("⚠️ Watch failed. Try another video.");
    }
  }

  // ⬇️ Download
  async function handleDownload(videoUrl: string) {
    const link = await getVideoUrl(videoUrl);
    if (link) window.open(link, "_blank");
    else alert("⚠️ Download failed.");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Hero Player */}
      {playerSrc ? (
        <div className="mb-6">
          <video
            src={playerSrc}
            controls
            autoPlay
            className="w-full rounded-2xl shadow-lg"
          />
        </div>
      ) : (
        <div className="mb-6 text-center text-gray-400">🎬 Search and play a video</div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search YouTube..."
          className="flex-1 p-3 rounded-lg text-black"
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded-lg font-bold"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map((vid) => (
          <div
            key={vid.videoId}
            className="bg-gray-900 p-3 rounded-xl shadow hover:shadow-xl transition"
          >
            <img
              src={vid.thumbnail}
              alt={vid.title}
              className="w-full h-40 object-cover rounded-lg"
            />
            <h3 className="mt-2 font-semibold line-clamp-2">{vid.title}</h3>
            <p className="text-sm text-gray-400">{vid.author?.name}</p>
            <p className="text-xs text-gray-500">{vid.duration?.timestamp}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleWatch(vid.url)}
                className="flex-1 bg-green-600 py-2 rounded-lg"
              >
                ▶ Watch
              </button>
              <button
                onClick={() => handleDownload(vid.url)}
                className="flex-1 bg-blue-600 py-2 rounded-lg"
              >
                ⬇ Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
