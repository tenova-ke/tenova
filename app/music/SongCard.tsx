"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Download, Loader2 } from "lucide-react";

interface SongCardProps {
  song: any;
  idx: number;
  playSong: (idx: number) => void;
  downloadSong: (videoId: string, title: string) => void;
  downloading: string | null;
}

export default function SongCard({
  song,
  idx,
  playSong,
  downloadSong,
  downloading,
}: SongCardProps) {
  return (
    <motion.div
      key={song.videoId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 bg-black/70 border border-white/20 shadow-xl backdrop-blur-md"
    >
      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
        {song.thumbnail && (
          <Image
            src={song.thumbnail}
            alt={song.title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <h2 className="font-semibold text-lg truncate">{song.title}</h2>
      <p className="text-sm text-gray-400">{song.channel}</p>

      {/* Controls */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => playSong(idx)}
          className="flex-1 px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition text-sm"
        >
          <Play size={16} /> Play
        </button>
        <button
          onClick={() => downloadSong(song.videoId, song.title)}
          disabled={downloading === song.videoId}
          className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition text-sm"
        >
          {downloading === song.videoId ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}{" "}
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
