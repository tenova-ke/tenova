"use client";

import SongCard from "./SongCard";

type YTSong = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail?: string;
};

type Props = {
  songs: YTSong[];
  playSong: (idx: number) => void;
  downloadSong: (videoId: string, idx: number) => void;
  downloading: string | null;
};

export default function SongGrid({
  songs,
  playSong,
  downloadSong,
  downloading,
}: Props) {
  if (!songs?.length) {
    return (
      <p className="text-center py-10 text-white/70">
        No results yet. Try another search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {songs.map((s, i) => (
        <SongCard
          key={s.videoId}
          song={s}
          idx={i}
          playSong={playSong}
          downloadSong={downloadSong}
          downloading={downloading}
        />
      ))}
    </div>
  );
}
