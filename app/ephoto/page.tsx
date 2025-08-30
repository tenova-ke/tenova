"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, ExternalLink, X } from "lucide-react";

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

  // Modal state
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    generate("blackpink", "Tevona");
  }, []);

  async function generate(tool: string, input: string) {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.giftedtech.web.id/api/ephoto360/${tool}?apikey=gifted&text=${encodeURIComponent(
        input
      )}`;
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

  function handleDownload(url: string, filename: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = effects.filter((fx) =>
    fx.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-purple-400 drop-shadow-lg">
        ✨ Ephoto Effects
      </h1>
      <p className="text-gray-300 mb-6">
        Generate stunning text effects instantly.
      </p>

      {/* Search + Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-3 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 p-3 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Tool Selector */}
      <div className="flex space-x-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={generateAll}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-md hover:scale-105 transition"
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
            className={`px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition ${
              selected === fx.key
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                : "bg-gray-600 text-gray-200 hover:bg-gray-500"
            }`}
          >
            {fx.name}
          </button>
        ))}
      </div>

      {/* Loader / Error */}
      {loading && <p className="text-blue-400 animate-pulse">⚡ Generating...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6">
        {results.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-b from-gray-800 to-gray-900 hover:scale-105 transition transform"
          >
            <div className="p-3 text-center border-b border-gray-700">
              <h2 className="font-semibold text-lg text-purple-300">
                {r.tool}
              </h2>
            </div>
            <Image
              src={r.image}
              alt={r.tool}
              width={400}
              height={400}
              className="rounded-b-2xl"
            />
            <div className="flex gap-2 p-3 bg-gray-800">
              <button
                onClick={() => setPreview(r.image)}
                className="flex-1 text-center px-3 py-2 bg-blue-600 rounded-full flex items-center justify-center font-semibold hover:bg-blue-500 transition"
              >
                <ExternalLink className="w-4 h-4 mr-1" /> View
              </button>
              <button
                onClick={() => handleDownload(r.image, `${r.tool}.png`)}
                className="flex-1 text-center px-3 py-2 bg-green-600 rounded-full flex items-center justify-center font-semibold hover:bg-green-500 transition"
              >
                <Download className="w-4 h-4 mr-1" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 bg-red-600 p-2 rounded-full hover:bg-red-500"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <Image
              src={preview}
              alt="Preview"
              width={800}
              height={800}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* How to use */}
      <div className="mt-12 text-gray-300 leading-relaxed">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">📖 How to Use</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter your text in the input field above.</li>
          <li>Search or scroll to find the effect you like.</li>
          <li>Click the effect button to generate.</li>
          <li>Wait for the result, then View inline or Download instantly.</li>
          <li>Or click <strong className="text-pink-400">All</strong> to generate across all effects.</li>
        </ol>
      </div>
    </div>
  );
    }
