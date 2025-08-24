"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, Download } from "lucide-react";
import Image from "next/image";

type Video = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
};

export default function MusicPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Video[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Search YouTube
  const searchVideos = async () => {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    setResults(json.results || []);
  };

  // Play a video
  const playVideo = async (video: Video) => {
    const res = await fetch(`/api/youtube/download?id=${video.videoId}`);
    const json = await res.json();
    if (json?.result?.download_url) {
      setCurrent({ ...video, audio: json.result.download_url });
      setIsPlaying(true);
    }
  };

  // Handle autoplay next
  const handleEnded = () => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(queue.slice(1));
      playVideo(next);
    } else {
      setIsPlaying(false);
      setCurrent(null);
    }
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎵 Music Downloader</h1>

      {/* Search Bar */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20"
        />
        <button
          onClick={searchVideos}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg font-semibold"
        >
          Search
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((video) => (
          <div key={video.videoId} className="p-4 bg-white/10 rounded-xl">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={400}
              height={225}
              className="rounded-lg mb-3"
            />
            <h3 className="font-bold">{video.title}</h3>
            <p className="text-sm text-gray-300">{video.channel}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => playVideo(video)}
                className="flex-1 bg-pink-500 py-2 rounded-lg"
              >
                Play
              </button>
              <a
                href={`/api/youtube/download?id=${video.videoId}&redirect=1`}
                className="flex-1 bg-green-500 py-2 rounded-lg text-center"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Player Bar */}
      {current && (
        <div className="fixed bottom-0 left-0 w-full bg-black/80 p-4 flex items-center justify-between border-t border-white/20">
          <div className="flex items-center gap-3">
            <Image
              src={current.thumbnail}
              alt={current.title}
              width={50}
              height={50}
              className="rounded-md"
            />
            <div>
              <p className="font-semibold">{current.title}</p>
              <p className="text-sm text-gray-400">{current.channel}</p>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={current.audio}
            autoPlay
            onEnded={handleEnded}
          />

          <div className="flex gap-3">
            <button
              onClick={togglePlay}
              className="p-2 bg-blue-600 rounded-full"
            >
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button
              onClick={handleEnded}
              className="p-2 bg-yellow-500 rounded-full"
            >
              <SkipForward />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
