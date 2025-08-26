"use client";

import { useState } from "react";
import { Search, Download, Music, Video, Loader2, PlayCircle } from "lucide-react";
import axios from "axios";

interface VideoResult {
  title: string;
  url: string;
  thumbnail: string;
  channel?: string;
  views?: string;
  ago?: string;
  duration?: string;
}

export default function YouTubeDownloaderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VideoResult[]>([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://api.giftedtech.web.id/api/search/yts?apikey=gifted&query=${encodeURIComponent(
          query
        )}`
      );
      setResults(res.data.result || []);
    } catch (err) {
      setError("Failed to fetch videos. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, type: "mp4" | "mp3") => {
    try {
      const res = await axios.get(
        `https://api.giftedtech.web.id/api/download/yt${type}?apikey=gifted&url=${encodeURIComponent(
          url
        )}`
      );
      const downloadUrl = res.data.result?.download_url;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        setError("Download link not available.");
      }
    } catch {
      setError("Download failed. Please try another format.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white px-6 py-10">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">🎬 YouTube Downloader</h1>
        <p className="text-gray-400 mb-6">
          Search for any video or paste a YouTube link to download in MP4/MP3.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or paste link..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#1E293B] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#3B82F6] hover:bg-[#2563EB] transition px-4 py-3 rounded-xl flex items-center gap-2 font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mt-6 bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((video, i) => (
          <div
            key={i}
            className="bg-[#1E293B] rounded-xl overflow-hidden shadow hover:scale-[1.02] transition transform"
          >
            <div className="relative">
              <img src={video.thumbnail} alt={video.title} className="w-full" />
              {video.duration && (
                <span className="absolute bottom-2 right-2 bg-black/70 text-xs px-2 py-1 rounded">
                  {video.duration}
                </span>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-base font-semibold line-clamp-2">{video.title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {video.channel} • {video.views} • {video.ago}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDownload(video.url, "mp4")}
                  className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Video size={16} /> MP4
                </button>
                <button
                  onClick={() => handleDownload(video.url, "mp3")}
                  className="flex-1 bg-[#22D3EE] hover:bg-[#06B6D4] px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Music size={16} /> MP3
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && results.length === 0 && !error && (
        <p className="text-center text-gray-500 mt-16">No results yet. Try searching above 👆</p>
      )}
    </div>
  );
}
