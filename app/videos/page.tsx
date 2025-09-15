// app/youtube/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * YouTube search & downloader page
 * - Search: GiftedTech YTS search (apikey: gifted_api_jsgt5su7s)
 * - Download: tries ytv first (with apikey), falls back to ytdl
 *
 * Place this file at: app/youtube/page.tsx
 */

type YTSearchResult = {
  type: "video" | "channel" | string;
  videoId?: string;
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  timestamp?: string;
  views?: number;
  author?: { name?: string; url?: string };
};

type DownloadResult = {
  status?: number | string;
  success?: boolean;
  result?: {
    title?: string;
    duration?: string;
    thumbnail?: string;
    video_url?: string;
    audio_url?: string;
    video_quality?: string;
    audio_quality?: string;
  };
};

export default function YoutubePage(): JSX.Element {
  const DEFAULT_QUERY = "Spectre";
  const [query, setQuery] = useState<string>(DEFAULT_QUERY);
  const [results, setResults] = useState<YTSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>([]);

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // watch modal state
  const [watchingVideoId, setWatchingVideoId] = useState<string | null>(null);

  // download modal state
  const [downloadOpen, setDownloadOpen] = useState<boolean>(false);
  const [downloadFor, setDownloadFor] = useState<YTSearchResult | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [downloadData, setDownloadData] = useState<DownloadResult["result"] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // entrance observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    Object.values(cardRefs.current).forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [results]);

  function logDbg(line: string) {
    setDebug((d) => [line, ...d].slice(0, 80));
  }

  useEffect(() => {
    doSearch(DEFAULT_QUERY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string) {
    setSearchError(null);
    setResults([]);
    setLoadingSearch(true);
    logDbg(`Search: ${q}`);
    try {
      const apikey = "gifted_api_jsgt5su7s";
      const url = `https://api.giftedtech.web.id/api/search/yts?apikey=${encodeURIComponent(apikey)}&query=${encodeURIComponent(q)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = await res.json();
      if (!json?.success || !Array.isArray(json.results)) {
        throw new Error("Search returned unexpected data");
      }
      setResults(json.results as YTSearchResult[]);
      logDbg(`Search returned ${json.results.length} items`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setSearchError(msg);
      logDbg("Search error: " + msg);
    } finally {
      setLoadingSearch(false);
    }
  }

  // Download flow: try ytv first then ytdl
  async function startDownloadFlow(item: YTSearchResult) {
    setDownloadError(null);
    setDownloadData(null);
    setDownloadFor(item);
    setDownloadOpen(true);
    setDownloadLoading(true);
    logDbg(`Download start: ${item.title || item.videoId || item.url}`);

    const tryYtv = async (): Promise<DownloadResult["result"] | null> => {
      try {
        const apikey = "gifted_api_jsgt5su7s";
        const targetUrl = item.url || (item.videoId ? `https://youtu.be/${item.videoId}` : "");
        if (!targetUrl) throw new Error("No video URL available for this item");
        const req = `https://api.giftedtech.web.id/api/download/ytv?apikey=${encodeURIComponent(apikey)}&url=${encodeURIComponent(targetUrl)}`;
        const r = await fetch(req, { cache: "no-store" });
        if (!r.ok) throw new Error(`ytv failed (${r.status})`);
        const j = (await r.json()) as DownloadResult;
        if (j?.success && j.result) {
          logDbg("ytv success");
          return j.result;
        }
        throw new Error("ytv returned invalid data");
      } catch (e: any) {
        logDbg("ytv error: " + (e?.message ?? String(e)));
        return null;
      }
    };

    const tryYtdl = async (): Promise<DownloadResult["result"] | null> => {
      try {
        const targetUrl = item.url || (item.videoId ? `https://youtu.be/${item.videoId}` : "");
        if (!targetUrl) throw new Error("No video URL available for this item");
        const req = `https://api.giftedtech.web.id/api/download/ytdl?apikey=&url=${encodeURIComponent(targetUrl)}`;
        const r = await fetch(req, { cache: "no-store" });
        if (!r.ok) throw new Error(`ytdl failed (${r.status})`);
        const j = (await r.json()) as DownloadResult;
        if (j?.success && j.result) {
          logDbg("ytdl success");
          return j.result;
        }
        throw new Error("ytdl returned invalid data");
      } catch (e: any) {
        logDbg("ytdl error: " + (e?.message ?? String(e)));
        return null;
      }
    };

    try {
      // primary
      const r1 = await tryYtv();
      if (r1) {
        setDownloadData(r1);
        setDownloadLoading(false);
        return;
      }
      // fallback
      const r2 = await tryYtdl();
      if (r2) {
        setDownloadData(r2);
        setDownloadLoading(false);
        return;
      }

      // both failed
      setDownloadError("Both download methods failed. Try again later.");
      setDownloadData(null);
    } catch (e: any) {
      setDownloadError(e?.message ?? "Unknown error");
    } finally {
      setDownloadLoading(false);
    }
  }

  function closeDownloadModal() {
    setDownloadOpen(false);
    setDownloadFor(null);
    setDownloadData(null);
    setDownloadLoading(false);
    setDownloadError(null);
  }

  function openWatch(item: YTSearchResult) {
    // set the video id to embed
    if (item.videoId) setWatchingVideoId(item.videoId);
    else if (item.url) {
      // try extract id from url
      const m = (item.url || "").match(/(?:v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
      if (m) setWatchingVideoId(m[1]);
      else setWatchingVideoId(null);
    } else {
      setWatchingVideoId(null);
    }
  }

  function closeWatch() {
    setWatchingVideoId(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-[#071227] text-white p-6">
      <section className="max-w-6xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold">Tevona — YouTube</h1>
          <p className="text-slate-300 mt-2 max-w-2xl mx-auto">Search YouTube, watch inline, or download audio/video (primary → fallback download strategy).</p>
        </header>

        {/* Search */}
        <div className="bg-white/6 border border-white/6 rounded-2xl p-4 mb-6 backdrop-blur-md">
          <div className="flex gap-3 items-center max-w-3xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
              placeholder="Search YouTube (e.g. Spectre, Alan Walker...)"
              className="flex-1 px-4 py-3 rounded-lg bg-transparent border border-white/8 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              onClick={() => doSearch(query)}
              className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 rounded-lg font-semibold shadow hover:brightness-105 transition"
            >
              Search
            </button>
            <button
              onClick={() => { setQuery(DEFAULT_QUERY); doSearch(DEFAULT_QUERY); }}
              className="px-3 py-3 bg-white/6 rounded-lg border border-white/6"
              title="Reset to default"
            >
              Default
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="text-sm text-slate-400">{results.length} items</div>
        </div>

        {loadingSearch && (
          <div className="mb-4">
            <div className="h-2 bg-white/6 rounded overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-pink-500 animate-progress" style={{ width: "55%" }} />
            </div>
          </div>
        )}

        {searchError && <div className="mb-4 text-rose-400">{searchError}</div>}

        {/* Cards */}
        <div className="space-y-6">
          {results.length === 0 && !loadingSearch && (
            <div className="text-slate-400">No results — try a different search.</div>
          )}

          {results.map((r, i) => (
            <article
              key={i}
              ref={(el: HTMLDivElement | null) => { cardRefs.current[i] = el; }}
              className="card relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/4 to-white/2 border border-white/6 shadow-lg flex flex-col md:flex-row"
            >
              <div className="w-full md:w-48 flex-shrink-0 relative square">
                <img
                  src={r.thumbnail || r.image || "/placeholder.png"}
                  alt={r.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <div className="absolute left-3 bottom-3 bg-black/50 text-xs px-2 py-1 rounded text-white/90">{r.timestamp ?? r.duration ?? ""}</div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold leading-tight">{r.title}</h3>
                    <div className="text-sm text-slate-300 mt-1">{r.author?.name ?? "Unknown author"} • {r.views ? `${r.views.toLocaleString()} views` : ""}</div>
                    <p className="mt-3 text-sm text-slate-300 line-clamp-3">{r.description}</p>
                  </div>

                  <div className="flex flex-col gap-2 ml-3">
                    <button
                      onClick={() => openWatch(r)}
                      className="px-3 py-2 bg-emerald-500 rounded-lg text-sm font-medium hover:brightness-105 transition"
                    >
                      Watch
                    </button>

                    <button
                      onClick={() => startDownloadFlow(r)}
                      className="px-3 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:brightness-105 transition"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400">Source: <span className="text-amber-300 break-all">{r.url}</span></div>
              </div>
            </article>
          ))}
        </div>

        {/* Watch modal (embed) */}
        {watchingVideoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={closeWatch} />
            <div className="relative z-10 w-full max-w-4xl bg-slate-900 rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-black/20">
                <div className="text-white font-semibold">Watching</div>
                <button onClick={closeWatch} className="text-slate-300 px-3">Close</button>
              </div>

              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${watchingVideoId}?autoplay=1&rel=0`}
                  title="YouTube player"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Download modal */}
        {downloadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={closeDownloadModal} />
            <div className="relative z-10 w-full max-w-xl bg-slate-900 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-semibold">{downloadFor?.title ?? "Downloading"}</div>
                  <div className="text-xs text-slate-400">{downloadFor?.author?.name ?? ""}</div>
                </div>
                <button onClick={closeDownloadModal} className="text-slate-300">Close</button>
              </div>

              <div className="p-3 rounded-md bg-black/40 border border-black/30">
                {downloadLoading && (
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <div className="text-slate-300">Resolving download links… (trying primary → fallback)</div>
                  </div>
                )}

                {!downloadLoading && downloadError && (
                  <div className="text-rose-400">{downloadError}</div>
                )}

                {!downloadLoading && downloadData && (
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <img src={downloadData.thumbnail ?? downloadFor?.thumbnail ?? "/placeholder.png"} alt="thumb" className="w-20 h-12 object-cover rounded" />
                      <div>
                        <div className="font-semibold">{downloadData.title ?? downloadFor?.title}</div>
                        <div className="text-xs text-slate-400">{downloadData.duration ?? ""} • {downloadData.video_quality ?? ""}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {downloadData.video_url && (
                        <a
                          href={downloadData.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                        >
                          Download Video
                        </a>
                      )}
                      {downloadData.audio_url && (
                        <a
                          href={downloadData.audio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-amber-500 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                        >
                          Download Audio
                        </a>
                      )}
                      <button
                        onClick={() => {
                          // open both to give user options (non-blocking)
                          if (downloadData?.video_url) window.open(downloadData.video_url, "_blank");
                          if (downloadData?.audio_url) window.open(downloadData.audio_url, "_blank");
                        }}
                        className="px-3 py-2 bg-white/6 rounded-lg text-sm"
                      >
                        Open both
                      </button>
                    </div>
                  </div>
                )}

                {!downloadLoading && !downloadData && !downloadError && (
                  <div className="text-slate-300">No download data yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Debug (collapsible) */}
        <div className="mt-6 text-xs text-slate-400">
          <details>
            <summary className="cursor-pointer">Debug log ({debug.length})</summary>
            <div className="mt-2 max-h-40 overflow-auto">
              {debug.map((d, idx) => <div key={idx} className="py-1 border-b last:border-b-0">{d}</div>)}
            </div>
          </details>
        </div>
      </section>

      {/* inline styles / animations */}
      <style jsx>{`
        .square { position: relative; padding-bottom: 56.25%; } /* 16:9 */
        .square img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

        .card { opacity: 0; transform: translateY(18px) scale(0.995); transition: transform 560ms cubic-bezier(.16,.84,.44,1), opacity 560ms ease; }
        .card.in-view { opacity: 1; transform: translateY(0) scale(1); }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.2s linear infinite;
          background-size: 200% 100%;
        }

        /* small spinner color fix */
        svg.animate-spin { color: white; }
      `}</style>
    </main>
  );
}

/* small spinner component */
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
      <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75"></path>
    </svg>
  );
}
