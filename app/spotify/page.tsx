"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, Play, Download, Loader2, SkipForward, Square } from "lucide-react";

type Track = {
  name: string;
  artists: string;
  popularity?: number;
  link: string;            // https://open.spotify.com/track/...
  image?: string;          // https://i.scdn.co/image/...
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string) {
    setLoading(true);
    setTracks([]);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      // Your route returns { status, creator, result: [ ... ] }
      const items: any[] = data?.result || data?.results || [];
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
      console.error(e);
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

  function extractDownloadUrl(payload: any): string | undefined {
    // Be lenient with possible API shapes
    return (
      payload?.result?.download_url ||
      payload?.result?.mp3 ||
      payload?.download_url ||
      payload?.url ||
      payload?.link?.mp3?.url ||
      payload?.audio?.url
    );
  }

  async function playTrack(idx: number) {
    const t = tracks[idx];
    if (!t) return;

    try {
      const res = await fetch(`/api/spotify/download?url=${encodeURIComponent(t.link)}`);
      const data = await res.json();
      const fileUrl = extractDownloadUrl(data);
      if (!fileUrl) {
        console.warn("No playable URL returned from download API:", data);
        return;
      }
      if (audioRef.current) {
        audioRef.current.src = fileUrl;
        await audioRef.current.play();
        setCurrentIdx(idx);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function downloadTrack(track: Track) {
    setDownloadingLink(track.link);
    try {
      const res = await fetch(`/api/spotify/download?url=${encodeURIComponent(track.link)}`);
      const data = await res.json();
      const fileUrl = extractDownloadUrl(data);
      if (!fileUrl) {
        console.warn("No download URL returned:", data);
        return;
      }
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `${sanitizeFileName(track.name)} - ${sanitizeFileName(track.artists)}.mp3`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingLink(null);
    }
  }

  function nextTrack() {
    if (currentIdx === null || tracks.length === 0) return;
    const next = (currentIdx + 1) % tracks.length;
    playTrack(next);
  }

  const hasResults = useMemo(() => tracks && tracks.length > 0, [tracks]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Container */}
      <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-28">
        <h1 className="text-center text-3xl font-extrabold mb-6">🎧 Spotify Downloader</h1>

        {/* Search bar */}
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

        {/* Loader */}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {/* Results: 1 card per row, consistent, centered */}
        <div className="space-y-4">
          {hasResults &&
            tracks.map((t, idx) => (
              <div
                key={`${t.link}-${idx}`}
                className="w-full rounded-2xl border border-white/10 bg-black/60 shadow-xl backdrop-blur-md p-4"
              >
                <div className="flex gap-4">
                  {/* Cover */}
                  <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                    {t.image ? (
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-blue-500/30" />
                    )}
                  </div>

                  {/* Meta + actions */}
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

                    {/* Animated progress line while "downloading" */}
                    {downloadingLink === t.link && (
                      <div className="mt-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full w-1/3 rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 animate-[shimmer_1.2s_linear_infinite]"
                          style={{}}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!loading && !hasResults && (
          <p className="text-center text-white/70 pt-10">No results yet. Try another search.</p>
        )}
      </div>

      {/* Floating player - small, centered, not touching edges */}
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

      {/* keyframes for the shimmer line */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </main>
  );
}

/* utils */
function sanitizeFileName(name?: string) {
  return (name || "track").replace(/[\\\/:*?"<>|]+/g, "").trim();
} 
