"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import SongGrid from "./SongGrid";
import NowPlaying from "./NowPlaying";

type YTSong = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail?: string;
};

export default function MusicPage() {
  const [query, setQuery] = useState("Kenya top hits");
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<YTSong[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // auto search on first load
    void searchSongs(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchSongs(q: string) {
    try {
      setLoading(true);
      setSongs([]);
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSongs(data?.results ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function playSong(idx: number) {
    const song = songs[idx];
    if (!song) return;
    setCurrent(idx);

    try {
      const res = await fetch(`/api/youtube/download?url=${song.videoId}`);
      const data = await res.json();
      if (audioRef.current && data?.result?.download_url) {
        audioRef.current.src = data.result.download_url;
        await audioRef.current.play();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function downloadSong(videoId: string, _idx: number) {
    try {
      setDownloading(videoId);
      const res = await fetch(`/api/youtube/download?url=${videoId}`);
      const data = await res.json();
      const href = data?.result?.download_url;
      const title = data?.result?.title || "Tevona";
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.download = `${title} - ${videoId}.mp3`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  }

  const nextSong = () => {
    if (current == null || songs.length === 0) return;
    const next = (current + 1) % songs.length;
    void playSong(next);
  };

  const stopSong = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrent(null);
  };

  return (
    <div className="music-page min-h-[100svh] relative">
      {/* top search bar */}
      <div className="mx-auto max-w-[720px] px-4 pt-6 pb-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-4">
          🎶 Music Downloader
        </h1>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs..."
            className="flex-1 h-11 rounded-xl px-4 bg-black/40 border border-white/20 text-white placeholder:text-white/60 outline-none"
          />
          <button
            onClick={() => searchSongs(query)}
            className="h-11 px-4 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-blue-500 shadow-md active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>
      </div>

      {/* results */}
      <div className="mx-auto max-w-[720px] px-4 pb-32">
        {loading && (
          <div className="py-16 flex items-center justify-center text-white/70">
            <Loader2 className="animate-spin mr-3" /> Searching…
          </div>
        )}

        {!loading && (
          <SongGrid
            songs={songs}
            playSong={playSong}
            downloadSong={downloadSong}
            downloading={downloading}
          />
        )}
      </div>

      {/* floating player */}
      {current !== null && (
        <NowPlaying
          audioRef={audioRef}
          stopSong={stopSong}
          nextSong={nextSong}
          // auto-next when current track ends
          onEnded={nextSong}
        />
      )}
    </div>
  );
}
