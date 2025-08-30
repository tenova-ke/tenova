"use client";

import { useState } from "react";
import { Download, FileText, X } from "lucide-react";

export default function TextToPdfPage() {
  const [input, setInput] = useState("This was developed by Gifted Tech 🚀");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  async function generatePdf() {
    if (!input.trim()) {
      setError("⚠️ Please enter some text or a URL/image path.");
      return;
    }

    setLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      const url = `https://api.giftedtech.web.id/api/tools/topdf?apikey=gifted&query=${encodeURIComponent(
        input
      )}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.result?.pdf_url) {
        setPdfUrl(data.result.pdf_url);
      } else {
        setError("❌ Failed to generate PDF");
      }
    } catch (err: any) {
      setError("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Force download instead of redirect
  async function handleDownload(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "output.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      alert("❌ Failed to download PDF.");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-green-400 drop-shadow-lg flex items-center gap-2">
        <FileText className="w-8 h-8" /> Text → PDF
      </h1>
      <p className="text-gray-300 mb-6">
        Convert text, URLs, or image paths into a downloadable PDF instantly.
      </p>

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text, a URL (.txt), or an image URL (.png, .jpg, .jpeg, .webp, .gif)"
        rows={4}
        className="w-full p-3 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
      />

      {/* Generate Button */}
      <button
        onClick={generatePdf}
        disabled={loading}
        className="mt-4 px-6 py-3 bg-green-600 rounded-full font-semibold shadow-md hover:bg-green-500 transition disabled:opacity-50"
      >
        {loading ? "⚡ Generating..." : "Generate PDF"}
      </button>

      {/* Error */}
      {error && <p className="text-red-400 mt-3">{error}</p>}

      {/* Result */}
      {pdfUrl && (
        <div className="mt-8 bg-gray-800 p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-green-300 mb-3">
            ✅ PDF Generated
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setPreview(true)}
              className="px-4 py-2 bg-blue-600 rounded-full font-semibold hover:bg-blue-500 transition"
            >
              👁 View
            </button>
            <button
              onClick={() => handleDownload(pdfUrl, "output.pdf")}
              className="px-4 py-2 bg-green-600 rounded-full font-semibold hover:bg-green-500 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && pdfUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white w-full max-w-3xl h-[80vh] rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setPreview(false)}
              className="absolute -top-10 right-0 bg-red-600 p-2 rounded-full hover:bg-red-500"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <iframe src={pdfUrl} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* How to Use */}
      <div className="mt-12 text-gray-300 leading-relaxed">
        <h2 className="text-2xl font-bold mb-2 text-green-400">📖 How to Use</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Enter your text, a .txt file URL, or an image URL.</li>
          <li>Click <strong className="text-green-400">Generate PDF</strong>.</li>
          <li>Wait for the result, then choose to View inline or Download instantly.</li>
        </ol>
      </div>
    </div>
  );
}
