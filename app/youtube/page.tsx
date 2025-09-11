// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";

const YT_SEARCH_API = "https://api.siputzx.my.id/api/s/youtube?query=";
const COMMUNITY_API = "https://api.siputzx.my.id/api/d/ytpost?url=";
const LOCAL_YTDOWN = "/ytdown?url=";
const FALLBACK_DOWNLOADS = [
  (url) => `https://api.giftedtech.web.id/api/download/yta?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(url)}`,
  (url) => `https://api.giftedtech.web.id/api/download/ytmp4?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(url)}`,
  (url) => `https://api.giftedtech.web.id/api/download/ytdlv2?apikey=gifted_api_jsgt5su7s&url=${encodeURIComponent(url)}`,
];

/* ---------- Small UI components with glow ---------- */
function Button({ children, onClick, className = "", variant = "primary", title }) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold focus:outline-none transition shadow-lg";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:scale-105 hover:shadow-pink-500/50",
    ghost: "bg-white/5 text-white hover:bg-white/10 hover:scale-105",
    soft: "bg-white/10 text-white hover:bg-white/20 hover:scale-105",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="flex-1 bg-black/40 text-white outline-none px-4 py-2 rounded-xl border border-white/10 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/40 placeholder:text-slate-400"
    />
  );
}

function Card({ title, subtitle, thumbnail, children, actions }) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-md p-3 hover:shadow-pink-500/40 hover:border-pink-500/40 transition transform hover:-translate-y-1">
      <div className="flex gap-3">
        <img
          src={thumbnail}
          alt={title}
          className="w-24 h-16 object-cover rounded-lg border border-white/10"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
        <div className="flex-1">
          <div className="font-bold text-white">{title}</div>
          <div className="text-xs text-slate-400">{subtitle}</div>
          <div className="mt-2 text-sm text-slate-200">{children}</div>
        </div>
      </div>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
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

  useEffect(() => {
    doSearch("tevona");
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
      const json = await res.json();
      setResults(json.data || []);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDownloadClick(item) {
    const url = item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : "");
    if (!url) return;
    try {
      window.open(url, "_blank");
    } catch {
      setError("Download failed");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-pink-950 text-white p-6">
      <section className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            🎵 Tevona — Songs & YouTube Tools
          </h1>
          <p className="mt-2 text-slate-400">
            Search YouTube, preview, stream or download — all in one glowing panel.
          </p>
        </header>

        {/* Search */}
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube (e.g. Alan Walker Faded)"
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
            />
            <Button onClick={() => doSearch(query)}>Search</Button>
            <Button variant="ghost" onClick={() => { setQuery(""); setResults([]); }}>Clear</Button>
          </div>

          {/* Quick tags */}
          <div className="flex gap-3 flex-wrap">
            <Button variant="soft" onClick={() => doSearch("top songs")}>Top Songs</Button>
            <Button variant="soft" onClick={() => doSearch("gospel kenya")}>Gospel Kenya</Button>
            <Button variant="soft" onClick={() => doSearch("instrumental")}>Instrumental</Button>
            <Button variant="soft" onClick={() => doSearch("tevona")}>Tevona</Button>
          </div>
        </div>

        {/* Results */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Results</h2>

          {loading && (
            <div className="mb-4 h-2 bg-white/10 rounded overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-pink-500 via-indigo-400 to-cyan-400 animate-progress" />
            </div>
          )}

          {error && <div className="text-red-400">{error}</div>}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r, i) => {
              const title = r.title || "Untitled";
              const thumb = r.thumbnail || `https://i.ytimg.com/vi/${r.videoId}/hq720.jpg`;
              const subtitle = r.author?.name || r.channelName || "";
              const url = r.url || (r.videoId ? `https://www.youtube.com/watch?v=${r.videoId}` : "");
              return (
                <div key={i} className="animate-fadeIn">
                  <Card
                    title={title}
                    subtitle={subtitle}
                    thumbnail={thumb}
                    actions={
                      <>
                        <Button variant="ghost" onClick={() => window.open(url, "_blank")}>Open</Button>
                        <Button onClick={() => onDownloadClick({ ...r, url })}>Download</Button>
                      </>
                    }
                  >
                    <div className="line-clamp-2 text-slate-300">{r.description || ""}</div>
                  </Card>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.2s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeInUp 0.6s ease both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
    }
