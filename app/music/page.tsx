"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Play, Download, Loader2, SkipForward, Square } from "lucide-react";

export default function MusicPage() {
  const [query, setQuery] = useState("Kenya top hits");
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto search on load
  useEffect(() => {
    searchSongs(query);
  }, []);

  const searchSongs = async (q: string) => {
    setLoading(true);
    setSongs([]);
    try {
      const res = await fetch(`/api/youtube/search?q=${q}`);
      const data = await res.json();
      setSongs(data.results || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const playSong = async (idx: number) => {
    const song = songs[idx];
    if (!song) return;
    setCurrent(idx);

    try {
      const res = await fetch(`/api/youtube/download?url=${song.videoId}`);
      const data = await res.json();

      if (audioRef.current) {
        audioRef.current.src = data.result.download_url;
        audioRef.current.play();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadSong = async (videoId: string) => {
    setDownloading(videoId);
    try {
      const res = await fetch(`/api/youtube/download?url=${videoId}`);
      const data = await res.json();

      const a = document.createElement("a");
      a.href = data.result.download_url;
      a.download = `${data.result.title || "Tevona"} - ${videoId}.mp3`;
      a.click();
    } catch (err) {
      console.error(err);
    }
    setDownloading(null);
  };

  const nextSong = () => {
    if (current === null) return;
    const next = (current + 1) % songs.length;
    playSong(next);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">🎶 Music Downloader</h1>

      {/* Search */}
      <div className="flex gap-2 justify-center mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs..."
          className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 w-2/3"
        />
        <button
          onClick={() => searchSongs(query)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-blue-500 font-bold"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </div>

      {/* Results */}
      {loading && <p className="text-center text-gray-400">Loading songs...</p>}

      <div className="max-w-6xl mx-auto px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((song, idx) => (
          <motion.div
            key={song.videoId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 bg-black/70 border border-white/20 shadow-xl backdrop-blur-md"
          >
            <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
              {song.thumbnail && (
                <Image
                  src={song.thumbnail}
                  alt={song.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <h2 className="font-semibold text-lg truncate">{song.title}</h2>
            <p className="text-sm text-gray-400">{song.channel}</p>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => playSong(idx)}
                className="flex-1 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition"
              >
                <Play size={18} /> Play
              </button>
              <button
                onClick={() => downloadSong(song.videoId)}
                disabled={downloading === song.videoId}
                className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
              >
                {downloading === song.videoId ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}{" "}
                Download
              </button>
            </div>

            {/* Progress bar if downloading */}
            {downloading === song.videoId && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-1 mt-3 rounded bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Floating player */}
      {current !== null && (
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-1/2 bg-black/90 backdrop-blur-lg p-4 rounded-2xl border border-white/20 shadow-xl"
        >
          <h3 className="font-bold text-lg truncate mb-2">{songs[current]?.title}</h3>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setCurrent(null);
              }}
              className="px-4 py-2 bg-red-600 rounded-lg flex items-center gap-2"
            >
              <Square size={18} /> Stop
            </button>
            <button
              onClick={nextSong}
              className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2"
            >
              <SkipForward size={18} /> Next
            </button>
          </div>
          <audio
            ref={audioRef}
            onEnded={nextSong}
            className="hidden"
            controls
          />
        </motion.div>
      )}
    </main>
  );
}
