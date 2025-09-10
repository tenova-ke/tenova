"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, Share2, Book } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function BibleAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "🙏 Praise the Lord Jesus Christ! How may I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.siputzx.my.id/api/ai/bibleai?question=" + encodeURIComponent(trimmed) + "&translation=ESV",
        { method: "GET", cache: "no-store" }
      );
      const json = await res.json();
      const answer = json?.data?.results?.answer || "❌ No response received.";

      const aiMessage: Message = { role: "ai", content: answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "❌ Error fetching Bible AI response." }]);
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  const latestIndex = messages.length - 1;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <header className="p-4 border-b border-white/10 text-center text-lg font-bold">
        ✝️ Bible AI (powered by Siputzx API)
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isLatestAI = i === latestIndex && m.role === "ai";
          return (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600/80 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                }`}
              >
                {m.content}

                {isLatestAI && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => copyText(m.content)}
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                    >
                      <Copy size={14} /> Copy
                    </button>
                    <button
                      onClick={() =>
                        navigator.share?.({
                          title: "Bible AI Response",
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

        {loading && <div className="text-gray-400 text-sm">📖 Searching Scripture...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a Bible question (e.g., What is faith?)"
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 flex items-center gap-1 disabled:opacity-50"
        >
          <Send size={16} /> Ask
        </button>
      </div>
    </main>
  );
  }
