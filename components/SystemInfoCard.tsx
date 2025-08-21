// components/SystemInfoCard.tsx
"use client";
import { useEffect, useState } from "react";

export default function SystemInfoCard() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/system")
      .then((res) => res.json())
      .then(setInfo);
  }, []);

  if (!info) return <div className="p-4 bg-slate-800 rounded-xl">Loading...</div>;

  return (
    <div className="p-4 bg-slate-800 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-2">System Info</h2>
      <p>CPU: {info.cpu?.manufacturer} {info.cpu?.brand}</p>
      <p>RAM: {info.mem?.total} bytes</p>
      <p>IP: {info.ip}</p>
      <p>Geo: {info.geo?.country}, {info.geo?.city}</p>
    </div>
  );
}
