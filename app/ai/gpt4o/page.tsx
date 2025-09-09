"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, Share2, User, Bot } from "lucide-react";

/**
 * GPT4o chat page (client)
 * - Fixed TypeScript message typing issue
 * - Latest AI message shows controls (Copy All, Copy Code blocks, Share)
 * - Scrolls to latest automatically
 *
 * Place this file at: app/ai/gpt4o/page.tsx
 */

type Message = {
  role: "user" | "ai";
  content: string;
  id?: string; // optional, useful if you want keys
};

export default function GPTPage(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to latest message
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
        "https://api.siputzx.my.id/api/ai/gpt-4o?text=" + encodeURIComponent(trimmed),
        { method: "GET", cache: "no-store" }
      );

      let resultText = "No response received.";
      try {
        const json = await res.json();
        resultText =
          (json.result ?? json.output ?? json.text ?? json.data ?? "").toString() ||
          resultText;
      } catch {
        try {
          resultText = await res.text();
        } catch {
          /* fallback keep default */
        }
      }

      const aiMessage: Message = { role: "ai", content: resultText };
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

  // Clipboard copy
  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  // Detect code blocks
  function extractCodeBlocks(text: string) {
    const regex = /```(?:\w*\n)?([\s\S]*?)```/g;
    let match;
    const blocks: string[] = [];
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks;
  }

  const latestIndex = messages.length - 1;
  const latestMessage = latestIndex >= 0 ? messages[latestIndex] : null;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10 text-center text-lg font-bold">
        Tevona GPT (powered by Siputzx API)
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isLatestAI = i === latestIndex && m.role === "ai";
          const isUser = m.role === "user";

          return (
            <div
              key={m.id ?? i}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-blue-600/80 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                }`}
              >
                {isLatestAI && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={18} />
                    <span className="text-xs opacity-70">AI</span>
                  </div>
                )}

                <div>{m.content}</div>

                {isLatestAI && (
                  <div className="mt-2 flex flex-wrap gap-2">
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your question..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 flex items-center gap-1 disabled:opacity-50"
        >
          <Send size={16} /> Send
        </button>
      </div>
    </main>
  );
  }
