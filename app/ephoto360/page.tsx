"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type Tool = {
  name: string;
  endpoint: string;
};

const tools: Tool[] = [
  { name: "Glossy Silver", endpoint: "glossysilver" },
  { name: "Write Text", endpoint: "writetext" },
  { name: "Black Pink Logo", endpoint: "blackpinklogo" },
  { name: "Glitch Text", endpoint: "glitchtext" },
  { name: "Advanced Glow", endpoint: "advancedglow" },
  { name: "Typography Text", endpoint: "typographytext" },
  { name: "Pixel Glitch", endpoint: "pixelglitch" },
  { name: "Neon Glitch", endpoint: "neonglitch" },
  { name: "Cartoon Style", endpoint: "cartoonstyle" },
  { name: "Luxury Gold", endpoint: "luxurygold" },
  { name: "Galaxy", endpoint: "galaxy" },
  // 👉 you can add all 29 tools here
];

export default function EphotoPage() {
  const [query, setQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(tools[0]);
  const [text, setText] = useState("Tevona"); // auto-generate demo
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    { tool: string; image: string }[]
  >([]);

  const filteredTools = tools.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  async function generateEffect(tool: Tool, input: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.giftedtech.web.id/api/ephoto360/${tool.endpoint}?apikey=gifted&text=${encodeURIComponent(
          input
        )}`
      );
      const data = await res.json();
      if (data.success) {
        setResults((prev) => [
          ...prev,
          { tool: tool.name, image: data.result.image_url },
        ]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // auto generate demo on mount
    if (selectedTool && results.length === 0) {
      generateEffect(selectedTool, text);
    }
  }, [selectedTool]);

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">✨ Ephoto Effects</h1>
        <p className="text-gray-400">
          Generate stunning text effects instantly.
        </p>
      </div>

      {/* Input + Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Input
          placeholder="Search tool..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Tool Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant="default"
          onClick={() => setSelectedTool(null)}
          className="bg-purple-600 text-white"
        >
          All
        </Button>
        {filteredTools.map((tool) => (
          <Button
            key={tool.endpoint}
            variant={selectedTool?.endpoint === tool.endpoint ? "default" : "outline"}
            onClick={() => setSelectedTool(tool)}
          >
            {tool.name}
          </Button>
        ))}
      </div>

      {/* Generate Button */}
      {selectedTool && (
        <Button
          disabled={loading}
          onClick={() => generateEffect(selectedTool, text)}
          className="w-full bg-blue-600 text-white"
        >
          {loading ? "Generating..." : `Generate with ${selectedTool.name}`}
        </Button>
      )}

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4">
        {results.map((res, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-2">
                <Image
                  src={res.image}
                  alt={res.tool}
                  width={400}
                  height={300}
                  className="rounded-xl"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <a
                  href={res.image}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View
                </a>
                <a
                  href={res.image}
                  download
                  className="text-green-600 underline"
                >
                  Download
                </a>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* How to Use */}
      <div className="bg-gray-900 text-gray-200 p-6 rounded-xl mt-10">
        <h2 className="text-xl font-semibold mb-3">📌 How to Use</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your text in the input box.</li>
          <li>Select a tool effect from the scrollable buttons.</li>
          <li>Click "Generate" to create your effect.</li>
          <li>Scroll down to see results in cards.</li>
          <li>Click "View" or "Download" to save your image.</li>
        </ol>
      </div>
    </div>
  );
}
