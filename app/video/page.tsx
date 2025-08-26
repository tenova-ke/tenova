"use client";

import { useEffect, useState } from "react";
import { Play, Download, Search } from "lucide-react";
import Image from "next/image";

type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  url: string;
};

function VideoCard({ video }: { video: VideoItem }) {
  const handleDownload = async () => {
    try {
      const res = await fetch(
        `https://apis.prexzyvilla.site/download/ytmp4?url=${encodeURIComponent(
          video.url
        )}`
      );
      const data = await res.json();
      if (data?.status && data?.data?.downloadURL) {
        window.open(data.data.downloadURL, "_blank");
      } else {
        alert("Download link not available.");
      }
    } catch {
      alert("Failed to get download link.");
    }
  };

  return (
    <div className="min-w-[200px] max-w-[220px] rounded-xl overflow-hidden bg-black/50 border border-white/20 shadow-md">
      <div className="relative w-full aspect-video">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
        <p className="text-xs text-white/50">{video.channel}</p>

        <div className="mt-3 flex gap-2">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1 text-sm font-medium"
          >
            <Play size={14} /> Watch
          </a>
          <button
            onClick={handleDownload}
            className="flex-1 h-8 rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1 text-sm font-medium"
          >
            <Download size={14} /> DL
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoSection({ title, query }: { title: string; query: string }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data?.results) {
          const mapped = data.results.map((v: any) => ({
            id: v.videoId,
            title: v.title,
            thumbnail: v.thumbnail,
            channel: v.channel,
            url: v.url,
          }));
          setVideos(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch videos:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query]);

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {loading ? (
        <p className="text-sm text-white/50">Loading {query}...</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function VideoPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data?.results) {
        const mapped = data.results.map((v: any) => ({
          id: v.videoId,
          title: v.title,
          thumbnail: v.thumbnail,
          channel: v.channel,
          url: v.url,
        }));
        setResults(mapped);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const heroVideo = results.length > 0 ? results[0] : null;

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 mb-8 bg-black/40 border border-white/20 rounded-xl px-4 py-2"
      >
        <Search size={18} className="text-white/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs, artists, or videos..."
          className="w-full bg-transparent outline-none text-sm"
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
        >
          Search
        </button>
      </form>

      {/* Hero card */}
      <div className="mb-12">
        {loading ? (
          <p className="text-sm text-white/50">Searching...</p>
        ) : heroVideo ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black/60">
            <div className="relative w-full aspect-video">
              <Image
                src={heroVideo.thumbnail}
                alt={heroVideo.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h1 className="text-xl font-bold">{heroVideo.title}</h1>
              <p className="text-sm text-white/60">{heroVideo.channel}</p>
              <div className="mt-4 flex gap-3">
                <a
                  href={heroVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Play size={18} /> Watch
                </a>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `https://apis.prexzyvilla.site/download/ytmp4?url=${encodeURIComponent(
                          heroVideo.url
                        )}`
                      );
                      const data = await res.json();
                      if (data?.status && data?.data?.downloadURL) {
                        window.open(data.data.downloadURL, "_blank");
                      } else {
                        alert("Download link not available.");
                      }
                    } catch {
                      alert("Download failed.");
                    }
                  }}
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black/60 p-6 text-center">
            <p className="text-white/60">Search for a song, artist, or video...</p>
          </div>
        )}
      </div>

      {/* Search results below hero */}
      {results.length > 1 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-3">Search Results</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {results.slice(1).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      {/* Default trending sections */}
      <VideoSection title="Trending Songs" query="Trending Songs" />
      <VideoSection title="Trending Comedy" query="Trending Comedy" />
      <VideoSection title="Trending News" query="Trending News" />
      <VideoSection title="Trending Lifestyle" query="Trending Lifestyle" />
    </div>
  );
  }
