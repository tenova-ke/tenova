"use client";

import React, { useMemo, useState } from "react";
import { Folder } from "lucide-react"; // optional icon, already used in your project
import Link from "next/link";

/**
 * timeAgo - returns human friendly relative time (seconds/minutes/hours/days/weeks/months/years)
 */
function timeAgo(dateString: string) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = Math.max(0, now - then);

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 1) return `${days} days ago`;
  if (days === 1) return `yesterday`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Replace this sampleData with your real API response later.
 * The `createdAt` strings are a mix of timestamps so the UI shows the various labels you mentioned.
 */
const sampleData: { name: string; createdAt: string; path?: string }[] = [
  { name: "ai", createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString() }, // 3 weeks ago
  { name: "anime", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() }, // 4 days
  { name: "apk", createdAt: new Date(Date.now() - 2 * 7 * 24 * 3600 * 1000).toISOString() }, // 2 weeks
  { name: "apps", createdAt: new Date(Date.now() - 3 * 7 * 24 * 3600 * 1000).toISOString() }, // 3 weeks
  { name: "audio", createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString() },
  { name: "binary", createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() }, // 2 weeks
  { name: "country", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { name: "databases", createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }, // 2 days
  { name: "encrypt", createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() },
  { name: "ephoto", createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() },
  { name: "facebook", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { name: "fancy", createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() },
  { name: "instagram", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { name: "music", createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString() },
  { name: "pdf", createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() },
  { name: "pintrest", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { name: "song", createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString() },
  { name: "spotify", createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() },
  { name: "tiktok", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { name: "tools", createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { name: "tts", createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
  { name: "videos", createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }, // yesterday
  { name: "ytvideos", createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString() }, // 9 hours ago
  { name: "pricing", createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }, // 1h ago
  { name: "support", createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }, // 30m
  { name: "contacts", createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  { name: "docs", createdAt: new Date(Date.now() - 2 * 7 * 24 * 3600 * 1000).toISOString() },
];

export default function FilesPageClient() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "time">("time");

  // In a real app, fetch from `/api/files` and set data state.
  const data = sampleData;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data.filter((d) => d.name.toLowerCase().includes(q));
    if (sortBy === "name") {
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [data, query, sortBy]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📁 My Files</h1>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search folders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 text-white placeholder:text-gray-400"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-white/5 text-white"
            aria-label="Sort"
          >
            <option value="time">Sort: Recent</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-white/5 border rounded-lg overflow-hidden">
        {filtered.map((f) => (
          <div key={f.name} className="flex items-center justify-between px-4 py-3 bg-[#0b0b0c]">
            <div className="flex items-center gap-3">
              <Folder className="text-gray-300" />
              {/* If you want folder -> link to route: <Link href={`/files/${f.name}`}> */}
              <div>
                <div className="font-medium text-white">{f.name}</div>
                <div className="text-xs text-gray-400">Folder</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">{timeAgo(f.createdAt)}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-400">No folders match your search.</div>
        )}
      </div>
    </div>
  );
}
