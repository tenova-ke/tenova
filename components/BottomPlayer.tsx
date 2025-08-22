"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  links: {
    Bwm_stream_link: string;
  };
}

export default function BottomPlayer() {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white shadow-lg border-t border-gray-700 flex items-center justify-between px-4 py-3 z-50">
      {/* Song Info */}
      <div>
        <p className="font-medium">{track.title}</p>
        <p className="text-sm text-gray-400">{track.artist}</p>
      </div>

      {/* Audio */}
      <audio ref={audioRef}>
        <source src={track.links.Bwm_stream_link} type="audio/mp3" />
      </audio>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={fetchTrack}
          className="p-2 bg-yellow-500 rounded-full hover:bg-yellow-400 transition"
        >
          <SkipForward size={18} />
        </button>
      </div>
    </div>
  );
}
