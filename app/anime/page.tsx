// app/anime/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";

/**
 * Anime search / watch / download page (inline components only)
 * APIs used:
 *  - https://api.siputzx.my.id/api/anime/anichin-search?query=...
 *  - https://api.siputzx.my.id/api/anime/anichin-episode?url=...
 *  - https://api.siputzx.my.id/api/anime/anichin-download?url=...
 *
 * Behavior:
 *  - defaultQuery runs on load
 *  - Watch => try to stream latest episode inside modal (if direct mp4/m3u8 found)
 *  - If streaming not possible, fall back to download UI (show links)
 *  - Download => fetch links and offer host/resolution links for user to download
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

  // Watch modal state
  const [isWatching, setIsWatching] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [watchLoading, setWatchLoading] = useState(false);
  const [watchError, setWatchError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Download state
  const [downloadingFor, setDownloadingFor] = useState<string | null>(null); // series title
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ resolution?: string; hosts: DownloadHost[] }[] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // small helper for debug
  function logDebug(line: string) {
    setDebugLog((s) => [line, ...s].slice(0, 80));
  }

  useEffect(() => {
    // run default search on mount
    doSearch(DEFAULT_QUERY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      logDebug("Search error: " + (err?.message || err));
    } finally {
      setLoadingSearch(false);
    }
  }

  // get episodes for a series (series.link)
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

  // fetch download links for an episode page url
  async function fetchDownloadLinks(episodeUrl: string) {
    logDebug("Fetching download links for " + episodeUrl);
    const res = await fetch(
      `https://api.siputzx.my.id/api/anime/anichin-download?url=${encodeURIComponent(episodeUrl)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Download request failed (${res.status})`);
    const json = await res.json();
    if (!json?.status) throw new Error("Download returned invalid data");
    // expected json.data: [{ resolution: "360p", links: [{ host, link }, ...] }, ...]
    const mapped = (json.data || []).map((r: any) => ({
      resolution: r.resolution,
      hosts: (r.links || []).map((l: any) => ({ host: l.host, link: l.link })),
    }));
    return mapped as { resolution?: string; hosts: DownloadHost[] }[];
  }

  // Utility to detect direct playable video URLs
  function pickPlayableLink(links: { resolution?: string; hosts: DownloadHost[] }[]) {
    const flat: string[] = [];
    for (const group of links) {
      for (const h of group.hosts) {
        if (h.link) flat.push(h.link);
      }
    }
    // prefer mp4 or m3u8
    const mp4 = flat.find((u) => /\.mp4(\?|$)/i.test(u));
    if (mp4) return mp4;
    const m3u8 = flat.find((u) => /\.m3u8(\?|$)/i.test(u));
    if (m3u8) return m3u8;
    // fallback: any https url
    return flat[0] ?? null;
  }

  // WATCH flow: series -> fetch episodes -> choose latest episode -> fetch download links -> try to stream if direct video found
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
      // pick the first episode (API returns newest first in your example)
      const ep = episodes[0];
      logDebug(`Selected episode ${ep.episodeNumber} -> ${ep.link}`);
      if (!ep.link) throw new Error("Episode link missing");
      // fetch download links for episode
      const links = await fetchDownloadLinks(ep.link);
      if (!links || links.length === 0) throw new Error("No download links found");
      // pick a playable link
      const candidate = pickPlayableLink(links);
      if (!candidate) {
        // no playable link — open download UI
        setWatchError("Streaming not available — showing download options.");
        setDownloadLinks(links);
        setDownloadingFor(series.title || ep.title || series.title || "Episode");
        setIsWatching(false); // we'll show download panel below
      } else {
        // If candidate is direct mp4 or m3u8 we will play it
        setVideoTitle(`${series.title} — Ep ${ep.episodeNumber ?? ""}`);
        setVideoSrc(candidate);
        setWatchError(null);
        setIsWatching(true);
        // leave modal open with video
      }
    } catch (err: any) {
      const msg = err?.message || "Watch flow failed";
      logDebug("Watch error: " + msg);
      setWatchError(msg);
      // fall back to attempting a download flow: try to get episodes and download links (best-effort)
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
      } catch (e) {
        logDebug("Fallback download error: " + (e as any)?.message || e);
      }
      setIsWatching(false);
    } finally {
      setWatchLoading(false);
    }
  }

  // DOWNLOAD flow: fetch episodes -> fetch download links -> open a direct link
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
      // attempt to auto-start download of the first host link
      const firstHost = links[0]?.hosts?.[0]?.link;
      if (firstHost) {
        logDebug("Auto-starting download for link: " + firstHost);
        // open in new tab to initiate download (can't force download in all cases due to CORS)
        window.open(firstHost, "_blank");
      }
    } catch (err: any) {
      setDownloadError(err?.message || "Download failed");
      logDebug("Download error: " + (err?.message || err));
    } finally {
      setDownloadLoading(false);
    }
  }

  function closeWatchModal() {
    setIsWatching(false);
    setVideoSrc(null);
    setVideoTitle(null);
    setWatchError(null);
    // pause video if playing
    try {
      videoRef.current?.pause();
      videoRef.current && (videoRef.current.src = "");
    } catch {}
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Anime — Search, Watch & Download</h1>
          <p className="mt-2 text-slate-600">
            Search Anichin anime, watch the latest episode in-site if possible, or download available hosts.
          </p>
        </header>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow mb-6">
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
              placeholder="Search anime"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200"
            />
            <button
              onClick={() => doSearch(query)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Search
            </button>
            <button
              onClick={() => {
                setQuery(DEFAULT_QUERY);
                doSearch(DEFAULT_QUERY);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg"
              title="Reset to default"
            >
              Default
            </button>
          </div>
        </div>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="text-sm text-slate-500">{results.length} items</div>
          </div>

          {loadingSearch && (
            <div className="mb-4">
              <div className="h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-pink-500 animate-[progress_1.2s_linear_infinite]" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.length === 0 && !loadingSearch && (
              <div className="text-slate-500">No results — try a different search.</div>
            )}

            {results.map((s, i) => (
              <article key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex gap-3">
                  <img
                    src={s.image || "/placeholder.png"}
                    alt={s.title}
                    className="w-28 h-20 object-cover rounded-md flex-shrink-0 bg-slate-100"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.type} • {s.status}</div>
                    <div className="mt-2 text-sm text-slate-700 line-clamp-3">
                      Link: <span className="text-indigo-600 break-all">{s.link}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onWatchClick(s)}
                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                    title="Try to watch the latest episode inline"
                  >
                    {watchLoading && downloadingFor === s.title ? "Working..." : "Watch Latest"}
                  </button>

                  <button
                    onClick={() => onDownloadClick(s)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                    title="Fetch download links for the latest episode"
                  >
                    {downloadLoading && downloadingFor === s.title ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner /> Downloading...
                      </span>
                    ) : (
                      "Download"
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Download panel */}
        {downloadLinks && (
          <section className="mt-6 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Download options — {downloadingFor}</h3>
              <button
                onClick={() => {
                  setDownloadLinks(null);
                  setDownloadingFor(null);
                  setDownloadError(null);
                }}
                className="text-sm text-slate-500"
              >
                Close
              </button>
            </div>

            {downloadError && <div className="text-red-600 mb-3">{downloadError}</div>}

            <div className="space-y-3">
              {downloadLinks.map((g, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="text-sm font-medium mb-2">{g.resolution || "Unknown resolution"}</div>
                  <div className="flex flex-wrap gap-2">
                    {g.hosts.map((h, j) => (
                      <a
                        key={j}
                        href={h.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-slate-100 rounded-md text-sm hover:bg-slate-200"
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
            <div className="absolute inset-0 bg-black/60" onClick={closeWatchModal} />
            <div className="relative z-10 w-full max-w-4xl bg-slate-900 rounded-xl shadow-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-white font-semibold">{videoTitle || "Playing..."}</div>
                <div className="flex gap-2">
                  <button onClick={closeWatchModal} className="text-slate-300 hover:text-white">Close</button>
                </div>
              </div>

              <div className="bg-black rounded-md overflow-hidden">
                {videoSrc ? (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    autoPlay
                    className="w-full h-[420px] bg-black object-contain"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-300">
                    {watchError ? <div className="text-red-400">{watchError}</div> : <div>Preparing player...</div>}
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                If playback fails, close and check the Download options shown below.
              </div>
            </div>
          </div>
        )}

        {/* small debug log */}
        <section className="mt-6 text-xs text-slate-500">
          <details>
            <summary className="cursor-pointer">Debug log ({debugLog.length})</summary>
            <div className="mt-2 max-h-40 overflow-auto">
              {debugLog.map((l, idx) => (
                <div key={idx} className="py-1 border-b last:border-b-0">{l}</div>
              ))}
            </div>
          </details>
        </section>
      </section>

      {/* Spinner keyframes */}
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-[progress_1.2s_linear_infinite] {
          animation: progress 1.2s linear infinite;
          background-size: 200% 100%;
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
