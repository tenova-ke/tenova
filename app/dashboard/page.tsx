"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  track: string;
  duration: string;
  links: {
    Bwm_stream_link: string;
    Bwm_download_link: string;
    thumbnail: string;
  };
}

export default function MusicPlayer() {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch random track
  const fetchTrack = async () => {
    try {
      const res = await fetch("https://ncs.bwmxmd.online/random");
      const json = await res.json();
      const song = json.data[0];
      setTrack(song);
      setIsPlaying(true);
    } catch (err) {
      console.error("Error fetching track:", err);
    }
  };

  useEffect(() => {
    fetchTrack();
  }, []);

  // Auto play when track changes
  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [track]);

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

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-card shadow-xl flex flex-col items-center gap-4">
      {/* Thumbnail */}
      <img
        src={track.links.thumbnail}
        alt={track.title}
        className="w-64 h-64 rounded-xl shadow-md"
      />

      {/* Song info */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">{track.title}</h2>
        <p className="text-gray-500">{track.artist}</p>
      </div>

      {/* Audio */}
      <audio ref={audioRef}>
        <source src={track.links.Bwm_stream_link} type="audio/mp3" />
      </audio>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={togglePlay}
          className="px-4 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={fetchTrack}
          className="px-4 py-2 flex items-center gap-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-400 transition"
        >
          <SkipForward size={18} />
          Next
        </button>
      </div>
    </div>
  );
    }
