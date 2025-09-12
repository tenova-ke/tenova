// app/pinterest/page.tsx
// @ts-nocheck
"use client";

import { useState } from "react";

/**
 * Self-contained Pinterest search + download page
 * - No external components (Button/Input/Card are inlined)
 * - Uses https://api.siputzx.my.id/api/s/pinterest?query=...&type=...
 * - Place at: app/pinterest/page.tsx
 */

function Button({ children, onClick, className = "", title = "", disabled = false }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition focus:outline-none disabled:opacity-50";
  return (
    <button title={title} disabled={disabled} onClick={onClick} className={`${base} ${className}`}>
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white/5 outline-none placeholder:text-slate-400"
    />
  );
}

function Card({ children }) {
  return <div className="bg-white/6 rounded-2xl p-3 shadow-sm border border-white/6">{children}</div>;
}

export default function PinterestPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "gif">("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) {
      setError("Type something to search.");
      return;
    }
    setError(null);
    setLoading(true);
    setResults([]);

    try {
      const typeParam = filter === "all" ? "" : `&type=${filter}`;
      const url = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}${typeParam}`;
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = await res.json();

      // Defensive: API might return { status, data: [...] } or nested shapes
      let items = [];
      if (Array.isArray(json?.data)) items = json.data;
      else if (Array.isArray(json?.data?.data)) items = json.data.data;
      else if (Array.isArray(json)) items = json;
      else items = json?.data ?? [];

      // normalize items to expected keys
      items = items.map((it) => ({
        pin: it.pin ?? it.id ?? "",
        image_url: it.image_url ?? it.thumbnail ?? it.image ?? null,
        video_url: it.video_url ?? it.media?.video_url ?? null,
        gif_url: it.gif_url ?? null,
        title: it.grid_title ?? it.title ?? "",
        description: it.description ?? it.alt ?? "",
        type: it.type ?? (it.video_url ? "video" : it.gif_url ? "gif" : "image"),
        raw: it,
      }));

      setResults(items);
      if (items.length === 0) setError("No results found.");
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function getMediaUrl(item: any) {
    // prefer video -> gif -> image
    return item.video_url || item.gif_url || item.image_url || null;
  }

  function handleDownload(url: string | null) {
    if (!url) return;
    // open in new tab; the user requested "no API route" and direct download
    window.open(url, "_blank");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <section className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">Pinterest — Search & Download</h1>
          <p className="text-slate-300 mt-2">
            Search Pinterest (images, videos, GIFs) and download media directly. Uses Siputzx search API.
          </p>
        </header>

        <div className="bg-white/5 p-4 rounded-2xl mb-6 border border-white/6">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Search Pinterest (e.g. cats, design, wallpaper)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button
              onClick={() => {
                setQuery("");
                setResults([]);
                setError(null);
              }}
              className="bg-white/6"
            >
              Clear
            </Button>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {(["all", "image", "video", "gif"] as const).map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "bg-white/10 text-white"
                    : "bg-transparent border border-white/6 text-slate-200 hover:bg-white/5"
                }
                title={`Filter: ${f}`}
              >
                {f.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-400 p-3 bg-red-900/10 rounded">{error}</div>
        )}

        <div className="mb-4 text-sm text-slate-300">
          {results.length > 0 ? (
            <span>{results.length} result{results.length > 1 ? "s" : ""}</span>
          ) : (
            <span>No results yet</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item, idx) => {
            const media = getMediaUrl(item);
            const isVideo = !!item.video_url;
            const isGif = !!item.gif_url;
            const isImage = !!item.image_url && !isVideo && !isGif;
            return (
              <Card key={idx}>
                <div className="flex flex-col h-full">
                  <div className="w-full h-44 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title || "thumbnail"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <div className="text-slate-400 p-4 text-sm">No preview</div>
                    )}
                  </div>

                  <div className="mt-3 flex-1">
                    <div className="font-semibold text-slate-100 line-clamp-2">{item.title || "Untitled"}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-3">{item.description || ""}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-400">
                      {isVideo ? "Video" : isGif ? "GIF" : "Image"}
                    </div>

                    <div className="flex items-center gap-2">
                      {media ? (
                        <Button
                          onClick={() => handleDownload(media)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          title="Open / download media"
                        >
                          ⬇ Download
                        </Button>
                      ) : (
                        <Button className="bg-white/6" disabled title="No media available">
                          No media
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          // open pin page if available
                          if (item.pin) {
                            const pinUrl = item.pin.startsWith("http") ? item.pin : `https://www.pinterest.com/pin/${item.pin}`;
                            window.open(pinUrl, "_blank");
                          } else if (item.raw?.link) {
                            window.open(item.raw.link, "_blank");
                          } else {
                            // fallback: open the image or media directly if present
                            if (media) window.open(media, "_blank");
                          }
                        }}
                        className="bg-white/6"
                        title="Open pin / source"
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
