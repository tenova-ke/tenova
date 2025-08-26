"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, Download as DownloadIcon, Play, XCircle, Loader2 } from "lucide-react";

/**
 * app/videos/page.tsx
 * Self-contained video downloader frontend that uses:
 *  - /api/youtube/search?q=...   (your search route)
 *  - /api/youtube/video?url=...  (your video metadata route)
 *  - /api/youtube/video?url=...&stream=1  (server pipes video)
 *
 * Place in app/videos/page.tsx and ensure Tailwind CSS is available.
 */

type SearchResult = {
  videoId: string;
  title: string;
  channel: string;
  publishedAt: string;
  thumbnail?: string;
  url: string;
};

export default function VideosPage() {
  const [query, setQuery] = useState<string>("lofi hip hop");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [server, setServer] = useState<"ytv" | "ytdlv2" | "ytdlv3">("ytv");

  // selected video + fetched metadata
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  // download state
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // initial search on mount
    doSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string) {
    if (!q || q.trim().length === 0) {
      setResults([]);
      return;
    }
    setError(null);
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `Search failed (${res.status})`);
      }
      setResults(Array.isArray(json.results) ? json.results : []);
    } catch (err: any) {
      console.error("search error:", err);
      setError(err?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function fetchMetadata(item: SearchResult) {
    setSelected(item);
    setMeta(null);
    setMetaLoading(true);
    setError(null);

    try {
      // Call your server metadata endpoint with server selection
      const res = await fetch(
        `/api/youtube/video?url=${encodeURIComponent(item.url)}&server=${encodeURIComponent(server)}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `Metadata fetch failed (${res.status})`);
      }
      setMeta(json);
    } catch (err: any) {
      console.error("metadata error:", err);
      setError(err?.message || "Failed to fetch video metadata");
    } finally {
      setMetaLoading(false);
    }
  }

  function openStreamInNewTab() {
    if (!selected) return;
    const url = `/api/youtube/video?url=${encodeURIComponent(selected.url)}&server=${encodeURIComponent(
      server
    )}&stream=1`;
    // open server-streamed video in new tab (allows inline playback)
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function downloadViaServer() {
    if (!selected) return;
    setError(null);
    setProgress(0);
    setDownloading(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/youtube/video?url=${encodeURIComponent(selected.url)}&server=${encodeURIComponent(
          server
        )}&stream=1`,
        { signal: abortRef.current.signal }
      );

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `Download failed (${res.status})`);
      }

      if (!res.body) {
        // fallback: open in new tab
        window.open(res.url, "_blank", "noopener,noreferrer");
        setDownloading(false);
        return;
      }

      const contentLength = Number(res.headers.get("content-length") || "0");
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          if (contentLength) {
            setProgress(Math.round((received / contentLength) * 100));
          } else {
            // no content-length -> animate progress conservatively
            setProgress((p) => Math.min(98, p + 3));
          }
        }
      }

      // build blob and download
      const blob = new Blob(chunks, { type: "video/mp4" });
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTitle = sanitizeFileName((meta?.title as string) || selected.title || "video");
      a.href = urlObj;
      a.download = `${safeTitle}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);

      setProgress(100);
    } catch (err: any) {
      console.error("download error:", err);
      if (err?.name === "AbortError") {
        setError("Download cancelled");
      } else {
        setError(err?.message || "Download failed");
      }
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setProgress(0);
      }, 700);
      abortRef.current = null;
    }
  }

  function cancelDownload() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07102a] via-[#0b1220] to-[#041024] text-white py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">🎬 Video Downloader</h1>
            <p className="text-sm text-white/70 mt-1">
              Search YouTube, pick a server, stream or download via your server proxy.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={server}
              onChange={(e) => setServer(e.target.value as any)}
              className="bg-black/40 border border-white/10 px-3 py-2 rounded-md text-sm outline-none"
              title="Choose server"
            >
              <option value="ytv">ytv (default)</option>
              <option value="ytdlv2">ytdlv2</option>
              <option value="ytdlv3">ytdlv3</option>
            </select>
            <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch(query);
                }}
                placeholder="Search videos (title, artist, topic)..."
                className="bg-transparent outline-none text-sm min-w-[220px]"
              />
              <button
                onClick={() => doSearch(query)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-blue-500 px-3 py-1 rounded-full text-sm"
                aria-label="Search"
              >
                {searching ? <Loader2 className="animate-spin" /> : <SearchIcon />} Search
              </button>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: results */}
          <section className="md:col-span-2 space-y-4">
            <div className="rounded-xl bg-black/40 p-3 border border-white/6">
              <h2 className="font-semibold mb-2">Results</h2>

              {error && (
                <div className="text-rose-400 text-sm mb-3 bg-rose-900/10 p-2 rounded">
                  {error}
                </div>
              )}

              {searching && (
                <div className="py-8 text-center text-sm text-white/60">
                  <Loader2 className="animate-spin mx-auto" />
                </div>
              )}

              {!searching && results.length === 0 && (
                <div className="py-8 text-center text-sm text-white/60">
                  No results — try another search
                </div>
              )}

              <ul className="space-y-3">
                {results.map((r) => (
                  <li
                    key={r.videoId}
                    className={`flex gap-3 items-center p-3 rounded-lg border border-white/6 hover:bg-white/3 transition cursor-pointer ${
                      selected?.videoId === r.videoId ? "ring-2 ring-pink-500/40 bg-white/4" : ""
                    }`}
                    onClick={() => fetchMetadata(r)}
                  >
                    <img src={r.thumbnail} alt={r.title} className="w-28 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium truncate">{r.title}</h3>
                        <span className="text-xs text-white/60 ml-2">{new Date(r.publishedAt).getFullYear()}</span>
                      </div>
                      <p className="text-xs text-white/60 truncate mt-1">{r.channel}</p>
                      <p className="text-xs text-white/50 mt-1 truncate">{r.url}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Right: video card + actions */}
          <aside className="space-y-4">
            <div className="rounded-xl bg-black/40 p-4 border border-white/6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Preview & Actions</h3>
                {metaLoading && <Loader2 className="animate-spin" />}
              </div>

              {!selected && <p className="text-sm text-white/60 mt-3">Select a video from the list to view details.</p>}

              {selected && (
                <div className="mt-3 space-y-3">
                  <img
                    src={selected.thumbnail}
                    alt={selected.title}
                    className="w-full rounded-md object-cover"
                    style={{ maxHeight: 160 }}
                  />
                  <div>
                    <h4 className="font-semibold truncate">{selected.title}</h4>
                    <p className="text-xs text-white/60">{selected.channel}</p>
                    <p className="text-xs text-white/50 mt-1">URL: <span className="break-all">{selected.url}</span></p>
                  </div>

                  {/* Metadata from backend */}
                  {meta && (
                    <div className="mt-2 text-sm text-white/70 space-y-1">
                      <div><strong>Title:</strong> {meta.title}</div>
                      <div><strong>Quality:</strong> {meta.quality ?? "—"}</div>
                      <div><strong>Duration:</strong> {meta.duration ?? "—"}</div>
                      <div><strong>Source:</strong> {meta.source ?? server}</div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={openStreamInNewTab}
                      disabled={!selected}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 disabled:opacity-40"
                      title="Stream via server"
                    >
                      <Play className="w-4 h-4" /> Stream
                    </button>

                    <button
                      onClick={downloadViaServer}
                      disabled={!selected || downloading}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-40"
                    >
                      {downloading ? <Loader2 className="animate-spin w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}{" "}
                      <span>{downloading ? `Downloading ${progress}%` : "Download"}</span>
                    </button>
                  </div>

                  {downloading && (
                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                        <div>{progress < 100 ? `Downloading — ${progress}%` : "Finalizing..."}</div>
                        <button onClick={cancelDownload} className="text-rose-300 underline text-xs inline-flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick metadata fetch button */}
                  <div className="mt-3 text-sm text-white/60">
                    <button
                      onClick={() => fetchMetadata(selected)}
                      className="text-xs underline"
                    >
                      Refresh metadata
                    </button>
                    {!meta && !metaLoading && <span className="ml-2 text-xs text-white/50"> (click a video to load metadata)</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Helpful tips / fallback */}
            <div className="rounded-xl bg-black/30 p-3 border border-white/6 text-sm text-white/60">
              <strong>Tips</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Try alternate servers if a video fails to fetch.</li>
                <li>Use "Stream" to preview before downloading.</li>
                <li>Large downloads happen via server—expect time proportional to file size.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ---------------- helpers ---------------- */

function sanitizeFileName(name?: string) {
  return (name || "file").replace(/[\/:*?"<>|]+/g, "").trim();
}
