// app/anime/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Tevona Anime page — stacked square cards with entrance animation & HLS support
 * Place at: app/anime/page.tsx
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

export default function AnimePage(): JSX.Element {
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
  const hlsRef = useRef<any>(null);

  // download state
  const [downloadingFor, setDownloadingFor] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ resolution?: string; hosts: DownloadHost[] }[] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // intersection observer for entrance animation
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    doSearch(DEFAULT_QUERY);
    // cleanup hls on unload
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

  // observe cards for entrance animation
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
      { root: null, rootMargin: "0px", threshold: 0.12 }
    );
    Object.values(cardRefs.current).forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
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
    } catch (err) {
      const msg = err && (err as any).message ? (err as any).message : String(err);
      setError(msg || "Search failed");
      logDebug("Search error: " + msg);
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

      // If m3u8, attempt to use hls.js
      if (/\.m3u8(\?|$)/i.test(candidate)) {
        try {
          // try dynamic import of hls.js in browser
          const Hls = (await import("hls.js")).default;
          if (Hls && videoRef.current) {
            if (hlsRef.current?.destroy) hlsRef.current.destroy();
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(candidate);
            hls.attachMedia(videoRef.current);
            // auto play when attached
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              try {
                videoRef.current?.play();
              } catch {}
            });
            setIsWatching(true);
            setWatchLoading(false);
            return;
          }
        } catch (e) {
          logDebug("hls.js dynamic import failed, fallback to native or open link");
        }
      }

      // if mp4 or native we just set src and let browser play
      if (videoRef.current) {
        videoRef.current.src = candidate;
        try {
          await videoRef.current.play();
        } catch {}
      }
      setIsWatching(true);
    } catch (err) {
      const msg = err && (err as any).message ? (err as any).message : String(err);
      logDebug("Watch error: " + msg);
      setWatchError(msg);
      try {
        // fallback: fetch download links to show to user
        if (series.link) {
          const episodes = await fetchEpisodes(series.link);
          if (episodes && episodes.length > 0) {
            const ep = episodes[0];
            const links = await fetchDownloadLinks(ep.link as string);
            setDownloadLinks(links);
            setDownloadingFor(series.title || ep.title || "Episode");
          }
        }
      } catch (e) {
        const msg2 = e && (e as any).message ? (e as any).message : String(e);
        logDebug("Fallback download error: " + msg2);
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
      // try direct open first host
      const firstHost = links[0]?.hosts?.[0]?.link;
      if (firstHost) {
        logDebug("Auto-starting download for link: " + firstHost);
        window.open(firstHost, "_blank");
      }
    } catch (err) {
      const msg = err && (err as any).message ? (err as any).message : String(err);
      setDownloadError(msg || "Download failed");
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

  const isM3u8 = /\.m3u8(\?|$)/i.test(String(videoSrc));

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071227] via-[#0f172a] to-[#071324] text-white p-6">
      <section className="max-w-5xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Tevona — Anime Hub</h1>
          <p className="mt-2 text-slate-300 max-w-2xl mx-auto">
            Search Anichin, watch episodes inline (HLS support), or grab direct download hosts. Cards animate into view as
            you scroll.
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

        {/* Results (stacked cards) */}
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
            {results.length === 0 && !loadingSearch && (
              <div className="text-slate-400">No results — try a different search.</div>
            )}

            {results.map((s, i) => (
              <article key={i} ref={(el) => (cardRefs.current[i] = el)} className="article-card">
                {/* square image container */}
                <div className="square-image">
                  <img
                    src={s.image || "/placeholder.png"}
                    alt={s.title}
                    className="square-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 pr-4">
                      <div className="text-lg font-semibold text-white">{s.title}</div>
                      <div className="text-sm text-slate-300 mt-1">
                        {s.type || "—"} • {s.status || "—"}
                      </div>
                      <div className="mt-3 text-sm text-slate-300 line-clamp-3">
                        <span className="text-slate-400">Source: </span>
                        <span className="break-all text-amber-300">{s.link}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setDownloadingFor(s.title ?? null); // indicate which item action relates to
                          onWatchClick(s);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg font-medium hover:brightness-105 transition"
                        title="Attempt to play the latest episode inline"
                      >
                        {watchLoading && downloadingFor === s.title ? <Spinner /> : <span>Watch</span>}
                      </button>

                      <button
                        onClick={() => {
                          setDownloadingFor(s.title ?? null);
                          onDownloadClick(s);
                        }}
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
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-[420px] bg-black object-contain"
                  // if it's HLS, HLS attaches; otherwise set src for mp4
                  src={isM3u8 ? undefined : videoSrc ?? undefined}
                />
                {!videoSrc && (
                  <div className="p-8 text-center text-slate-300">
                    {watchError ? <div className="text-red-400">{watchError}</div> : <div>Preparing player...</div>}
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Playback attempts HLS (m3u8) first using hls.js (dynamically loaded). If unavailable, the best host is shown
                in Download options. If the player cannot play the file, click Download to open hosts.
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
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 22px rgba(2, 6, 23, 0.6);
          transform: translateY(14px);
          opacity: 0;
          transition: transform 650ms cubic-bezier(.16, .84, .44, 1), opacity 650ms cubic-bezier(.16, .84, .44, 1);
        }
        .article-card.in-view {
          transform: translateY(0);
          opacity: 1;
        }

        /* square image container */
        .square-image {
          position: relative;
          width: 100%;
          padding-bottom: 100%; /* 1:1 aspect */
          background: linear-gradient(90deg, #0b1220, #0f172a);
        }
        .square-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* entrance subtitle animation (fade+slide) handled by .article-card + in-view */
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* small responsive tweaks */
        @media (min-width: 1024px) {
          .square-image {
            /* keeps same square but allows crispness on large screens */
            background-size: cover;
          }
        }
      `}</style>
    </main>
  );
}

/* small spinner */
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
