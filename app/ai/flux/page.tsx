"use client";

import { useState } from "react";
import { Send, Copy, Download, RefreshCw, Image as ImageIcon } from "lucide-react";

export default function FluxImageAI() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateImage() {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch(
        `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`
      );

      if (!res.ok) throw new Error("Failed to generate image");
      // Blob → object URL
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("❌ Error: Could not generate image. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl() {
    if (imageUrl) {
      await navigator.clipboard.writeText(imageUrl);
      alert("✅ Image URL copied!");
    }
  }

  function downloadImage() {
    if (imageUrl) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = "flux-image.png";
      a.click();
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎨 Flux Image AI
      </h1>
      <p className="text-gray-400 mb-8 text-center">
        Generate stunning images from your imagination with Flux.
      </p>

      {/* Prompt input */}
      <div className="flex w-full max-w-xl gap-2 mb-6">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateImage()}
          placeholder="Type your prompt... (e.g., a cyberpunk lizard)"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white outline-none border border-pink-500/50 focus:border-pink-400"
        />
        <button
          onClick={generateImage}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={16} /> {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Result */}
      <div className="w-full max-w-2xl">
        {loading && (
          <div className="w-full aspect-square rounded-xl bg-gradient-to-r from-pink-500/20 to-red-500/20 animate-pulse flex items-center justify-center text-pink-400">
            <ImageIcon size={40} className="animate-bounce" />
          </div>
        )}

        {imageUrl && (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Generated"
              className="rounded-xl shadow-lg border border-pink-500/30"
            />

            {/* Controls */}
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={copyUrl}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm"
              >
                <Copy size={14} /> Copy URL
              </button>
              <button
                onClick={downloadImage}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm"
              >
                <Download size={14} /> Download
              </button>
              <button
                onClick={generateImage}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm disabled:opacity-50"
              >
                <RefreshCw size={14} /> Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
