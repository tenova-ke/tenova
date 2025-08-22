"use client";

import React from "react";

interface AudioPlayerProps {
  url?: string; // optional, but we'll default if missing
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  // ✅ fallback sample track (royalty-free demo mp3)
  const audioUrl =
    url ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return (
    <div className="p-4 text-center border rounded-lg">
      <audio controls className="w-full" autoPlay>
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <p className="mt-2 text-sm text-gray-500">
        🎶 {url ? "Playing selected audio" : "Demo track loaded"}
      </p>
    </div>
  );
      }
