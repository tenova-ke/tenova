// app/tiktok/page.tsx
"use client";

import { useState } from "react";

export default function TikTokDownloaderPage() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTikTok = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) throw new Error("Failed to fetch TikTok info");
      const json = await res.json();
      if (!json.status) throw new Error("Invalid TikTok link");
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6">
      <div className="max-w-2xl w-full bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-700 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-pink-400 to-violet-500 bg-clip-text text-transparent">
          🎵 TikTok Downloader
        </h1>
        <p className="text-center text-slate-400 mb-6">
          Paste a TikTok link and download videos or slideshows instantly.
        </p>

        <div className="flex gap-3 mb-6">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste TikTok link (e.g. https://vt.tiktok.com/...)"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            onClick={fetchTikTok}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition shadow-md"
          >
            {loading ? "Loading..." : "Download"}
          </button>
        </div>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        {data && (
          <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={data.metadata?.thumbnail}
                alt="thumbnail"
                className="w-28 h-28 object-cover rounded-lg shadow"
              />
              <div>
                <h2 className="text-xl font-bold">{data.metadata?.title || "Untitled"}</h2>
                <p className="text-slate-400 text-sm">{data.metadata?.creator}</p>
                <p className="text-slate-500 text-xs">Type: {data.type}</p>
              </div>
            </div>

            <div className="space-y-3">
              {data.urls?.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-center rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition shadow-md"
                >
                  ⬇️ Download {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
