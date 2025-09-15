// app/anime/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Tevona — Anime Hub page
 * - Single-file, client component for Next.js app directory
 * - Uses siputzx.anichin APIs:
 *     search:  /api/anime/anichin-search?query=
 *     episodes: /api/anime/anichin-episode?url=
 *     download: /api/anime/anichin-download?url=
 *
 * Notes:
 * - hls.js is loaded from CDN at runtime if needed (avoids bundling).
 * - ref callback assignment uses a safe cast so TypeScript is happy.
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

const DEFAULT_QUERY = "Renegade Immortal";

declare global {
  interface Window {
    Hls?: any;
  }
}

export default function AnimePage(): JSX.Element {
  // search
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [results, setResults] = useState<SeriesItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // watch
  const [isWatching, setIsWatching] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [watchLoading, setWatchLoading] = useState(false);
  const [watchError, setWatchError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<any>(null);

  // episodes picker
  const [episodePickerFor, setEpisodePickerFor] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeItem[] | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // downloads
  const [downloadingFor, setDownloadingFor] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ resolution?: string; hosts: DownloadHost[] }[] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // intersection observer refs for entrance animation
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    doSearch(DEFAULT_QUERY);

    // cleanup hls on unmount
    return () => {
      try {
        if (hlsRef.current?.destroy) hlsRef.current.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logDebug(line: string) {
    setDebugLog((s) => [line, ...s].slice(0, 200));
  }

  // observe for animation
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

  // runtime load hls.js from CDN
  async function ensureHlsLoaded(): Promise<any> {
    if (typeof window === "undefined") return null;
    if ((window as any).Hls) return (window as any).Hls;
    return new Promise((resolve, reject) => {
      const url = "https://cdn.jsdelivr.net/npm/hls.js@1.5.1/dist/hls.min.js";
      if (document.querySelector(`script[src="${url}"]`)) {
        const t = setInterval(() => {
          if ((window as any).Hls) {
            clearInterval(t);
            resolve((window as any).Hls);
          }
        }, 120);
        setTimeout(() => {
          clearInterval(t);
          reject(new Error("hls.js load timeout"));
        }, 10000);
        return;
      }
      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => {
        if ((window as any).Hls) resolve((window as any).Hls);
        else reject(new Error("hls loaded but window.Hls missing"));
      };
      s.onerror = () => reject(new Error("Failed to load hls.js"));
      document.head.appendChild(s);
    });
  }

  // API helpers
  async function doSearch(q: string) {
    setError(null);
    setResults([]);
    setLoadingSearch(true);
    logDebug(`Search: ${q}`);
    try {
      const res = await fetch(`https://api.siputzx.my.id/api/anime/anichin-search?query=${encodeURIComponent(q)}`, { cache: "no-store" });
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
      const msg = err?.message ?? String(err);
      setError(msg);
      logDebug("Search error: " + msg);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function fetchEpisodes(seriesLink: string) {
    logDebug("Fetching episodes for " + seriesLink);
    const res = await fetch(`https://api.siputzx.my.id/api/anime/anichin-episode?url=${encodeURIComponent(seriesLink)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Episodes request failed (${res.status})`);
    const json = await res.json();
    if (!json?.status) throw new Error("Episodes returned invalid data");
    return (json.data || []) as EpisodeItem[];
  }

  async function fetchDownloadLinks(episodeUrl: string) {
    logDebug("Fetching download links for " + episodeUrl);
    const res = await fetch(`https://api.siputzx.my.id/api/anime/anichin-download?url=${encodeURIComponent(episodeUrl)}`, { cache: "no-store" });
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

  // Watch flow: fetch episodes -> fetch links -> play candidate or show download options
  async function onWatchClick(series: SeriesItem) {
    setWatchError(null);
    setVideoSrc(null);
    setVideoTitle(null);
    setEpisodes(null);
    setEpisodePickerFor(series.title ?? null);
    setEpisodesLoading(true);
    logDebug(`Episode list requested for: ${series.title}`);
    try {
      if (!series.link) throw new Error("Series has no link");
      const eps = await fetchEpisodes(series.link);
      if (!eps || eps.length === 0) throw new Error("No episodes found");
      // show episode picker; user chooses episode to play
      setEpisodes(eps);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setWatchError(msg);
      logDebug("Episode list error: " + msg);
      setEpisodePickerFor(null);
      // fallback attempt: try first episode auto-play
      try {
        if (series.link) {
          const eps = await fetchEpisodes(series.link);
          const ep = eps[0];
          if (ep?.link) await watchEpisode(series, ep);
        }
      } catch (e: any) {
        logDebug("Fallback watch failed: " + (e?.message ?? String(e)));
      }
    } finally {
      setEpisodesLoading(false);
    }
  }

  // central watch routine for a specific episode
  async function watchEpisode(series: SeriesItem, ep: EpisodeItem) {
    setWatchError(null);
    setVideoSrc(null);
    setVideoTitle(null);
    setIsWatching(true);
    setWatchLoading(true);
    logDebug(`Watch episode requested: ${series.title} — ${ep.episodeNumber}`);
    try {
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

      // if m3u8 attempt HLS runtime
      if (/\.m3u8(\?|$)/i.test(candidate)) {
        try {
          const Hls = await ensureHlsLoaded();
          if (Hls && videoRef.current) {
            if (hlsRef.current?.destroy) hlsRef.current.destroy();
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(candidate);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              try {
                videoRef.current?.play();
              } catch {}
            });
            setIsWatching(true);
            setEpisodes(null);
            setEpisodePickerFor(null);
            setWatchLoading(false);
            return;
          }
        } catch (e: any) {
          logDebug("hls runtime failed: " + (e?.message ?? String(e)));
        }
      }

      // mp4/native
      if (videoRef.current) {
        videoRef.current.src = candidate;
        try {
          await videoRef.current.play();
        } catch {}
      }
      setIsWatching(true);
      setEpisodes(null);
      setEpisodePickerFor(null);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setWatchError(msg);
      logDebug("Watch error: " + msg);
      // fallback: show download links
      try {
        if (ep.link) {
          const links = await fetchDownloadLinks(ep.link);
          setDownloadLinks(links);
          setDownloadingFor(series.title || ep.title || "Episode");
        }
      } catch (e: any) {
        logDebug("Fallback download error: " + (e?.message ?? String(e)));
      }
      setIsWatching(false);
    } finally {
      setWatchLoading(false);
    }
  }

  // Download flow
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
      // attempt to open first host to trigger browser / downloader
      const firstHost = links[0]?.hosts?.[0]?.link;
      if (firstHost) {
        logDebug("Auto-opening host: " + firstHost);
        window.open(firstHost, "_blank");
      }
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setDownloadError(msg);
      logDebug("Download error: " + msg);
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
      if (hlsRef.current?.destroy) hlsRef.current.destroy();
      hlsRef.current = null;
    } catch {}
  }

  // shallow copy to compute isM3u8 for video tag logic
  const isM3u8 = /\.m3u8(\?|$)/i.test(String(videoSrc));

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071227] via-[#0f172a] to-[#071324] text-white p-6">
      <section className="max-w-5xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Tevona — Anime Hub</h1>
          <p className="mt-2 text-slate-300 max-w-2xl mx-auto">
            Search Anichin, choose episodes, watch inline (HLS support) or grab direct download hosts. Cards animate into view.
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
            <button onClick={() => doSearch(query)} className="px-4 py-3 bg-gradient-to-r from-[#6d28d9] to-[#ec4899] rounded-lg font-semibold shadow hover:brightness-105 transition">
              Search
            </button>
            <button onClick={() => { setQuery(DEFAULT_QUERY); doSearch(DEFAULT_QUERY); }} className="px-3 py-3 bg-white/6 rounded-lg border border-white/6" title="Reset to default">
              Default
            </button>
          </div>
        </div>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="text-sm text-slate-400">{results.length} items</div>
          </div>

          {loadingSearch && (
            <div className="mb-4">
              <div className="h-2 bg-white/6 rounded overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#6d28d9] to-[#ec4899] animate-progress" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {error && <div className="mb-4 text-red-400">{error}</div>}

          <div className="space-y-6">
            {results.length === 0 && !loadingSearch && <div className="text-slate-400">No results — try a different search.</div>}

            {results.map((s, i) => (
              <article
                key={i}
                ref={(el) => {
                  // cast to HTMLDivElement | null to satisfy TS (el is HTMLElement|null)
                  cardRefs.current[i] = (el as HTMLDivElement) ?? null;
                }}
                className="article-card opacity-0"
              >
                {/* square image */}
                <div className="square-image">
                  <img
                    src={s.image || "/placeholder.png"}
                    alt={s.title}
                    className="square-img"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 pr-4">
                      <div className="text-lg font-semibold text-white">{s.title}</div>
                      <div className="text-sm text-slate-300 mt-1">{s.type || "—"} • {s.status || "—"}</div>
                      <div className="mt-3 text-sm text-slate-300 line-clamp-3">
                        <span className="text-slate-400">Source: </span>
                        <span className="break-all text-amber-300">{s.link}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setDownloadingFor(s.title ?? null); onWatchClick(s); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg font-medium hover:brightness-105 transition"
                        title="Pick an episode to play"
                      >
                        {watchLoading && downloadingFor === s.title ? <Spinner /> : <span>Watch</span>}
                      </button>

                      <button
                        onClick={() => { setDownloadingFor(s.title ?? null); onDownloadClick(s); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg font-medium hover:brightness-105 transition"
                        title="Fetch download hosts"
                      >
                        {downloadLoading && downloadingFor === s.title ? <Spinner /> : <span>Download</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Episode picker modal */}
        {episodes && episodePickerFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => { setEpisodes(null); setEpisodePickerFor(null); }} />
            <div className="relative z-10 w-full max-w-3xl bg-[#071227] rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Episodes — <span className="text-amber-300">{episodePickerFor}</span></div>
                <div><button onClick={() => { setEpisodes(null); setEpisodePickerFor(null); }} className="text-slate-300">Close</button></div>
              </div>

              <div className="max-h-80 overflow-auto space-y-2">
                {episodes.map((ep, idx) => (
                  <div key={idx} className="p-3 bg-white/3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{ep.title || `Episode ${ep.episodeNumber ?? idx + 1}`}</div>
                      <div className="text-xs text-slate-400">{ep.subStatus || ""} • {ep.releaseDate || ""}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => watchEpisode(results.find(r => r.title === episodePickerFor) as SeriesItem, ep)} className="px-3 py-1 bg-emerald-600 rounded">Watch</button>
                      <button onClick={async () => {
                        setDownloadError(null);
                        setDownloadLinks(null);
                        setDownloadingFor(episodePickerFor);
                        setDownloadLoading(true);
                        try {
                          if (!ep.link) throw new Error("Episode link missing");
                          const links = await fetchDownloadLinks(ep.link);
                          setDownloadLinks(links);
                        } catch (err: any) {
                          setDownloadError(err?.message || String(err));
                        } finally {
                          setDownloadLoading(false);
                        }
                      }} className="px-3 py-1 bg-indigo-600 rounded">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Download panel */}
        {downloadLinks && (
          <section className="mt-6 bg-white/4 border border-white/6 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Download options — <span className="text-amber-300">{downloadingFor}</span></h3>
              <button onClick={() => { setDownloadLinks(null); setDownloadingFor(null); setDownloadError(null); }} className="text-sm text-slate-300">Close</button>
            </div>

            {downloadError && <div className="text-red-400 mb-3">{downloadError}</div>}

            <div className="space-y-3">
              {downloadLinks.map((g, idx) => (
                <div key={idx} className="p-3 border border-white/6 rounded-lg bg-black/20">
                  <div className="text-sm font-medium mb-2">{g.resolution || "Unknown resolution"}</div>
                  <div className="flex flex-wrap gap-2">
                    {g.hosts.map((h, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <a href={h.link} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white/6 rounded-md text-sm hover:bg-white/10">{h.host || "Host"} — Open</a>
                        <button onClick={() => { try { void navigator.clipboard.writeText(h.link || ""); logDebug("Copied link"); } catch (e) { logDebug("Copy failed"); } }} className="px-2 py-1 bg-white/6 rounded text-xs">Copy</button>
                      </div>
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
                <div className="flex gap-2"><button onClick={closeWatchModal} className="text-slate-300 hover:text-white">Close</button></div>
              </div>

              <div className="bg-black rounded-md overflow-hidden">
                <video
                  ref={(el) => (videoRef.current = el)}
                  controls
                  className="w-full h-[420px] bg-black object-contain"
                  src={isM3u8 ? undefined : videoSrc ?? undefined}
                />
                {!videoSrc && <div className="p-8 text-center text-slate-300">{watchError ? <div className="text-red-400">{watchError}</div> : <div>Preparing player...</div>}</div>}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Playback tries HLS (m3u8) first (hls.js loaded at runtime). If that fails, use Download options to open hosts.
              </div>
            </div>
          </div>
        )}

        {/* debug */}
        <section className="mt-6 text-xs text-slate-400">
          <details>
            <summary className="cursor-pointer">Debug log ({debugLog.length})</summary>
            <div className="mt-2 max-h-40 overflow-auto">
              {debugLog.map((l, idx) => <div key={idx} className="py-1 border-b last:border-b-0">{l}</div>)}
            </div>
          </details>
        </section>
      </section>

      {/* styles */}
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.2s linear infinite;
          background-size: 200% 100%;
        }

        /* card & entrance animation */
        .article-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 22px rgba(2,6,23,0.6);
          transform: translateY(14px);
          opacity: 0;
          transition: transform 650ms cubic-bezier(.16,.84,.44,1), opacity 650ms cubic-bezier(.16,.84,.44,1);
          display: block;
        }
        .article-card.in-view {
          transform: translateY(0);
          opacity: 1;
        }

        .square-image {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          background: linear-gradient(90deg,#0b1220,#0f172a);
        }
        .square-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}

/* Spinner component */
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
