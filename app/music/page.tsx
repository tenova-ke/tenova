"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search, SkipForward, Square } from "lucide-react";
import SongGrid from "./SongGrid";

export default function MusicPage() {
  const [query, setQuery] = useState("Kenya top hits");
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const downloadSong = async (videoId: string, title: string) => {
    setDownloading(videoId);
    try {
      const res = await fetch(`/api/youtube/download?url=${videoId}`);
      const data = await res.json();
      const a = document.createElement("a");
      a.href = data.result.download_url;
      a.download = `${title || "Tevona"} - ${videoId}.mp3`;
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
          {loading ? <Loader2 className="animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Results */}
      {loading && <p className="text-center text-gray-400">Loading songs...</p>}
      {!loading && songs.length > 0 && (
        <SongGrid
          songs={songs}
          playSong={playSong}
          downloadSong={downloadSong}
          downloading={downloading}
        />
      )}

      {/* Floating Now Playing */}
      {current !== null && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[300px] bg-black/90 backdrop-blur-lg p-3 rounded-xl border border-white/20 shadow-xl text-center">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setCurrent(null);
              }}
              className="px-3 py-2 bg-red-600 rounded-lg flex items-center gap-2 text-sm"
            >
              <Square size={16} /> Stop
            </button>
            <button
              onClick={nextSong}
              className="px-3 py-2 bg-blue-600 rounded-lg flex items-center gap-2 text-sm"
            >
              <SkipForward size={16} /> Next
            </button>
          </div>
          <audio
            ref={audioRef}
            onEnded={nextSong}
            className="hidden"
            controls
          />
        </div>
      )}
    </main>
  );
         }
