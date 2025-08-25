"use client";

import { motion } from "framer-motion";
import { SkipForward, Square } from "lucide-react";
import { RefObject } from "react";

interface NowPlayingProps {
  audioRef: RefObject<HTMLAudioElement>;
  stopSong: () => void;
  nextSong: () => void;
}

export default function NowPlaying({ audioRef, stopSong, nextSong }: NowPlayingProps) {
  return (
    <motion.div
      initial={{ y: 200 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 
                 w-[90%] md:w-[350px] 
                 bg-black/90 backdrop-blur-lg 
                 p-4 rounded-2xl border border-white/20 
                 shadow-2xl flex flex-col items-center"
    >
      {/* Controls Only */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={stopSong}
          className="px-4 py-2 bg-red-600 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <Square size={18} /> Stop
        </button>
        <button
          onClick={nextSong}
          className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <SkipForward size={18} /> Next
        </button>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={nextSong} className="hidden" controls />
    </motion.div>
  );
}
