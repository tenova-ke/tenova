"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, Share2, User, BookOpenText } from "lucide-react";

// ✅ Helper: highlight Bible verses with glow
function highlightVerses(text: string) {
  const verseRegex = /\b([1-3]?\s?[A-Za-z]+\s?\d+:\d+)\b/g;
  return text.split(verseRegex).map((part, i) => {
    if (part.match(verseRegex)) {
      return (
        <span
          key={i}
          className="px-1 rounded bg-yellow-400/20 text-yellow-300 font-semibold shadow-[0_0_8px_rgba(250,204,21,0.7)]"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function BibleAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "✝️ Praise the Lord Jesus Christ. How may I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.siputzx.my.id/api/ai/bibleai?text=" + encodeURIComponent(input)
      );
      const data = await res.json();

      const aiMessage: Message = {
        role: "ai",
        content: data.result || "No response received.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "❌ Error fetching AI response." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  // ✅ Extract Bible verses for quick-copy chips
  function extractVerses(text: string) {
    const regex = /\b([1-3]?\s?[A-Za-z]+\s?\d+:\d+)\b/g;
    return [...text.matchAll(regex)].map((m) => m[0]);
  }

  const latestMessage = messages[messages.length - 1];

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0b0512] to-[#14102a] text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10 text-center text-lg font-bold">
        ✝️ Bible AI (powered by Siputzx API)
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isLatest = i === messages.length - 1 && m.role === "ai";
          const verses = m.role === "ai" ? extractVerses(m.content) : [];

          return (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600/80 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                }`}
              >
                {/* Avatar only on latest AI message */}
                {isLatest && (
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === "ai" ? <BookOpenText size={18} /> : <User size={18} />}
                    <span className="text-xs opacity-70">{m.role === "ai" ? "Bible AI" : "You"}</span>
                  </div>
                )}

                {/* Highlight verses */}
                <div>{highlightVerses(m.content)}</div>

                {/* Verse-specific copy buttons */}
                {verses.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {verses.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyText(v)}
                        className="text-xs flex items-center gap-1 px-2 py-1 bg-yellow-400/10 text-yellow-300 rounded hover:bg-yellow-400/20"
                      >
                        <Copy size={14} /> {v}
                      </button>
                    ))}
                  </div>
                )}

                {/* Full copy/share only on latest AI */}
                {isLatest && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => copyText(m.content)}
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                    >
                      <Copy size={14} /> Copy All
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

        {loading && <div className="text-gray-400 text-sm">Bible AI is thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about scripture..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 flex items-center gap-1"
        >
          <Send size={16} /> Send
        </button>
      </div>
    </main>
  );
                                     }
