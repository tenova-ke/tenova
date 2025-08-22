// pages/index.tsx
import ServerStats from "@/components/ServerStats";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-green-400">
          Tenova Server Dashboard
        </h1>
        <ServerStats />
      </div>
    </main>
  );
}
