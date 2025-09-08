// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";

/**
 * Self-contained Songs page for Tevona
 * - No external UI imports (Button, Input, Card are inlined)
 * - Uses YT search API + community API (siputzx) and fallback downloader flow
 * - Paste into app/songs/page.tsx
 */

/* --------- CONFIG (adjust as needed) ---------- */
const YT_SEARCH_API = "https://api.siputzx.my.id/api/s/youtube?query=";
const COMMUNITY_API = "https://api.siputzx.my.id/api/d/ytpost?url=";
const LOCAL_YTDOWN = "/ytdown?url="; // your internal downloader route
const FALLBACK_DOWNLOADS = [
  (url) =>
    `https://api.giftedtech.web.id/api/download/yta?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`,
  (url) =>
    `https://api.giftedtech.web.id/api/download/ytmp4?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`,
  (url) =>
    `https://api.giftedtech.web.id/api/download/ytdlv2?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`,
];

/* ---------- Small inlined UI components ---------- */

function Button({ children, onClick, className = "", variant = "primary", title }) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-white/5 text-white hover:bg-white/10",
    soft: "bg-white/6 text-white hover:bg-white/12",
  };
  return (
    <button title={title} onClick={onClick} className={`${base} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`flex-1 bg-transparent outline-none px-3 py-2 text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-200`}
    />
  );
}

function Card({ title, subtitle, thumbnail, children, actions }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
      <div className="flex gap-3 p-3">
        <img
          src={thumbnail}
          alt={title}
          className="w-24 h-16 object-cover rounded-md flex-shrink-0 bg-slate-100"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
          <div className="mt-2 text-sm text-slate-700">{children}</div>
        </div>
      </div>
      {actions && (
        <div className="p-3 bg-white/50 flex gap-2 border-t border-slate-100">
          {actions}
        </div>
      )}
    </div>
  );
}

/* ---------- Main page ---------- */

export default function SongsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const [community, setCommunity] = useState(null);

  // auto-run initial sample search
  useEffect(() => {
    doSearch("tevona");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logDebug(line) {
    setDebugLog((s) => [line, ...s].slice(0, 50));
  }

  async function doSearch(q) {
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults([]);
    logDebug(`Searching for "${q}"...`);
    try {
      const res = await fetch(YT_SEARCH_API + encodeURIComponent(q));
      if (!res.ok) throw new Error(`Search request failed (${res.status})`);
      const json = await res.json();
      if (!json || !json.data) {
        setError("Search returned unexpected response");
        logDebug("Search: invalid response structure");
        setLoading(false);
        return;
      }
      setResults(json.data || []);
      logDebug(`Search returned ${json.data.length} items`);
    } catch (err) {
      setError(err?.message || "Search failed");
      logDebug(`Search error: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCommunity(url) {
    setCommunity(null);
    setError(null);
    logDebug(`Fetching community posts for ${url}`);
    try {
      const res = await fetch(COMMUNITY_API + encodeURIComponent(url));
      if (!res.ok) throw new Error(`Community request failed (${res.status})`);
      const json = await res.json();
      setCommunity(json);
      logDebug("Community fetched");
    } catch (err) {
      setError("Community fetch failed: " + (err?.message || err));
      logDebug(`Community error: ${err?.message || err}`);
    }
  }

  // Try local then fallbacks for download link
  async function tryDownload(videoUrl) {
    logDebug("Attempting download for: " + videoUrl);
    // Local downloader
    try {
      const local = await fetch(LOCAL_YTDOWN + encodeURIComponent(videoUrl));
      if (local.ok) {
        const j = await local.json().catch(() => null);
        if (j && (j.download_url || j.downloadUrl || j.result || j.dlink)) {
          logDebug("Local downloader returned a usable result");
          return j;
        } else {
          logDebug(`Local downloader returned ${local.status} with no download key`);
        }
      } else {
        logDebug(`Local downloader request failed (${local.status})`);
      }
    } catch (e) {
      logDebug("Local downloader error: " + (e?.message || e));
    }

    // Fallbacks
    for (const build of FALLBACK_DOWNLOADS) {
      const endpoint = build(videoUrl);
      logDebug("Trying fallback: " + endpoint);
      try {
        const r = await fetch(endpoint);
        const text = await r.text();
        // try parse JSON first
        try {
          const parsed = JSON.parse(text);
          if (parsed?.result || parsed?.download_url || parsed?.dlink || parsed?.downloadUrl) {
            logDebug("Fallback returned JSON with download info");
            return parsed;
          } else {
            logDebug("Fallback JSON did not contain download keys");
          }
        } catch {
          // not JSON, try to extract a media link
          const mp4Match = text.match(/https?:\/\/[^\s'"]+?\.(mp4|m3u8|mp3|webm)/i);
          if (mp4Match) {
            logDebug("Found media link inside fallback HTML");
            return { download_url: mp4Match[0] };
          }
          logDebug("Fallback HTML did not contain a direct media link");
        }
      } catch (e) {
        logDebug("Fallback request error: " + (e?.message || e));
      }
    }

    throw new Error("No working provider found");
  }

  async function onDownloadClick(item) {
    setError(null);
    const url = item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : "");
    if (!url) {
      setError("Invalid video url");
      return;
    }
    try {
      const info = await tryDownload(url);
      const dl =
        info?.download_url ||
        info?.downloadUrl ||
        info?.result?.download_url ||
        info?.dlink ||
        (typeof info === "string" ? info : null);
      if (!dl) {
        setError("Download result didn't contain a direct link. Check debug.");
        logDebug("Download object: " + JSON.stringify(info).slice(0, 500));
        return;
      }
      // open the download link
      window.open(dl, "_blank");
    } catch (err) {
      setError(err?.message || "Download failed");
      logDebug("Download flow error: " + (err?.message || err));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Tevona — Songs & YouTube Tools</h1>
          <p className="mt-2 text-slate-600">
            Search YouTube, preview results, stream or attempt downloads (tries local then fallbacks).
          </p>
        </header>

        {/* Search card */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 flex gap-3 items-center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search YouTube (e.g. Alan Walker Faded)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch(query);
                }}
              />
              <Button onClick={() => doSearch(query)} className="whitespace-nowrap">Search</Button>
              <Button variant="ghost" onClick={() => { setQuery(""); setResults([]); setError(null); }}>Clear</Button>
            </div>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto py-2">
            <Button variant="soft" onClick={() => doSearch("top songs")}>Top songs</Button>
            <Button variant="soft" onClick={() => doSearch("gospel kenya")}>Gospel Kenya</Button>
            <Button variant="soft" onClick={() => doSearch("instrumental")}>Instrumental</Button>
            <Button variant="soft" onClick={() => fetchCommunity("https://www.youtube.com/@YouTubeCreators/community")}>Community posts</Button>
            <Button variant="soft" onClick={() => doSearch("tevona")}>Tevona</Button>
          </div>
        </div>

        {/* Results */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="text-sm text-slate-500">{results.length} items</div>
          </div>

          {loading && (
            <div className="mb-4">
              <div className="h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-pink-500 animate-progress" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.length === 0 && !loading && (
              <div className="text-slate-500">No results yet — try a search above.</div>
            )}

            {results.map((r, i) => {
              const title = r.title || r.name || "Untitled";
              const thumb = r.thumbnail || r.image || (r.videoId ? `https://i.ytimg.com/vi/${r.videoId}/hq720.jpg` : "/placeholder.png");
              const subtitle = r.author?.name || r.channelName || r.channel || (r.views ? `${r.views} views` : "");
              const url = r.url || (r.videoId ? `https://www.youtube.com/watch?v=${r.videoId}` : "");
              return (
                <Card
                  key={i}
                  title={title}
                  subtitle={subtitle}
                  thumbnail={thumb}
                  actions={
                    <>
                      <Button variant="ghost" onClick={() => window.open(url, "_blank")}>Open</Button>
                      <Button onClick={() => onDownloadClick({ ...r, url })}>Download / Stream</Button>
                    </>
                  }
                >
                  <div className="text-sm text-slate-600 line-clamp-3">
                    {r.description || r.about || ""}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Community block */}
        {community && (
          <section className="mb-8 bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Community posts (fetched)</h3>
            <pre className="text-xs text-slate-600 overflow-auto max-h-64">{JSON.stringify(community, null, 2)}</pre>
          </section>
        )}

        {/* How to use */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">How to use</h3>
          <ol className="list-decimal list-inside text-slate-700 space-y-1">
            <li>Type a search query and press Enter or click Search.</li>
            <li>Click "Open" to view on YouTube, or "Download / Stream" to attempt downloading.</li>
            <li>The downloader tries your local /ytdown route first, then fallback providers.</li>
            <li>If a direct stream/download link is found the browser opens it in a new tab.</li>
          </ol>
        </section>

        {/* Debug */}
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

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.2s linear infinite;
          background-size: 200% 100%;
        }
        /* line-clamp fallback for simple environments */
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
