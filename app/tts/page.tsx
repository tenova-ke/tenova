// app/tts/page.tsx
"use client";

import { useState } from "react";

export default function TTSPage() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAudioUrl(null);

    try {
      const apiUrl = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(
        text
      )}`;

      // Set audio URL directly (stream from API)
      setAudioUrl(apiUrl);
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="max-w-2xl w-full bg-slate-800/70 backdrop-blur rounded-2xl p-6 shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
          Tevona — Text to Speech
        </h1>
        <p className="text-center text-slate-400 mb-6">
          Type text and convert it into natural speech using Google TTS.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
          rows={4}
          className="w-full p-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
        />

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSpeak}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition shadow-md"
          >
            {loading ? "Generating..." : "Speak"}
          </button>
          {audioUrl && (
            <a
              href={audioUrl}
              download="tts-output.mp3"
              className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 transition shadow-md"
            >
              Download
            </a>
          )}
        </div>

        {audioUrl && (
          <div className="mt-6 flex flex-col items-center">
            <audio controls autoPlay src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </main>
  );
}
