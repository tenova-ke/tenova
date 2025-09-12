// app/facebook/page.tsx
"use client";

import { useState } from "react";

export default function FacebookDownloaderPage() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacebook = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) throw new Error("Failed to fetch Facebook info");
      const json = await res.json();
      if (!json.status) throw new Error("Invalid Facebook link");
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
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          📘 Facebook Downloader
        </h1>
        <p className="text-center text-slate-400 mb-6">
          Paste a Facebook video link and download videos in different qualities.
        </p>

        <div className="flex gap-3 mb-6">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Facebook video link"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={fetchFacebook}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition shadow-md"
          >
            {loading ? "Loading..." : "Download"}
          </button>
        </div>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        {data && (
          <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={data.thumbnail}
                alt="thumbnail"
                className="w-28 h-28 object-cover rounded-lg shadow"
              />
              <div>
                <h2 className="text-xl font-bold">{data.title || "Facebook Video"}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {data.data?.map((file: any, idx: number) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-center rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition shadow-md"
                >
                  ⬇️ {file.resolution} ({file.format.toUpperCase()})
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
