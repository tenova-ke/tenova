"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Download, Search, Loader2 } from "lucide-react";

export default function SpotifyDownloader() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(
          query
        )}`
      );
      setResults(res.data.data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Download
  const handleDownload = async (trackUrl: string) => {
    setDownloading(trackUrl);
    try {
      const res = await axios.get(
        `https://api.siputzx.my.id/api/d/spotifyv2?url=${encodeURIComponent(
          trackUrl
        )}`
      );

      if (res.data?.data?.mp3DownloadLink) {
        window.open(res.data.data.mp3DownloadLink, "_blank");
      } else {
        alert("Download link not found.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download track.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold mb-4 text-blue-400 drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎶 Spotify Music Downloader
        </motion.h1>
        <p className="text-gray-300 mb-8">
          Search for any Spotify track and download it instantly as MP3.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 justify-center"
        >
          <input
            type="text"
            placeholder="Search by song or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-2xl bg-gray-800 text-white focus:outline-none border border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
          >
            <Search className="w-4 h-4" />
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Results */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((song, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-900/80 rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:shadow-blue-500/30 transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
                <p className="text-xs text-gray-500">{song.album}</p>
                <p className="text-xs text-gray-500">{song.duration}</p>

                <button
                  onClick={() => handleDownload(song.track_url)}
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
                  disabled={downloading === song.track_url}
                >
                  {downloading === song.track_url ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="animate-pulse">Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && results.length === 0 && (
          <p className="text-gray-400 mt-8">No results yet. Try searching!</p>
        )}
      </div>
    </div>
  );
    }
