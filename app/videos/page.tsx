// app/videos/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type YTSearchResult = {
  videoId?: string;
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  timestamp?: string;
  author?: { name?: string };
};

type DownloadResult = {
  success?: boolean;
  result?: {
    title?: string;
    duration?: string;
    thumbnail?: string;
    video_url?: string;
    audio_url?: string;
  };
};

export default function YoutubePage(): JSX.Element {
  const DEFAULT_QUERY = "Spectre";
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [results, setResults] = useState<YTSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [watchingVideoId, setWatchingVideoId] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadFor, setDownloadFor] = useState<YTSearchResult | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadData, setDownloadData] = useState<DownloadResult["result"] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    doSearch(DEFAULT_QUERY);
  }, []);

  async function doSearch(q: string) {
    setSearchError(null);
    setResults([]);
    setLoadingSearch(true);
    try {
      const apikey = "gifted_api_jsgt5su7s";
      const url = `https://api.giftedtech.web.id/api/search/yts?apikey=${apikey}&query=${encodeURIComponent(q)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json?.success && Array.isArray(json.results)) {
        setResults(json.results);
      } else {
        throw new Error("Invalid search response");
      }
    } catch (err: any) {
      setSearchError(err?.message || "Search failed");
    } finally {
      setLoadingSearch(false);
    }
  }

  async function startDownloadFlow(item: YTSearchResult) {
    setDownloadError(null);
    setDownloadData(null);
    setDownloadFor(item);
    setDownloadOpen(true);
    setDownloadLoading(true);

    const targetUrl = item.url || (item.videoId ? `https://youtu.be/${item.videoId}` : "");
    if (!targetUrl) {
      setDownloadError("No video URL found");
      setDownloadLoading(false);
      return;
    }

    const apikey = "gifted_api_jsgt5su7s";
    const ytvUrl = `https://api.giftedtech.web.id/api/download/ytv?apikey=${apikey}&url=${encodeURIComponent(targetUrl)}`;
    const ytdlUrl = `https://api.giftedtech.web.id/api/download/ytdl?apikey=&url=${encodeURIComponent(targetUrl)}`;

    try {
      let res = await fetch(ytvUrl);
      let j = await res.json();
      if (j?.success && j.result) {
        setDownloadData(j.result);
        setDownloadLoading(false);
        return;
      }
    } catch {}

    try {
      let res = await fetch(ytdlUrl);
      let j = await res.json();
      if (j?.success && j.result) {
        setDownloadData(j.result);
        setDownloadLoading(false);
        return;
      }
    } catch {}

    setDownloadError("Download failed");
    setDownloadLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <section className="max-w-6xl mx-auto" ref={containerRef}>
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold">YouTube Downloader</h1>
          <p className="text-slate-300 mt-2">Search, watch inline, or download audio/video.</p>
        </header>

        {/* Search bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
              placeholder="Search YouTube..."
              className="flex-1 px-4 py-3 rounded-lg bg-transparent border border-white/10 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={() => doSearch(query)}
              className="px-4 py-3 bg-indigo-600 rounded-lg font-semibold hover:brightness-110"
            >
              Search
            </button>
          </div>
        </div>

        {loadingSearch && <div className="text-slate-400 mb-4">Loading…</div>}
        {searchError && <div className="text-rose-400 mb-4">{searchError}</div>}

        {/* Results */}
        <div className="space-y-6">
          {results.map((r, i) => (
            <article
              key={i}
              className="opacity-100 transition bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 relative">
                  <img
                    src={r.thumbnail || r.image || "/placeholder.png"}
                    alt={r.title}
                    className="w-full h-32 md:h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  {r.timestamp && (
                    <div className="absolute left-2 bottom-2 bg-black/60 text-xs px-2 py-1 rounded">{r.timestamp}</div>
                  )}
                </div>
                <div className="p-4 flex-1">
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <p className="text-sm text-slate-300 mt-1">{r.author?.name ?? ""}</p>
                  <div className="flex gap-2 mt-3">
                    {r.videoId && (
                      <button
                        onClick={() => setWatchingVideoId(r.videoId!)}
                        className="px-3 py-2 bg-emerald-500 rounded-lg text-sm font-medium"
                      >
                        Watch
                      </button>
                    )}
                    <button
                      onClick={() => startDownloadFlow(r)}
                      className="px-3 py-2 bg-indigo-600 rounded-lg text-sm font-medium"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Watch modal */}
        {watchingVideoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setWatchingVideoId(null)} />
            <div className="relative z-10 w-full max-w-4xl bg-slate-900 rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${watchingVideoId}?autoplay=1&rel=0`}
                title="YouTube"
                className="w-full aspect-video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Download modal */}
        {downloadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setDownloadOpen(false)} />
            <div className="relative z-10 w-full max-w-lg bg-slate-900 rounded-xl p-4">
              <div className="flex justify-between mb-3">
                <div className="text-white font-semibold">{downloadFor?.title}</div>
                <button onClick={() => setDownloadOpen(false)} className="text-slate-400">Close</button>
              </div>
              {downloadLoading && <div className="text-slate-300">Fetching download links…</div>}
              {downloadError && <div className="text-rose-400">{downloadError}</div>}
              {downloadData && (
                <div className="space-y-3">
                  {downloadData.video_url && (
                    <a href={downloadData.video_url} target="_blank" className="block px-4 py-2 bg-indigo-600 rounded-lg text-center">
                      Download Video
                    </a>
                  )}
                  {downloadData.audio_url && (
                    <a href={downloadData.audio_url} target="_blank" className="block px-4 py-2 bg-amber-500 rounded-lg text-center">
                      Download Audio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
  }
