"use client";

import { SkipForward, Square } from "lucide-react";
import { motion } from "framer-motion";
import { RefObject } from "react";

type Props = {
  audioRef: RefObject<HTMLAudioElement>;
  stopSong: () => void;
  nextSong: () => void;
  onEnded?: () => void;
};

export default function NowPlaying({
  audioRef,
  stopSong,
  nextSong,
  onEnded,
}: Props) {
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        fixed left-4 right-4 
        bottom-[calc(env(safe-area-inset-bottom,0px)+16px)]
        mx-auto max-w-[720px]
        rounded-2xl border border-white/15 bg-black/85
        shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        backdrop-blur-md p-3 z-[60]
      "
    >
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={stopSong}
          className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 font-semibold inline-flex items-center gap-2 active:scale-[0.98]"
        >
          <Square size={16} />
          Stop
        </button>
        <button
          onClick={nextSong}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold inline-flex items-center gap-2 active:scale-[0.98]"
        >
          <SkipForward size={16} />
          Next
        </button>
      </div>

      {/* hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={onEnded}
        className="hidden"
        controls
        preload="none"
      />
    </motion.div>
  );
}
