"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Download, Loader2 } from "lucide-react";

type SongCardProps = {
  song: any;
  idx: number;
  playSong: (idx: number) => void;
  downloadSong: (videoId: string, idx: number) => void;
  downloading: string | null;
  featured?: boolean;
};

export default function SongCard({
  song,
  idx,
  playSong,
  downloadSong,
  downloading,
  featured = false,
}: SongCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-2xl p-4 shadow-xl border 
        ${featured ? "bg-gradient-to-br from-pink-900/80 to-purple-900/70 border-pink-500" : "bg-black/70 border-white/10"} 
        backdrop-blur-md transition`}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
        {song.thumbnail && (
          <Image
            src={song.thumbnail}
            alt={song.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Info */}
      <h2 className="font-bold text-lg truncate">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-4">{song.channel}</p>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => playSong(idx)}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg 
            bg-pink-600 hover:bg-pink-700 flex items-center justify-center gap-2 transition"
        >
          <Play size={16} /> Play
        </button>
        <button
          onClick={() => downloadSong(song.videoId, idx)}
          disabled={downloading === song.videoId}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg 
            bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {downloading === song.videoId ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download
        </button>
      </div>

      {/* Progress bar */}
      {downloading === song.videoId && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="h-1 mt-3 rounded bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400"
        />
      )}
    </motion.div>
  );
}
