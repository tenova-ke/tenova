// app/dashboard/page.tsx
import Sidebar from "@/components/Sidebar";
import SystemInfoCard from "@/components/SystemInfoCard"
import AudioCard from "@/components/AudioCard";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemInfoCard />
        <AudioCard />
      </main>
    </div>
  );
  }
