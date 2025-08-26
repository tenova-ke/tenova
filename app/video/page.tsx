"use client";

import { useEffect, useState } from "react";
import { Play, Download } from "lucide-react";
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
      {/* Thumbnail */}
      <div className="relative w-full aspect-video">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Text + actions */}
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
        const res = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(query)}`
        );
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
  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Hero trending video (manually pinned or later auto) */}
      <div className="mb-12">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black/60">
          <div className="relative w-full aspect-video">
            <Image
              src="https://placehold.co/800x450"
              alt="🔥 Biggest Trending Video"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h1 className="text-xl font-bold">🔥 Biggest Trending Video</h1>
            <p className="text-sm text-white/60">Channel XYZ</p>
            <div className="mt-4 flex gap-3">
              <button className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Play size={18} /> Watch
              </button>
              <button className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Download size={18} /> Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-search sections */}
      <VideoSection title="Trending Songs" query="Trending Songs" />
      <VideoSection title="Trending Comedy" query="Trending Comedy" />
      <VideoSection title="Trending News" query="Trending News" />
      <VideoSection title="Trending Lifestyle" query="Trending Lifestyle" />
    </div>
  );
                               }
