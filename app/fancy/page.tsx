"use client";

import { useState } from "react";
import { Sparkles, Copy } from "lucide-react";

export default function FancyFontsPage() {
  const [input, setInput] = useState("Tracker Wanga");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; result: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function generateFancy() {
    if (!input.trim()) {
      setError("⚠️ Please enter some text first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const url = `https://api.giftedtech.web.id/api/tools/fancyv2?apikey=gifted_api_jsgt5su7s&text=${encodeURIComponent(
        input
      )}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.results) {
        setResults(data.results);
      } else {
        setError("❌ Failed to generate fancy fonts.");
      }
    } catch (err: any) {
      setError("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    alert("✅ Copied: " + text);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-purple-400 drop-shadow-lg flex items-center gap-2">
        <Sparkles className="w-8 h-8" /> Fancy Fonts Generator
      </h1>
      <p className="text-gray-300 mb-6">
        Transform your plain text into stylish fancy fonts instantly ✨
      </p>

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your text (e.g. Tracker Wanga)"
        rows={3}
        className="w-full p-3 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
      />

      {/* Generate Button */}
      <button
        onClick={generateFancy}
        disabled={loading}
        className="mt-4 px-6 py-3 bg-purple-600 rounded-full font-semibold shadow-md hover:bg-purple-500 transition disabled:opacity-50"
      >
        {loading ? "⚡ Generating..." : "Generate Fancy Fonts"}
      </button>

      {/* Error */}
      {error && <p className="text-red-400 mt-3">{error}</p>}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {results.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-4 rounded-xl shadow-lg flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-400">{item.name}</p>
                <p className="text-lg font-semibold">{item.result}</p>
              </div>
              <button
                onClick={() => copyText(item.result)}
                className="ml-3 p-2 bg-purple-600 rounded-full hover:bg-purple-500"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* How to Use */}
      <div className="mt-12 text-gray-300 leading-relaxed">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">📖 How to Use</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Type your text in the box above (default: Tracker Wanga).</li>
          <li>Click <strong className="text-purple-400">Generate Fancy Fonts</strong>.</li>
          <li>Copy any style you like with one click.</li>
        </ol>
      </div>
    </div>
  );
}
