"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Download } from "lucide-react";

const effects = [
  { name: "Glossy Silver", key: "glossysilver" },
  { name: "Blackpink", key: "blackpink" },
  { name: "Glitch Text", key: "glitchtext" },
  { name: "Cartoon Style", key: "cartoonstyle" },
  { name: "Luxury Gold", key: "luxurygold" },
  // Add more based on Gifted’s list
];

export default function EphotoPage() {
  const [text, setText] = useState("");
  const [tool, setTool] = useState(effects[0].key);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!text) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch(`/api/ephoto?tool=${tool}&text=${encodeURIComponent(text)}`);
      const data = await res.json();

      if (data.success) {
        setImageUrl(data.image);
      } else {
        setError("❌ " + (data.error || "Failed to generate effect"));
      }
    } catch (err: any) {
      setError("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">✨ Ephoto Effects</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <select
          className="w-full p-2 border rounded"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
        >
          {effects.map((fx) => (
            <option key={fx.key} value={fx.key}>
              {fx.name}
            </option>
          ))}
        </select>

        <button
          onClick={generate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Generate"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {imageUrl && (
        <div className="mt-6 space-y-2">
          <Image
            src={imageUrl}
            alt="Generated Effect"
            width={500}
            height={500}
            className="rounded shadow"
          />
          <a
            href={imageUrl}
            download
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </a>
        </div>
      )}
    </div>
  );
   }
