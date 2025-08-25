"use client";

import SongCard from "./SongCard";

type SongGridProps = {
  songs: any[];
  playSong: (idx: number) => void;
  downloadSong: (videoId: string, idx: number) => void;
  downloading: string | null;
};

export default function SongGrid({
  songs,
  playSong,
  downloadSong,
  downloading,
}: SongGridProps) {
  return (
    <div className="mt-8 max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song, idx) => (
        <SongCard
          key={song.videoId}
          song={song}
          idx={idx + 1} // offset because 0 is featured
          playSong={playSong}
          downloadSong={downloadSong}
          downloading={downloading}
        />
      ))}
    </div>
  );
}
