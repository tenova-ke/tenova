import AudioPlayer from "@/components/AudioPlayer";

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">🎶 Random Music Stream</h1>
      <AudioPlayer />
    </main>
  );
      }
