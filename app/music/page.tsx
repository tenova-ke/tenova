"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import SongCard from "./SongCard";
import SongGrid from "./SongGrid";
import NowPlaying from "./NowPlaying";

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
      if (idx === 0) setShowRelated(true); // 👈 reveal related after first download
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
    <main className="music-page">
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

      {/* Featured song */}
      {songs.length > 0 && (
        <SongCard
          song={songs[0]}
          idx={0}
          playSong={playSong}
          downloadSong={downloadSong}
          downloading={downloading}
          featured
        />
      )}

      {/* Related songs */}
      {showRelated && songs.length > 1 && (
        <SongGrid
          songs={songs.slice(1)}
          playSong={playSong}
          downloadSong={downloadSong}
          downloading={downloading}
        />
      )}

      {/* Now Playing */}
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
