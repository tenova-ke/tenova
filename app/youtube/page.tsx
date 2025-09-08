"use client";

import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

/**
 * Important: adjust these endpoints if you self-host or prefer different providers.
 * - YT_SEARCH_API: siputzx search API (you provided earlier)
 * - COMMUNITY_API: siputzx community-posts API
 * - LOCAL_YTDOWN: your own /ytdown route (tevona) — page tries this first
 * - FALLBACK_DOWNLOADS: list of fallback providers (gifted etc.)
 */
const YT_SEARCH_API = "https://api.siputzx.my.id/api/s/youtube?query=";
const COMMUNITY_API = "https://api.siputzx.my.id/api/d/ytpost?url=";
const LOCAL_YTDOWN = "/ytdown?url="; // your own downloader route (if available)
const FALLBACK_DOWNLOADS = [
  (url: string) =>
    `https://api.giftedtech.web.id/api/download/yta?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`,
  (url: string) =>
    `https://api.giftedtech.web.id/api/download/ytmp4?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`,
  (url: string) =>
    `https://api.giftedtech.web.id/api/download/ytdlv2?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(
      url
    )}`,
];

type ResultItem = any;

export default function SongsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [community, setCommunity] = useState<any | null>(null);

  // auto-generate example search on open
  useEffect(() => {
    doSearch("tevona"); // sample auto-run
  }, []);

  function logDebug(line: string) {
    setDebugLog((s) => [line, ...s].slice(0, 30));
  }

  async function doSearch(q: string) {
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults([]);
    logDebug(`Searching for "${q}"...`);
    try {
      const res = await fetch(YT_SEARCH_API + encodeURIComponent(q));
      const json = await res.json();
      if (!json || !json.data) {
        setError("Search returned unexpected response");
        logDebug("Search: no data key in response");
        setLoading(false);
        return;
      }
      setResults(json.data);
      logDebug(`Search returned ${json.data.length} items`);
    } catch (err: any) {
      setError(err.message || "Search failed");
      logDebug(`Search error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCommunity(url: string) {
    setCommunity(null);
    setError(null);
    logDebug(`Fetching community posts for ${url}`);
    try {
      const res = await fetch(COMMUNITY_API + encodeURIComponent(url));
      const json = await res.json();
      setCommunity(json);
      logDebug("Community fetched");
    } catch (err: any) {
      setError("Community fetch failed: " + (err.message || err));
      logDebug(`Community error: ${err.message || err}`);
    }
  }

  // try local + fallbacks to get a downloadable link (returns object or throws)
  async function tryDownload(videoUrl: string) {
    logDebug("Attempting download flow for: " + videoUrl);
    // Try local first
    try {
      const local = await fetch(LOCAL_YTDOWN + encodeURIComponent(videoUrl));
      const j = await local.json().catch(() => null);
      if (local.ok && j && (j.download_url || j.downloadUrl || j.result)) {
        logDebug("Local downloader ok");
        return j;
      } else {
        logDebug("Local downloader failed or returned no url (" + local.status + ")");
      }
    } catch (e: any) {
      logDebug("Local downloader error: " + (e.message || e));
    }

    // Try fallbacks sequentially
    for (const build of FALLBACK_DOWNLOADS) {
      const endpoint = build(videoUrl);
      logDebug("Trying fallback: " + endpoint);
      try {
        const r = await fetch(endpoint);
        // many fallback providers return HTML or JSON — try JSON first
        const text = await r.text();
        // try parse JSON
        try {
          const parsed = JSON.parse(text);
          if (parsed?.result || parsed?.download_url || parsed?.downloadUrl) {
            logDebug("Fallback JSON success");
            return parsed;
          }
          logDebug("Fallback returned JSON but no download key");
        } catch {
          // not JSON — try to find a direct link inside HTML
          const mp4Match = text.match(/https?:\/\/[^\s'"]+?\.(mp4|m3u8|mp3)/i);
          if (mp4Match) {
            logDebug("Fallback HTML: found direct media link");
            return { download_url: mp4Match[0] };
          }
          logDebug("Fallback HTML - no direct media link found");
        }
      } catch (e: any) {
        logDebug("Fallback request error: " + (e.message || e));
      }
    }

    throw new Error("No working provider found");
  }

  async function onDownloadClick(item: ResultItem) {
    setError(null);
    try {
      const info = await tryDownload(item.url || item.videoId ? item.url || `https://youtube.com/watch?v=${item.videoId}` : "");
      // Show in new window if we have a direct download_url
      const dl =
        info?.download_url ||
        info?.result?.download_url ||
        info?.dlink ||
        info?.downloadUrl ||
        info?.download_url;
      if (!dl) {
        setError("Download info received but no download_url found. Check debug.");
        logDebug("Download object: " + JSON.stringify(info).slice(0, 400));
        return;
      }
      // open in new tab (stream or direct download)
      window.open(dl, "_blank");
    } catch (err: any) {
      setError(err.message || "Download failed");
      logDebug("Download flow error: " + (err.message || err));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6">
      <section className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Tevona — Songs & YouTube Tools
          </h1>
          <p className="mt-2 text-slate-600">
            Search YouTube, preview results, stream or attempt downloads (tries local then fallbacks).
          </p>
        </header>

        {/* Search area */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex gap-4 items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube (e.g. Alan Walker Faded)"
              onKeyDown={(e) => {
                if (e.key === "Enter") doSearch(query);
              }}
            />
            <Button onClick={() => doSearch(query)} className="whitespace-nowrap">
              Search
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setQuery("");
                setResults([]);
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto py-2">
            {/* tool buttons (horizontal scrolling) */}
            <Button onClick={() => doSearch("top songs")} variant="soft">
              Top songs
            </Button>
            <Button onClick={() => doSearch("gospel kenya")} variant="soft">
              Gospel Kenya
            </Button>
            <Button onClick={() => doSearch("instrumental")} variant="soft">
              Instrumental
            </Button>
            <Button onClick={() => fetchCommunity("https://www.youtube.com/@YouTubeCreators/community")} variant="soft">
              Community posts (sample)
            </Button>
            <Button onClick={() => { doSearch("tevona"); }} variant="soft">
              Tevona (auto)
            </Button>
          </div>
        </div>

        {/* Results */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          {loading && (
            <div className="mb-4">
              <div className="h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-pink-500 animate-[progress_2.5s_linear_infinite]" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {error && <div className="text-red-600 mb-4">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.length === 0 && !loading && (
              <div className="text-slate-500">No results yet — try a search above.</div>
            )}

            {results.map((r: any, i: number) => {
              const title = r.title || r.name || "Untitled";
              const thumb =
                r.thumbnail ||
                r.image ||
                (r.videoId ? `https://i.ytimg.com/vi/${r.videoId}/hq720.jpg` : "/placeholder.png");
              const subtitle = r.author?.name || (r.channelName || r.channel) || (r.views ? `${r.views} views` : "");
              const url = r.url || (r.videoId ? `https://www.youtube.com/watch?v=${r.videoId}` : "");
              return (
                <Card
                  key={i}
                  title={title}
                  subtitle={subtitle}
                  thumbnail={thumb}
                  actions={
                    <>
                      <Button onClick={() => window.open(url, "_blank")} variant="ghost">Open</Button>
                      <Button onClick={() => onDownloadClick({ ...r, url })}>Download / Stream</Button>
                    </>
                  }
                >
                  <div className="text-sm text-slate-600 line-clamp-3">{r.description}</div>
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
            <li>Click any result card's "Open" to view on YouTube, or "Download / Stream" to attempt downloading.</li>
            <li>The downloader first calls your local /ytdown route, then a set of fallbacks (giftedtech endpoints).</li>
            <li>If a direct stream/download is found it opens in a new tab for streaming or saving.</li>
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
        /* small custom animation for loader */
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-[progress_2.5s_linear_infinite] {
          animation: progress 1.6s linear infinite;
          background-size: 200% 100%;
        }
      `}</style>
    </main>
  );
}
