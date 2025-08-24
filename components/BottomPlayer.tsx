"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Track {
  id: string;
  title: string;
  artist: string;
  links: {
    Bwm_stream_link: string;
  };
}

export default function BottomPlayer({ onPlayerVisible }: { onPlayerVisible?: (visible: boolean) => void }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
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

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [track]);

  // Auto close popup after 3s
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        onPlayerVisible?.(true); // Notify parent to add padding
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, onPlayerVisible]);

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

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (!track) return null;

  return (
    <>
      {/* 🎶 Now Playing Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl p-6 rounded-2xl text-center text-white max-w-sm w-full">
              <h2 className="text-xl font-bold mb-2 text-accent-green">
                🎶 Now Playing
              </h2>
              <p className="text-lg">{track.title}</p>
              <p className="text-sm text-gray-300">{track.artist}</p>
              <div className="mt-3 animate-pulse text-cyan-400">
                Loading track...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎧 Mini Player */}
      {!showPopup && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 w-full h-[80px] bg-white/10 backdrop-blur-lg border-t border-white/20 shadow-lg flex items-center justify-center gap-6 px-6 py-4 z-40"
        >
          {/* Hidden Audio Element */}
          <audio ref={audioRef}>
            <source src={track.links.Bwm_stream_link} type="audio/mp3" />
          </audio>

          {/* Controls */}
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-400 transition"
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button
            onClick={stopTrack}
            className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition"
          >
            <Square size={22} />
          </button>
          <button
            onClick={fetchTrack}
            className="p-4 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition"
          >
            <SkipForward size={22} />
          </button>
        </motion.div>
      )}
    </>
  );
        }
