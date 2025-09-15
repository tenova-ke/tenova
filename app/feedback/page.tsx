"use client";

import { useState, useEffect } from "react";
import { Send, Copy, CheckCircle } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";

interface Feedback {
  id: string;
  message: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [recent, setRecent] = useState<Feedback[]>([]);

  useEffect(() => {
    // fetch recent feedbacks
    const fetchRecent = async () => {
      try {
        const res = await axios.get("/api/feedback/recent");
        setRecent(res.data.feedbacks || []);
      } catch {
        setRecent([]);
      }
    };
    fetchRecent();
  }, [successId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/feedback", form);
      setSuccessId(res.data.feedbackId);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      setSuccessId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">💬 Send Feedback</h1>
      <p className="text-gray-400 mb-8">
        We’d love to hear from you! Fill in the form below to send us your feedback.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg"
      >
        <input
          type="text"
          placeholder="Name (optional)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 rounded-lg bg-white/10 text-white"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 rounded-lg bg-white/10 text-white"
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 rounded-lg bg-white/10 text-white"
        />
        <textarea
          placeholder="Message (required)"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full p-2 rounded-lg bg-white/10 text-white min-h-[100px]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          {loading ? "Sending..." : "Send Feedback"} <Send size={16} />
        </button>
      </form>

      {successId && (
        <div className="mt-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-400" />
          <span>
            ✅ Feedback sent successfully! <br />
            Your ID:{" "}
            <code className="bg-black/30 px-2 py-1 rounded">{successId}</code>
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(successId)}
            className="ml-auto text-xs flex items-center gap-1 px-2 py-1 border border-green-400 rounded hover:bg-green-600/30"
          >
            <Copy size={14} /> Copy
          </button>
        </div>
      )}

      {/* Recent Feedback */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">🕒 Recent Feedback</h2>
        {recent.length === 0 && (
          <p className="text-gray-500">No recent feedback available.</p>
        )}
        <div className="space-y-4">
          {recent.map((fb) => (
            <div
              key={fb.id}
              className="p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <p className="text-white/90">{fb.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                Sent {dayjs(fb.createdAt).fromNow()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Wanga */}
      <div className="mt-16 text-center">
        <p className="text-gray-400 mb-2">Need quick support?</p>
        <a
          href="https://wa.me/254758476795"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          💬 Chat with Wanga on WhatsApp
        </a>
      </div>
    </div>
  );
}
