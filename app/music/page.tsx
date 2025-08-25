"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Play, Download, Loader2 } from "lucide-react";
import NowPlaying from "./components/NowPlaying";

export default function MusicPage() {
  const [query, setQuery] = useState("Kenya top hits");
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showRelated, setShowRelated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto search on load
  useEffect(() => {
    searchSongs(query);
  }, []);

  const searchSongs = async (q: string) => {
    setLoading(true);
    setSongs([]);
    setShowRelated(false);
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

  const downloadSong = async (videoId: string, idx: number) => {
    setDownloading(videoId);
    try {
      const res = await fetch(`/api/youtube/download?url=${videoId}`);
      const data = await res.json();

      const a = document.createElement("a");
      a.href = data.result.download_url;
      a.download = `${data.result.title || "Tevona"} - ${videoId}.mp3`;
      a.click();

      // 🔥 After first download, reveal related smoothly
      if (idx === 0) {
        setShowRelated(true);
      }
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

      {/* Featured Song */}
      <AnimatePresence>
        {songs.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: showRelated ? -20 : 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="max-w-2xl mx-auto mb-10 rounded-xl p-6 bg-black/80 border border-white/20 shadow-2xl backdrop-blur-md"
          >
            <div className="relative w-full h-56 rounded-lg overflow-hidden mb-4">
              <Image
                src={songs[0].thumbnail}
                alt={songs[0].title}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="font-semibold text-xl truncate">{songs[0].title}</h2>
            <p className="text-sm text-gray-400">{songs[0].channel}</p>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => playSong(0)}
                className="flex-1 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition"
              >
                <Play size={18} /> Play
              </button>
              <button
                onClick={() => downloadSong(songs[0].videoId, 0)}
                disabled={downloading === songs[0].videoId}
                className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
              >
                {downloading === songs[0].videoId ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}{" "}
                Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Songs */}
      <AnimatePresence>
        {showRelated && songs.length > 1 && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {songs.slice(1).map((song, idx) => (
              <motion.div
                key={song.videoId}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4 bg-black/70 border border-white/20 shadow-xl backdrop-blur-md"
              >
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={song.thumbnail}
                    alt={song.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="font-semibold text-lg truncate">{song.title}</h2>
                <p className="text-sm text-gray-400">{song.channel}</p>

                {/* Controls */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => playSong(idx + 1)}
                    className="flex-1 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition"
                  >
                    <Play size={18} /> Play
                  </button>
                  <button
                    onClick={() => downloadSong(song.videoId, idx + 1)}
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Player */}
      {current !== null && (
        <NowPlaying
          audioRef={audioRef}
          stopSong={() => {
            if (audioRef.current) audioRef.current.pause();
            setCurrent(null);
          }}
          nextSong={nextSong}
        />
      )}
    </main>
  );
  }
