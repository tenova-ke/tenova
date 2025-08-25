"use client";

import SongCard from "./SongCard";

interface SongGridProps {
  songs: any[];
  playSong: (idx: number) => void;
  downloadSong: (videoId: string) => void;
  downloading: string | null;
}

export default function SongGrid({ songs, playSong, downloadSong, downloading }: SongGridProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song, idx) => (
        <SongCard
          key={song.videoId}
          song={song}
          idx={idx}
          playSong={playSong}
          downloadSong={downloadSong}
          downloading={downloading}
        />
      ))}
    </div>
  );
}
