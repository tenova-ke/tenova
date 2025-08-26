"use client";

import { Play, Download } from "lucide-react";
import Image from "next/image";

type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
};

function VideoCard({ video }: { video: VideoItem }) {
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
          <button className="flex-1 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1 text-sm font-medium">
            <Play size={14} /> Watch
          </button>
          <button className="flex-1 h-8 rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1 text-sm font-medium">
            <Download size={14} /> DL
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoSection({ title, videos }: { title: string; videos: VideoItem[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}

export default function VideoPage() {
  // Fake data for skeleton
  const trendingVideo: VideoItem = {
    id: "1",
    title: "🔥 Biggest Trending Video",
    thumbnail: "https://placehold.co/800x450",
    channel: "Channel XYZ",
  };

  const sampleList: VideoItem[] = new Array(8).fill(null).map((_, i) => ({
    id: String(i),
    title: `Sample Video ${i + 1}`,
    thumbnail: "https://placehold.co/400x225",
    channel: "Demo Channel",
  }));

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Hero trending video */}
      <div className="mb-12">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black/60">
          <div className="relative w-full aspect-video">
            <Image
              src={trendingVideo.thumbnail}
              alt={trendingVideo.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h1 className="text-xl font-bold">{trendingVideo.title}</h1>
            <p className="text-sm text-white/60">{trendingVideo.channel}</p>
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

      {/* Sections */}
      <VideoSection title="Trending Songs" videos={sampleList} />
      <VideoSection title="Trending Comedy" videos={sampleList} />
      <VideoSection title="Trending News" videos={sampleList} />
      <VideoSection title="Trending Lifestyle" videos={sampleList} />
    </div>
  );
  }
