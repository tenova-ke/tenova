"use client";

import { motion } from "framer-motion";
import { Square, SkipForward } from "lucide-react";
import { RefObject } from "react";

type NowPlayingProps = {
  audioRef: RefObject<HTMLAudioElement>;
  stopSong: () => void;
  nextSong: () => void;
};

export default function NowPlaying({
  audioRef,
  stopSong,
  nextSong,
}: NowPlayingProps) {
  return (
    <motion.div
      initial={{ y: 150, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 
        w-[90%] sm:w-[400px] bg-black/90 backdrop-blur-lg 
        rounded-2xl border border-white/20 shadow-2xl p-4"
    >
      <div className="flex justify-center gap-4">
        <button
          onClick={stopSong}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 transition"
        >
          <Square size={18} /> Stop
        </button>
        <button
          onClick={nextSong}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
        >
          <SkipForward size={18} /> Next
        </button>
      </div>
      <audio ref={audioRef} onEnded={nextSong} className="hidden" controls />
    </motion.div>
  );
}
