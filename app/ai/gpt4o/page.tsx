"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, Share2, User, Bot } from "lucide-react";

export default function GPTPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to latest
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.siputzx.my.id/api/ai/gpt-4o?text=" + encodeURIComponent(input));
      const data = await res.json();

      const aiMessage = {
        role: "ai",
        content: data.result || "No response received.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", content: "❌ Error fetching AI response." }]);
    } finally {
      setLoading(false);
    }
  }

  // Clipboard copy
  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  // Detect code blocks (``` ... ```)
  function extractCodeBlocks(text: string) {
    const regex = /```([\s\S]*?)```/g;
    let match;
    const blocks: string[] = [];
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks;
  }

  const latestMessage = messages[messages.length - 1];

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10 text-center text-lg font-bold">
        Tevona GPT (powered by Siputzx API)
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isLatest = i === messages.length - 1 && m.role === "ai";
          return (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600/80 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                }`}
              >
                {/* Avatar only on latest */}
                {isLatest && (
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === "ai" ? <Bot size={18} /> : <User size={18} />}
                    <span className="text-xs opacity-70">
                      {m.role === "ai" ? "AI" : "You"}
                    </span>
                  </div>
                )}

                {m.content}

                {/* Controls only on latest AI message */}
                {isLatest && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => copyText(m.content)}
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                    >
                      <Copy size={14} /> Copy All
                    </button>
                    {extractCodeBlocks(m.content).map((block, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyText(block)}
                        className="text-xs flex items-center gap-1 px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                      >
                        <Copy size={14} /> Copy Code {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        navigator.share?.({
                          title: "AI Response from Tevona",
                          text: m.content,
                        })
                      }
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                    >
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && <div className="text-gray-400 text-sm">AI is typing...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your question..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 flex items-center gap-1"
        >
          <Send size={16} /> Send
        </button>
      </div>
    </main>
  );
}
