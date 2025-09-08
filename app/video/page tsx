"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";

type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  url: string;
};

function VideoCard({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  return (
    <div
      onClick={() => onSelect(video)}
      className="min-w-[200px] max-w-[220px] rounded-xl overflow-hidden bg-black/50 border border-white/20 shadow-md cursor-pointer hover:scale-[1.03] transition"
    >
      <div className="relative w-full aspect-video">
        {/* thumbnail */}
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
        <p className="text-xs text-white/50">{video.channel}</p>
      </div>
    </div>
  );
}

export default function VideoPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<VideoItem[]>([]);
  const [heroVideo, setHeroVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data?.results?.length) {
        const mapped = data.results.map((v: any) => ({
          id: v.videoId,
          title: v.title,
          thumbnail: v.thumbnail,
          channel: v.channel,
          url: v.url,
        }));
        setResults(mapped);
        setHeroVideo(mapped[0]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!heroVideo) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      const res = await fetch(
        `https://apis.prexzyvilla.site/download/ytmp4?url=${encodeURIComponent(heroVideo.url)}`
      );
      const data = await res.json();

      if (data?.status && data?.data?.downloadURL) {
        // trigger file download
        window.open(data.data.downloadURL, "_blank");
      } else {
        setDownloadError("Download failed. Please try another download page.");
      }
    } catch {
      setDownloadError("Download failed. Please try another download page.");
    } finally {
      setDownloading(false);
    }
  };

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
      <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-black/60">
        {heroVideo ? (
          <>
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${heroVideo.id}?autoplay=1`}
                title={heroVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <h1 className="text-xl font-bold">{heroVideo.title}</h1>
              <p className="text-sm text-white/60">{heroVideo.channel}</p>
              <div className="mt-4 flex gap-3 items-center">
                <button
                  onClick={handleDownload}
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  disabled={downloading}
                >
                  {downloading ? (
                    <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <Download size={18} /> Download
                    </>
                  )}
                </button>
                {downloadError && (
                  <span className="text-sm text-red-400">{downloadError}</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-white/60">
            Search for a song, artist, or video...
          </div>
        )}
      </div>

      {/* Results section */}
      {loading ? (
        <p className="text-sm text-white/50">Searching...</p>
      ) : results.length > 1 ? (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-3">Results</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {results.map((v) => (
              <VideoCard key={v.id} video={v} onSelect={(vid) => {
                setHeroVideo(vid);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
                   }
