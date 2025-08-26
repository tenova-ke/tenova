"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, Download as DownloadIcon, Loader2 } from "lucide-react";

type ApkResult = {
  id: number;
  name: string;
  package: string;
  version?: string;
  size?: number;
  md5sum?: string;
  icon?: string;
  developer?: string;
  store?: string;
  downloads?: number;
  rating?: number;
};

export default function ApkPage() {
  const [query, setQuery] = useState("WhatsApp");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    doSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string) {
    if (!q || q.trim().length === 0) {
      setResults([]);
      return;
    }
    setError(null);
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`/api/apk/search?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = await res.json();
      setResults((json.results || []) as ApkResult[]);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function downloadApk(item: ApkResult) {
    setError(null);
    setProgress(0);
    setDownloadingId(item.id);
    abortRef.current = new AbortController();

    try {
      // ✅ Call your Next.js API route (proxy to Gifted)
      const res = await fetch(`/api/apk/download?name=${encodeURIComponent(item.name)}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || `Download failed (${res.status})`);
      }

      // ✅ Stream response to show progress
      const contentLength = Number(res.headers.get("content-length") || "0");
      if (!res.body) throw new Error("No response body from server.");

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
            setProgress((p) => Math.min(100, p + 3));
          }
        }
      }

      // ✅ Create file blob
      const blob = new Blob(chunks, { type: "application/vnd.android.package-archive" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName = sanitizeFileName(`${item.name || "app"}-${item.version || ""}`) + ".apk";
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      setProgress(100);
    } catch (err: any) {
      console.error("download error:", err);
      setError(err?.message || "Download failed");
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
        setProgress(0);
      }, 900);
      abortRef.current = null;
    }
  }

  function cancelDownload() {
    if (abortRef.current) {
      abortRef.current.abort();
      setError("Download aborted");
      setDownloadingId(null);
      setProgress(0);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07102a] via-[#1e1b2b] to-[#0b1220] text-white py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-400">
            📱 APK Explorer
          </h1>
          <p className="text-center text-white/70 mt-2">
            Search Aptoide apps and download APKs directly via our API.
          </p>
        </header>

        {/* Search bar */}
        <div className="flex gap-3 items-center mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSearch(query);
            }}
            placeholder="Search apps (e.g. WhatsApp, Spotify, Clash of Clans)..."
            className="flex-1 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 placeholder:text-white/50 outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
          <button
            onClick={() => doSearch(query)}
            className="rounded-2xl px-4 py-3 bg-gradient-to-r from-pink-500 to-blue-500 inline-flex items-center gap-2"
            aria-label="Search"
          >
            {loading ? <Loader2 className="animate-spin" /> : <SearchIcon />} Search
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-rose-400">{error}</div>}

        {/* Results */}
        <section className="space-y-4">
          {results.length === 0 && !loading && (
            <div className="py-14 text-center text-white/60 rounded-xl border border-white/6 bg-black/30">
              No results yet — try another query
            </div>
          )}

          {results.map((r) => (
            <article
              key={r.id}
              className="flex gap-4 items-center p-4 rounded-2xl border border-white/8 bg-black/50 shadow-md hover:scale-[1.01] transition"
              role="article"
            >
              <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                {r.icon ? (
                  <img src={r.icon} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-blue-500/20" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{r.name}</h3>
                    <p className="text-sm text-white/70 truncate mt-1">
                      {r.developer || r.store || "Unknown developer"}
                    </p>
                    <div className="flex gap-3 items-center text-xs text-white/60 mt-2">
                      <span>{r.version ? `v${r.version}` : "-"}</span>
                      <span>•</span>
                      <span>{r.size ? prettyBytes(r.size) : "-"}</span>
                      <span>•</span>
                      <span>{r.downloads ? compactNumber(r.downloads) : "-"}</span>
                      <span>•</span>
                      <span>{r.rating ? `${r.rating}★` : "-"}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <button
                      onClick={() => downloadApk(r)}
                      disabled={downloadingId !== null && downloadingId !== r.id}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm disabled:opacity-50 transition"
                      title="Download APK"
                    >
                      {downloadingId === r.id ? <Loader2 className="animate-spin" /> : <DownloadIcon />}
                      <span className="hidden sm:inline">Download</span>
                    </button>

                    <a
                      href={`https://open.aptoide.com/app/${r.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-300 hover:text-blue-200"
                    >
                      Open on store
                    </a>
                  </div>
                </div>

                {downloadingId === r.id && (
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-white/60">
                      <span>{progress < 100 ? `Downloading — ${progress}%` : "Finishing..."}</span>
                      <button onClick={cancelDownload} className="text-rose-300 underline text-xs">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */
function prettyBytes(n?: number) {
  if (!n && n !== 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let num = Number(n);
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return `${num.toFixed(num >= 100 ? 0 : 1)} ${units[i]}`;
}

function compactNumber(n?: number) {
  if (!n) return "-";
  if (n >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function sanitizeFileName(name?: string) {
  return (name || "file").replace(/[\/:*?"<>|]+/g, "").trim();
}
