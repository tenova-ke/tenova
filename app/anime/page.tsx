// app/anime/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Anime search / watch / download page (inline components only)
 * APIs used:
 *  - https://api.siputzx.my.id/api/anime/anichin-search?query=...
 *  - https://api.siputzx.my.id/api/anime/anichin-episode?url=...
 *  - https://api.siputzx.my.id/api/anime/anichin-download?url=...
 *
 * Visual upgrades:
 *  - Tevona-like colored card visuals
 *  - Square covers (aspect-square)
 *  - Per-card fade+slide entrance (staggered)
 *  - Buttons and spacing tuned for clarity
 *
 * NOTE: kept logic exactly as your working version to avoid type/build errors.
 */

type SeriesItem = {
  title: string;
  type?: string;
  status?: string;
  link?: string;
  image?: string;
};

type EpisodeItem = {
  episodeNumber?: string;
  title?: string;
  subStatus?: string;
  releaseDate?: string;
  link?: string;
};

type DownloadHost = {
  host?: string;
  link?: string;
};

export default function AnimePage(): JSX.Element {
  const DEFAULT_QUERY = "Renegade Immortal";

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [results, setResults] = useState<SeriesItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // watch state
  const [isWatching, setIsWatching] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [watchLoading, setWatchLoading] = useState(false);
  const [watchError, setWatchError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // download state
  const [downloadingFor, setDownloadingFor] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ resolution?: string; hosts: DownloadHost[] }[] | null>(
    null
  );
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // animated reveal
  const [visibleCount, setVisibleCount] = useState(0);
  const revealTimer = useRef<number | null>(null);

  // small helper for debug log
  function logDebug(line: string) {
    setDebugLog((s) => [line, ...s].slice(0, 120));
  }

  useEffect(() => {
    doSearch(DEFAULT_QUERY);
    return () => {
      if (revealTimer.current) window.clearInterval(revealTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // whenever results change, run a simple staggered reveal animation (no refs/intersection)
    setVisibleCount(0);
    if (revealTimer.current) {
      window.clearInterval(revealTimer.current);
      revealTimer.current = null;
    }
    if (results.length === 0) return;
    let i = 0;
    revealTimer.current = window.setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= results.length && revealTimer.current) {
        window.clearInterval(revealTimer.current);
        revealTimer.current = null;
      }
    }, 80);
  }, [results]);

  async function doSearch(q: string) {
    setError(null);
    setResults([]);
    setLoadingSearch(true);
    logDebug(`Search: ${q}`);
    try {
      const res = await fetch(
        `https://api.siputzx.my.id/api/anime/anichin-search?query=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = await res.json();
      if (!json?.status) throw new Error("Search returned invalid data");
      const items: SeriesItem[] = (json.data || []).map((it: any) => ({
        title: it.title,
        type: it.type,
        status: it.status,
        link: it.link,
        image: it.image,
      }));
      setResults(items);
      logDebug(`Search returned ${items.length} items`);
    } catch (err: any) {
      setError(err?.message || "Search failed");
      logDebug("Search error: " + (err?.message ?? String(err)));
    } finally {
      setLoadingSearch(false);
    }
  }

  async function fetchEpisodes(seriesLink: string) {
    logDebug("Fetching episodes for " + seriesLink);
    const res = await fetch(
      `https://api.siputzx.my.id/api/anime/anichin-episode?url=${encodeURIComponent(seriesLink)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Episodes request failed (${res.status})`);
    const json = await res.json();
    if (!json?.status) throw new Error("Episodes returned invalid data");
    return (json.data || []) as EpisodeItem[];
  }

  async function fetchDownloadLinks(episodeUrl: string) {
    logDebug("Fetching download links for " + episodeUrl);
    const res = await fetch(
      `https://api.siputzx.my.id/api/anime/anichin-download?url=${encodeURIComponent(episodeUrl)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Download request failed (${res.status})`);
    const json = await res.json();
    if (!json?.status) throw new Error("Download returned invalid data");
    const mapped = (json.data || []).map((r: any) => ({
      resolution: r.resolution,
      hosts: (r.links || []).map((l: any) => ({ host: l.host, link: l.link })),
    }));
    return mapped as { resolution?: string; hosts: DownloadHost[] }[];
  }

  function pickPlayableLink(links: { resolution?: string; hosts: DownloadHost[] }[]) {
    const flat: string[] = [];
    for (const group of links) {
      for (const h of group.hosts) {
        if (h.link) flat.push(h.link);
      }
    }
    const mp4 = flat.find((u) => /\.mp4(\?|$)/i.test(u));
    if (mp4) return mp4;
    const m3u8 = flat.find((u) => /\.m3u8(\?|$)/i.test(u));
    if (m3u8) return m3u8;
    return flat[0] ?? null;
  }

  async function onWatchClick(series: SeriesItem) {
    setWatchError(null);
    setVideoSrc(null);
    setVideoTitle(null);
    setIsWatching(true);
    setWatchLoading(true);
    logDebug(`Watch requested: ${series.title}`);
    try {
      if (!series.link) throw new Error("Series has no link");
      const episodes = await fetchEpisodes(series.link);
      if (!episodes || episodes.length === 0) throw new Error("No episodes found");
      const ep = episodes[0];
      logDebug(`Selected episode ${ep.episodeNumber} -> ${ep.link}`);
      if (!ep.link) throw new Error("Episode link missing");
      const links = await fetchDownloadLinks(ep.link);
      if (!links || links.length === 0) throw new Error("No download links found");
      const candidate = pickPlayableLink(links);
      if (!candidate) {
        setWatchError("Streaming not available — showing download options.");
        setDownloadLinks(links);
        setDownloadingFor(series.title || ep.title || "Episode");
        setIsWatching(false);
        return;
      }
      setVideoTitle(`${series.title} — Ep ${ep.episodeNumber ?? ""}`);
      setVideoSrc(candidate);
      setWatchError(null);
      setIsWatching(true);
    } catch (err: any) {
      const msg = err?.message || "Watch flow failed";
      logDebug("Watch error: " + msg);
      setWatchError(msg);
      try {
        if (series.link) {
          const episodes = await fetchEpisodes(series.link);
          if (episodes && episodes.length > 0) {
            const ep = episodes[0];
            const links = await fetchDownloadLinks(ep.link as string);
            setDownloadLinks(links);
            setDownloadingFor(series.title || ep.title || "Episode");
          }
        }
      } catch (e: any) {
        logDebug("Fallback download error: " + (e?.message ?? String(e)));
      }
      setIsWatching(false);
    } finally {
      setWatchLoading(false);
    }
  }

  async function onDownloadClick(series: SeriesItem) {
    setDownloadError(null);
    setDownloadLinks(null);
    setDownloadingFor(series.title ?? "Episode");
    setDownloadLoading(true);
    logDebug(`Download requested: ${series.title}`);
    try {
      if (!series.link) throw new Error("Series has no link");
      const episodes = await fetchEpisodes(series.link);
      if (!episodes || episodes.length === 0) throw new Error("No episodes found");
      const ep = episodes[0];
      if (!ep.link) throw new Error("Episode link missing");
      const links = await fetchDownloadLinks(ep.link);
      if (!links || links.length === 0) throw new Error("No download links returned");
      setDownloadLinks(links);
      const firstHost = links[0]?.hosts?.[0]?.link;
      if (firstHost) {
        logDebug("Auto-starting download for link: " + firstHost);
        window.open(firstHost, "_blank");
      }
    } catch (err: any) {
      setDownloadError(err?.message || "Download failed");
      logDebug("Download error: " + (err?.message ?? String(err)));
    } finally {
      setDownloadLoading(false);
    }
  }

  function closeWatchModal() {
    setIsWatching(false);
    setVideoSrc(null);
    setVideoTitle(null);
    setWatchError(null);
    try {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.src = "";
    } catch {}
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071227] via-[#0f172a] to-[#071324] text-slate-100 p-6">
      <section className="max-w-6xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tevona — Anime Hub</h1>
          <p className="mt-2 text-slate-300 max-w-2xl mx-auto">
            Search Anichin anime, play episodes inline where possible, or grab direct download hosts — cards with
            staggered entrance animations for a clean browsing experience.
          </p>
        </header>

        {/* Search */}
        <div className="bg-white/4 border border-white/6 rounded-2xl p-4 shadow-sm mb-6 backdrop-blur-md">
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
              placeholder="Search anime (e.g. Naruto, Renegade Immortal...)"
              className="flex-1 px-4 py-3 rounded-lg bg-white/6 placeholder:text-slate-400 outline-none border border-transparent focus:border-white/10 transition"
            />
            <button
              onClick={() => doSearch(query)}
              className="px-4 py-3 bg-gradient-to-r from-[#6d28d9] to-[#ec4899] rounded-lg font-semibold shadow hover:brightness-105 transition"
            >
              Search
            </button>
            <button
              onClick={() => {
                setQuery(DEFAULT_QUERY);
                doSearch(DEFAULT_QUERY);
              }}
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

        {/* Loading bar */}
        {loadingSearch && (
          <div className="mb-4">
            <div className="h-2 bg-white/6 rounded overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-[#6d28d9] to-[#ec4899] animate-[progress_1.2s_linear_infinite]"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        )}

        {error && <div className="mb-4 text-red-400">{error}</div>}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.length === 0 && !loadingSearch && (
            <div className="text-slate-400">No results — try a different search.</div>
          )}

          {results.map((s, i) => {
            // determine reveal state
            const revealed = i < visibleCount;
            return (
              <article
                key={i}
                className={`rounded-2xl overflow-hidden shadow-lg border border-white/6 transform transition-all duration-500 ${
                  revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                }}
              >
                {/* square image */}
                <div className="w-full aspect-square relative bg-[#071227]">
                  <img
                    src={s.image || "/placeholder.png"}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.png")}
                  />
                  <div className="absolute left-3 top-3 px-2 py-1 rounded-md bg-gradient-to-r from-[#00000080] to-[#00000040] text-xs text-slate-200">
                    {s.type || "Series"} • {s.status || "Unknown"}
                  </div>
                </div>

                {/* body */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white line-clamp-2">{s.title}</div>
                    <div className="text-sm text-slate-300 mt-1 break-all">
                      <span className="text-slate-400">Source: </span>
                      <span className="text-amber-300">{s.link}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onWatchClick(s)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:brightness-105 transition text-sm font-medium"
                      title="Attempt to play the latest episode inline"
                    >
                      {watchLoading && downloadingFor === s.title ? <Spinner /> : <span>Watch</span>}
                    </button>

                    <button
                      onClick={() => onDownloadClick(s)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:brightness-105 transition text-sm font-medium"
                      title="Fetch download hosts"
                    >
                      {downloadLoading && downloadingFor === s.title ? (
                        <>
                          <Spinner /> <span>Download</span>
                        </>
                      ) : (
                        <span>Download</span>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Download panel */}
        {downloadLinks && (
          <section className="mt-6 bg-white/4 border border-white/6 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Download options — <span className="text-amber-300">{downloadingFor}</span>
              </h3>
              <button
                onClick={() => {
                  setDownloadLinks(null);
                  setDownloadingFor(null);
                  setDownloadError(null);
                }}
                className="text-sm text-slate-300"
              >
                Close
              </button>
            </div>

            {downloadError && <div className="text-red-400 mb-3">{downloadError}</div>}

            <div className="space-y-3">
              {downloadLinks.map((g, idx) => (
                <div key={idx} className="p-3 border border-white/6 rounded-lg bg-black/20">
                  <div className="text-sm font-medium mb-2">{g.resolution || "Unknown resolution"}</div>
                  <div className="flex flex-wrap gap-2">
                    {g.hosts.map((h, j) => (
                      <a
                        key={j}
                        href={h.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-white/6 rounded-md text-sm hover:bg-white/10"
                      >
                        {h.host || "Host"} — Open
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Watch modal */}
        {isWatching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={closeWatchModal} />
            <div className="relative z-10 w-full max-w-4xl bg-[#071227] rounded-xl shadow-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-white font-semibold">{videoTitle || "Playing..."}</div>
                <div className="flex gap-2">
                  <button onClick={closeWatchModal} className="text-slate-300 hover:text-white">
                    Close
                  </button>
                </div>
              </div>

              <div className="bg-black rounded-md overflow-hidden">
                {videoSrc ? (
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-[420px] bg-black object-contain"
                    src={/\.m3u8(\?|$)/i.test(String(videoSrc)) ? undefined : videoSrc ?? undefined}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-300">
                    {watchError ? <div className="text-red-400">{watchError}</div> : <div>Preparing player...</div>}
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Playback prefers direct MP4/HLS. If playback fails, check the Download options.
              </div>
            </div>
          </div>
        )}

        {/* debug */}
        <section className="mt-6 text-xs text-slate-400">
          <details>
            <summary className="cursor-pointer">Debug log ({debugLog.length})</summary>
            <div className="mt-2 max-h-40 overflow-auto">
              {debugLog.map((l, idx) => (
                <div key={idx} className="py-1 border-b last:border-b-0">
                  {l}
                </div>
              ))}
            </div>
          </details>
        </section>
      </section>

      {/* Small inline styles/animations */}
      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-[progress_1.2s_linear_infinite] {
          animation: progress 1.2s linear infinite;
          background-size: 200% 100%;
        }

        /* utility to ensure smooth card transitions */
        article {
          will-change: transform, opacity;
        }

        /* line-clamp fallback */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}

/* small inline spinner component */
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
