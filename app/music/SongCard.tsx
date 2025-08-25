// SongCard.tsx
type SongCardProps = {
  song: any;
  idx: number;
  playSong: (idx: number) => void;
  downloadSong: (videoId: string, idx: number) => void; // 👈 accept two args
  downloading: string | null;
  featured?: boolean;
};

export default function SongCard({ song, idx, playSong, downloadSong, downloading, featured }: SongCardProps) {
  return (
    <div className={`rounded-xl p-4 ${featured ? "bg-black/80" : "bg-black/60"} border border-white/20`}>
      {/* Thumbnail */}
      {/* ... */}
      <button onClick={() => playSong(idx)}>Play</button>
      <button onClick={() => downloadSong(song.videoId, idx)}>
        {downloading === song.videoId ? "Downloading..." : "Download"}
      </button>
    </div>
  );
  }
