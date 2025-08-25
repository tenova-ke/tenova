"use client";

import Image from "next/image";
import { Play, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  song: {
    videoId: string;
    title: string;
    channel: string;
    thumbnail?: string;
  };
  idx: number;
  playSong: (idx: number) => void;
  downloadSong: (videoId: string, idx: number) => void;
  downloading: string | null;
};

export default function SongCard({
  song,
  idx,
  playSong,
  downloadSong,
  downloading,
}: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-white/15 bg-[rgba(0,0,0,0.55)] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
    >
      {/* thumbnail with fixed aspect ratio; prevents jank on Android */}
      <div className="relative w-full aspect-video">
        {song.thumbnail ? (
          <Image
            src={song.thumbnail}
            alt={song.title}
            fill
            sizes="(max-width: 720px) 100vw, 720px"
            className="object-cover"
            priority={idx < 3}
          />
        ) : (
          <div className="w-full h-full bg-black/40" />
        )}
      </div>

      {/* text + buttons */}
      <div className="p-4">
        <h2 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">
          {song.title}
        </h2>
        <p className="text-sm text-white/60 mt-1">{song.channel}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => playSong(idx)}
            className="h-10 rounded-xl bg-pink-600 hover:bg-pink-700 active:scale-[0.98] transition inline-flex items-center justify-center gap-2 font-semibold"
          >
            <Play size={18} />
            <span>Play</span>
          </button>

          <button
            onClick={() => downloadSong(song.videoId, idx)}
            disabled={downloading === song.videoId}
            className="h-10 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 active:scale-[0.98] transition inline-flex items-center justify-center gap-2 font-semibold"
          >
            {downloading === song.videoId ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span>DL</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
