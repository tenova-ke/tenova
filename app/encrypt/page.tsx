"use client";

import { useState } from "react";
import { Code, Copy, RefreshCw } from "lucide-react";

export default function Base64ToolPage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Tracker Wanga");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    if (!input.trim()) {
      setError("⚠️ Please enter some input.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoint = mode === "encode" ? "ebase" : "dbase";
      const url = `https://api.giftedtech.web.id/api/tools/${endpoint}?apikey=gifted_api_jsgt5su7s&query=${encodeURIComponent(
        input
      )}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setError("❌ Failed to convert. Try again.");
      }
    } catch (err: any) {
      setError("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result);
      alert("✅ Copied to clipboard!");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-purple-400 drop-shadow-lg flex items-center gap-2">
        <Code className="w-8 h-8" /> Base64 Converter
      </h1>
      <p className="text-gray-300 mb-6">
        Encode text into Base64 or decode Base64 back to text instantly.
      </p>

      {/* Mode Switch */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode("encode");
            setResult(null);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            mode === "encode"
              ? "bg-purple-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          🔒 Encode (Text → Base64)
        </button>
        <button
          onClick={() => {
            setMode("decode");
            setResult(null);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            mode === "decode"
              ? "bg-purple-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          🔓 Decode (Base64 → Text)
        </button>
      </div>

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          mode === "encode"
            ? "Enter text (e.g. Hello)"
            : "Enter Base64 string (e.g. SGVsbG8=)"
        }
        rows={4}
        className="w-full p-3 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
      />

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={loading}
        className="mt-4 px-6 py-3 bg-purple-600 rounded-full font-semibold shadow-md hover:bg-purple-500 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" /> Converting...
          </>
        ) : (
          "⚡ Convert"
        )}
      </button>

      {/* Error */}
      {error && <p className="text-red-400 mt-3">{error}</p>}

      {/* Result */}
      {result && (
        <div className="mt-8 bg-gray-800 p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-purple-300 mb-3">
            ✅ Result
          </h2>
          <div className="flex flex-col gap-3">
            <textarea
              value={result}
              readOnly
              rows={4}
              className="w-full p-3 rounded-2xl bg-gray-900 text-purple-200 font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 rounded-full font-semibold hover:bg-blue-500 transition flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        </div>
      )}

      {/* How to Use */}
      <div className="mt-12 text-gray-300 leading-relaxed">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">📖 How to Use</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Select whether you want to <strong>Encode</strong> or <strong>Decode</strong>.</li>
          <li>Enter your text or Base64 string.</li>
          <li>Click <strong className="text-purple-400">Convert</strong> to get the result.</li>
          <li>Copy the result with one click.</li>
        </ol>
      </div>
    </div>
  );
}
