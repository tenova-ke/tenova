// @ts-nocheck
"use client";

import React, { useEffect, useState, useCallback } from "react";

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

/* ---------- Modal / Player ---------- */
function InlineModal({ open, onClose, type, embedUrl, videoUrl, title }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-w-4xl w-full bg-gray-900 rounded-2xl p-4 border border-white/10 shadow-2xl z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-bold text-lg text-white">{title}</div>
            <div className="text-sm text-slate-400">Inline player — no redirects</div>
          </div>
          <div className="flex gap-2">
            {videoUrl && (
              <a
                href={videoUrl}
                download
                className="inline-flex items-center px-3 py-2 rounded-xl bg-white/5 text-white font-semibold"
                target="_blank"
                rel="noreferrer"
              >
                Download file
              </a>
            )}
            <button onClick={onClose} className="px-3 py-2 rounded-xl bg-white/5 text-white">
              Close
            </button>
          </div>
        </div>

        <div className="mt-4">
          {type === "embed" && embedUrl && (
            <div className="w-full h-0" style={{ paddingBottom: "56.25%", position: "relative" }}>
              <iframe
                title="YouTube preview"
                src={embedUrl}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 12, border: "none" }}
              />
            </div>
          )}

          {type === "video" && videoUrl && (
            <video
              controls
              src={videoUrl}
              className="w-full rounded-lg"
              style={{ maxHeight: "70vh" }}
            />
          )}

          {!embedUrl && !videoUrl && (
            <div className="text-slate-400 mt-4">No preview available</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Helper: find a usable url inside a response ---------- */
async function extractUrlFromResponse(response) {
  // If JSON, try many fields
  try {
    const json = await response.clone().json();
    // common patterns
    const candidates = [
      json.url,
      json.result?.url,
      json.data?.url,
      json.data?.download,
      json.download,
      json.result,
      json.path,
      json.file,
      Array.isArray(json.files) ? json.files[0]?.url : undefined,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.startsWith("http")) return c;
    }
    // search recursively for first string that looks like an http link
    const queue = [json];
    while (queue.length) {
      const node = queue.shift();
      if (!node) continue;
      if (typeof node === "string" && node.startsWith("http")) return node;
      if (typeof node === "object") {
        for (const k in node) {
          queue.push(node[k]);
        }
      }
    }
  } catch (e) {
    // not json or parse failed -> fallback to text
  }

  try {
    const txt = await response.text();
    // look for first http(s) link
    const m = txt.match(/https?:\/\/[^\s'"]+/);
    if (m) return m[0];
  } catch (e) {
    // ignore
  }

  return null;
}

/* ---------- Main page ---------- */
export default function SongsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const [community, setCommunity] = useState(null);

  // modal/player states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'embed' | 'video'
  const [embedUrl, setEmbedUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

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
      console.error(err);
      setError("Search failed — check API or network");
    } finally {
      setLoading(false);
    }
  }

  const openEmbed = useCallback((item) => {
    const videoId = item.videoId || (item.url && item.url.match(/v=([^&]+)/)?.[1]);
    if (videoId) {
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
      setModalType("embed");
      setModalTitle(item.title || "YouTube preview");
      setVideoUrl(null);
      setModalOpen(true);
      return;
    }
    // fallback: if item.url is already a direct playable link
    if (item.url && (item.url.endsWith(".mp4") || item.url.includes("cdn"))) {
      setVideoUrl(item.url);
      setModalType("video");
      setModalTitle(item.title || "Preview");
      setEmbedUrl(null);
      setModalOpen(true);
      return;
    }
    setError("Cannot preview this item inline.");
  }, []);

  async function getDownloadLink(url) {
    // Try local first
    const tried = [];
    async function tryFetch(urlToTry) {
      tried.push(urlToTry);
      try {
        const r = await fetch(urlToTry, { method: "GET" });
        if (!r) return null;
        // if redirect to youtube or html page, extractUrlFromResponse will try to find links inside
        const found = await extractUrlFromResponse(r);
        if (found) return found;
        // maybe the API returns a binary file (video stream) — create object URL
        const contentType = r.headers.get("content-type") || "";
        if (contentType.includes("video") || contentType.includes("mpeg")) {
          const blob = await r.blob();
          return URL.createObjectURL(blob);
        }
        return null;
      } catch (e) {
        console.warn("fetch failed for", urlToTry, e);
        return null;
      }
    }

    // 1) try local endpoint
    const local = LOCAL_YTDOWN + encodeURIComponent(url);
    const foundLocal = await tryFetch(local);
    if (foundLocal) return { url: foundLocal, tried };

    // 2) try each fallback
    for (const b of FALLBACK_DOWNLOADS) {
      const candidate = b(url);
      const found = await tryFetch(candidate);
      if (found) return { url: found, tried };
    }

    return { url: null, tried };
  }

  async function onDownloadClick(item) {
    const url = item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : "");
    if (!url) return;
    setModalLoading(true);
    setError(null);
    setModalTitle(item.title || "Preparing download...");
    setEmbedUrl(null);
    setVideoUrl(null);
    setModalType(null);
    setModalOpen(true);

    try {
      logDebug(`Attempting download for ${url}`);
      const { url: dl, tried } = await getDownloadLink(url);
      if (!dl) {
        logDebug(`No downloadable link found. Tried: ${tried.join(", ")}`);
        setError("Download failed — no direct download found. See debug log.");
        setModalLoading(false);
        return;
      }

      // If the found link is an embed from youtube (watch?v=...), convert to raw mp4 if possible
      const usable = dl.includes("youtube.com/watch") && dl.includes("v=")
        ? dl.replace("/watch?v=", "/embed/") // last resort (still embed)
        : dl;

      // If the link looks like an mp4 or blob URL -> play as video
      if (usable.endsWith(".mp4") || usable.includes(".mp4") || usable.startsWith("blob:") || usable.includes("cdn")) {
        setVideoUrl(usable);
        setModalType("video");
        setModalTitle(item.title || "Downloaded video");
      } else if (usable.includes("youtube.com/embed") || usable.includes("youtube-nocookie.com/embed")) {
        setEmbedUrl(usable);
        setModalType("embed");
        setModalTitle(item.title || "Preview");
      } else if (usable.startsWith("http")) {
        // unknown file type but likely downloadable: try as video
        setVideoUrl(usable);
        setModalType("video");
        setModalTitle(item.title || "Downloaded video");
      } else {
        setError("Download returned a non-playable response.");
      }

      setModalLoading(false);
    } catch (err) {
      console.error(err);
      setError("Download failed — server or network error.");
      setModalLoading(false);
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

          {error && <div className="text-red-400 mb-2">{error}</div>}

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
                        <Button variant="ghost" onClick={() => openEmbed({ ...r, url })}>View</Button>
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

        {/* debug area (optional) */}
        <details className="mt-6 bg-black/30 p-3 rounded-lg text-slate-400">
          <summary className="cursor-pointer font-semibold">Debug log (click to expand)</summary>
          <div className="mt-2">
            {debugLog.map((d, idx) => (
              <div key={idx} className="text-xs opacity-80">{d}</div>
            ))}
          </div>
        </details>
      </section>

      <InlineModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEmbedUrl(null); setVideoUrl(null); setModalLoading(false); }}
        type={modalType}
        embedUrl={embedUrl}
        videoUrl={videoUrl}
        title={modalTitle}
      />

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
