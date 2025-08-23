"use client";

import { useState } from "react";
import axios from "axios";

export default function MusicPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      setResults(data.result || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
    setLoading(false);
  };

  const handleDownload = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/youtube/download?id=${id}`);
      if (data?.mp3) {
        window.open(data.mp3, "_blank"); // start download
      } else {
        alert("Download link not available.");
      }
    } catch (err) {
      alert("Error downloading track.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🎵 Tevona Music Downloader</h1>

      {/* Search Bar */}
      <div className="flex justify-center gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search YouTube music..."
          className="px-4 py-2 w-80 rounded-lg text-black"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((video) => (
          <div key={video.id} className="bg-gray-800 p-4 rounded-xl shadow-md">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <h2 className="text-lg font-semibold">{video.title}</h2>
            <p className="text-sm text-gray-400">{video.channel}</p>
            <div className="mt-3">
              <button
                onClick={() => handleDownload(video.id)}
                className="w-full px-3 py-2 bg-green-600 rounded-lg hover:bg-green-700"
              >
                Download MP3
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
