"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Download, Search } from "lucide-react";

export default function SpotifyDownloader() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `https://CreepyTech-creepy-ai.hf.space/search/spotify?s=${encodeURIComponent(
          query
        )}`
      );
      setResults(res.data.result || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      window.open(
        `https://CreepyTech-creepy-ai.hf.space/download/spotify?url=${encodeURIComponent(
          url
        )}`,
        "_blank"
      );
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold mb-4 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Spotify Music Downloader
        </motion.h1>
        <p className="text-gray-300 mb-8">
          Search any track and download it directly as MP3.
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
            className="w-full max-w-md px-4 py-2 rounded-2xl bg-card text-black focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary rounded-xl hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        {/* Results */}
        <div className="mt-10 space-y-4">
          {loading && <p className="text-gray-400">Searching...</p>}
          {!loading &&
            results.length > 0 &&
            results.map((song, idx) => (
              <motion.div
                key={idx}
                className="flex justify-between items-center p-4 bg-card/80 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h3 className="font-semibold text-lg">{song.title}</h3>
                  <p className="text-sm text-gray-300">{song.artist}</p>
                </div>
                <button
                  onClick={() => handleDownload(song.url)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </motion.div>
            ))}

          {!loading && results.length === 0 && (
            <p className="text-gray-400">No results yet. Try searching!</p>
          )}
        </div>
      </div>
    </div>
  );
}
