"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Download, ExternalLink } from "lucide-react";

// All tools from Gifted API
const effects = [
  { name: "Glossy Silver", key: "glossysilver" },
  { name: "Write Text", key: "writetext" },
  { name: "Black Pink Logo", key: "blackpinklogo" },
  { name: "Glitch Text", key: "glitchtext" },
  { name: "Advanced Glow", key: "advancedglow" },
  { name: "Typography Text", key: "typography" },
  { name: "Pixel Glitch", key: "pixelglitch" },
  { name: "Neon Glitch", key: "neonglitch" },
  { name: "Nigerian Flag", key: "nigerianflag" },
  { name: "American Flag", key: "americanflag" },
  { name: "Deleting Text", key: "deletingtext" },
  { name: "Blackpink Style", key: "blackpink" },
  { name: "Glowing Text", key: "glowingtext" },
  { name: "Under Water", key: "underwater" },
  { name: "Logo Maker", key: "logomaker" },
  { name: "Cartoon Style", key: "cartoonstyle" },
  { name: "Paper Cut", key: "papercut" },
  { name: "Multi Colored", key: "multicolored" },
  { name: "Effect Clouds", key: "effectclouds" },
  { name: "Gradient Text", key: "gradienttext" },
  { name: "Summer Beach", key: "summerbeach" },
  { name: "Sand Summer", key: "sandsummer" },
  { name: "Luxury Gold", key: "luxurygold" },
  { name: "Galaxy", key: "galaxy" },
  { name: "1917", key: "effect1917" },
  { name: "Making Neon", key: "makingneon" },
  { name: "Text Effect", key: "texteffect" },
  { name: "Galaxy Style", key: "galaxystyle" },
  { name: "Light Effect", key: "lighteffect" },
];

export default function EphotoPage() {
  const [text, setText] = useState("Tevona");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>("blackpink");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto generate default on load
  useEffect(() => {
    generate("blackpink", "Tevona");
  }, []);

  async function generate(tool: string, input: string) {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.giftedtech.web.id/api/ephoto360/${tool}?apikey=gifted&text=${encodeURIComponent(input)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.result?.image_url) {
        setResults((prev) => [
          ...prev,
          { tool, text: input, image: data.result.image_url },
        ]);
      } else {
        setError("❌ Failed to generate");
      }
    } catch (err: any) {
      setError("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateAll() {
    setResults([]);
    for (const fx of effects) {
      await generate(fx.key, text);
    }
  }

  const filtered = effects.filter((fx) =>
    fx.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">✨ Ephoto Effects</h1>
      <p className="text-gray-600 mb-6">Generate stunning text effects instantly.</p>

      {/* Search + Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 p-2 border rounded"
        />
      </div>

      {/* Tool Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={generateAll}
          className="px-4 py-2 bg-purple-600 text-white rounded whitespace-nowrap"
        >
          All
        </button>
        {filtered.map((fx) => (
          <button
            key={fx.key}
            onClick={() => {
              setSelected(fx.key);
              generate(fx.key, text);
            }}
            className={`px-4 py-2 rounded whitespace-nowrap ${
              selected === fx.key ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {fx.name}
          </button>
        ))}
      </div>

      {/* Loader / Error */}
      {loading && <p className="text-blue-500">⚡ Generating...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {results.map((r, i) => (
          <div key={i} className="border rounded shadow p-3 bg-white">
            <h2 className="font-semibold mb-2">{r.tool}</h2>
            <Image
              src={r.image}
              alt={r.tool}
              width={400}
              height={400}
              className="rounded mb-2"
            />
            <div className="flex gap-2">
              <a
                href={r.image}
                target="_blank"
                className="flex-1 text-center px-3 py-1 bg-blue-600 text-white rounded flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-1" /> View
              </a>
              <a
                href={r.image}
                download
                className="flex-1 text-center px-3 py-1 bg-green-600 text-white rounded flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-1" /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* How to use */}
      <div className="mt-12 p-6 border rounded bg-gray-50">
        <h2 className="text-2xl font-bold mb-2">📖 How to Use</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Enter your text in the input field above.</li>
          <li>Search or scroll to find the effect you like.</li>
          <li>Click the effect button to generate.</li>
          <li>Wait for the result, then View or Download.</li>
          <li>Or click <strong>All</strong> to generate across all effects.</li>
        </ol>
      </div>
    </div>
  );
  }
