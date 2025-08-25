"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, Play, Download, Loader2, SkipForward, Square } from "lucide-react";

type Track = {
  name: string;
  artists: string;
  popularity?: number;
  link: string;
  image?: string;
  duration_ms?: number;
};

export default function SpotifyPage() {
  const [query, setQuery] = useState("Kenya top hits");
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [downloadingLink, setDownloadingLink] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    doSearch(query);
  }, []);

  async function doSearch(q: string) {
    setLoading(true);
    setTracks([]);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      const items: any[] = data?.result || [];
      const normalized: Track[] = items.map((t: any) => ({
        name: t.name,
        artists: t.artists,
        link: t.link,
        image: t.image,
        duration_ms: t.duration_ms,
        popularity: t.popularity,
      }));
      setTracks(normalized);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  }

  function msToMin(ms?: number) {
    if (!ms || ms <= 0) return "";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  async function fetchGiftedDownload(url: string) {
    const res = await fetch(
      `https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(
        url
      )}`
    );
    const data = await res.json();
    return data?.result?.download_url;
  }

  async function playTrack(idx: number) {
    const t = tracks[idx];
    if (!t) return;

    try {
      const fileUrl = await fetchGiftedDownload(t.link);
      if (!fileUrl) {
        console.warn("No playable URL returned");
        return;
      }
      if (audioRef.current) {
        audioRef.current.src = fileUrl;
        await audioRef.current.play();
        setCurrentIdx(idx);
      }
    } catch (e) {
      console.error("Play failed:", e);
    }
  }

  async function downloadTrack(track: Track) {
    setDownloadingLink(track.link);
    try {
      const fileUrl = await fetchGiftedDownload(track.link);
      if (!fileUrl) {
        console.warn("No download URL returned");
        return;
      }
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `${sanitizeFileName(track.name)} - ${sanitizeFileName(track.artists)}.mp3`;
      a.click();
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloadingLink(null);
    }
  }

  function nextTrack() {
    if (currentIdx === null || tracks.length === 0) return;
    const next = (currentIdx + 1) % tracks.length;
    playTrack(next);
  }

  const hasResults = useMemo(() => tracks.length > 0, [tracks]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-28">
        <h1 className="text-center text-3xl font-extrabold mb-6">🎧 Spotify Downloader</h1>

        {/* Search */}
        <div className="flex items-center gap-2 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Spotify tracks..."
            className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/15 placeholder-gray-300 outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={() => doSearch(query)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 font-semibold"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {hasResults &&
            tracks.map((t, idx) => (
              <div
                key={`${t.link}-${idx}`}
                className="w-full rounded-2xl border border-white/10 bg-black/60 shadow-xl backdrop-blur-md p-4"
              >
                <div className="flex gap-4">
                  <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                    {t.image ? (
                      <Image src={t.image} alt={t.name} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-blue-500/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold truncate">{t.name}</h3>
                      <span className="text-xs text-white/60">{msToMin(t.duration_ms)}</span>
                    </div>
                    <p className="text-sm text-white/70 truncate">{t.artists}</p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => playTrack(idx)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-sm"
                      >
                        <Play size={16} /> Play
                      </button>

                      <button
                        onClick={() => downloadTrack(t)}
                        disabled={downloadingLink === t.link}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-sm"
                      >
                        {downloadingLink === t.link ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        Download
                      </button>

                      <a
                        href={t.link}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-xs text-blue-300 hover:text-blue-200 underline"
                      >
                        Open in Spotify
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Floating player */}
      {currentIdx !== null && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl shadow-2xl p-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                setCurrentIdx(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
            >
              <Square size={16} /> Stop
            </button>
            <button
              onClick={nextTrack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
            >
              <SkipForward size={16} /> Next
            </button>
          </div>
          <audio ref={audioRef} className="hidden" onEnded={nextTrack} />
        </div>
      )}
    </main>
  );
}

function sanitizeFileName(name?: string) {
  return (name || "track").replace(/[\\\/:*?"<>|]+/g, "").trim();
}
