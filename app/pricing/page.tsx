// app/pricing/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Eye,
  Wallet,
  Code as CodeIcon,
} from "lucide-react";

const PHONE = "+254758476795";
const WHA = (t = "") =>
  `https://wa.me/254758476795?text=${encodeURIComponent(t || "Hello Wanga")}`;
const TEL = `tel:${PHONE}`;

type Lang = {
  id: string;
  name: string;
  sample: string;
  desc: string;
  colorFrom: string;
  colorTo: string;
};

const LANGS: Lang[] = [
  {
    id: "html",
    name: "HTML",
    sample: `<!doctype html>
<html>
  <head><title>Hello</title></head>
  <body><h1>Hello, Tevona!</h1></body>
</html>`,
    desc: "Structure the web. Perfect for beginners.",
    colorFrom: "from-rose-400",
    colorTo: "to-pink-500",
  },
  {
    id: "css",
    name: "CSS",
    sample: `body { 
  background: linear-gradient(90deg,#000,#1f1b2e);
}
h1 { color: #fff; text-shadow: 0 0 12px rgba(255,255,255,0.06); }`,
    desc: "Style with flair — animations, layouts and responsive design.",
    colorFrom: "from-indigo-400",
    colorTo: "to-cyan-400",
  },
  {
    id: "js",
    name: "JavaScript",
    sample: `const greet = (name) => \`Hi \${name}!\`;
console.log(greet("Tevona"));`,
    desc: "Make the web interactive. DOM, fetch, async & more.",
    colorFrom: "from-yellow-400",
    colorTo: "to-orange-500",
  },
  {
    id: "python",
    name: "Python",
    sample: `def greet(name):
    return f"Hello, {name}"
print(greet("Tevona"))`,
    desc: "Simple, powerful — great for beginners and AI projects.",
    colorFrom: "from-green-400",
    colorTo: "to-emerald-500",
  },
  {
    id: "node",
    name: "Node.js",
    sample: `import http from "http";
http.createServer((req,res)=>res.end("ok")).listen(3000);`,
    desc: "Server-side JavaScript — build APIs and realtime apps.",
    colorFrom: "from-lime-400",
    colorTo: "to-emerald-400",
  },
  {
    id: "cpp",
    name: "C++",
    sample: `#include <iostream>
int main(){ std::cout<<"Hello\\n"; return 0; }`,
    desc: "Systems and performance — pointers, classes, speed.",
    colorFrom: "from-slate-400",
    colorTo: "to-gray-600",
  },
  {
    id: "csharp",
    name: "C#",
    sample: `using System;
class App { static void Main(){ Console.WriteLine("Hi"); } }`,
    desc: "App and game development, strong typed and productive.",
    colorFrom: "from-blue-400",
    colorTo: "to-indigo-600",
  },
  {
    id: "java",
    name: "Java",
    sample: `public class Main{
  public static void main(String[] args){
    System.out.println("Hello");
  }
}`,
    desc: "Enterprise, Android and solid engineering fundamentals.",
    colorFrom: "from-red-400",
    colorTo: "to-rose-600",
  },
  {
    id: "shell",
    name: "Shell",
    sample: `#!/bin/bash
echo "Deploying..."`,
    desc: "Automate tasks, scripts and deployment workflows.",
    colorFrom: "from-gray-500",
    colorTo: "to-gray-700",
  },
];

function useCount(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = performance.now();
    let raf = 0;
    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.floor(t * target));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function SupportLearningPage() {
  const views = useCount(234567);
  const learners = useCount(1240);
  const wallet = useCount(74200);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copySample(id: string, sample: string) {
    try {
      await navigator.clipboard.writeText(sample);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1700);
    } catch {
      // silent fail
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-zinc-900 text-white p-8">
      <header className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
          Tevona Learning Lab — Learn. Build. Ship.
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Hands-on lessons across popular languages. Friendly AI helpers and real projects. Want a private cohort or custom curriculum?
        </p>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-pink-400" />
            <div className="text-sm text-slate-300">Views</div>
            <div className="ml-2 font-mono font-bold text-lg text-pink-300">{views.toLocaleString()}</div>
          </div>

          <div className="flex items-center gap-2">
            <svg width="18" height="18" className="text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"/></svg>
            <div className="text-sm text-slate-300">Learners</div>
            <div className="ml-2 font-mono font-bold text-lg text-emerald-300">{learners.toLocaleString()}</div>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <div className="text-sm text-slate-300">Support</div>
            <div className="ml-2 font-mono font-bold text-lg text-yellow-300">KES {wallet.toLocaleString()}</div>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {LANGS.map((lang, i) => (
          <motion.article
            key={lang.id}
            className="relative group overflow-hidden rounded-2xl p-5 border border-white/6 shadow-2xl bg-gradient-to-b from-black/60 to-white/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, type: "spring", stiffness: 90 }}
            whileHover={{ scale: 1.03, y: -8 }}
          >
            <FloatingBadge colorFrom={lang.colorFrom} colorTo={lang.colorTo} />

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lang.colorFrom} ${lang.colorTo} flex items-center justify-center shadow-lg`}>
                    <CodeIcon className="w-6 h-6 opacity-95" />
                  </div>
                  <h3 className="text-xl font-semibold">{lang.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-2">{lang.desc}</p>
              </div>

              <div className="text-right">
                <a
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/8 transition"
                  href={WHA(`Hi Wanga, I'm interested in ${lang.name} lessons`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4" /> Contact
                </a>
                <a
                  className="block mt-3 text-xs text-slate-400"
                  href={TEL}
                >
                  Call
                </a>
              </div>
            </div>

            <div className="mt-4">
              <div className="rounded-md overflow-auto border border-white/6 bg-black/40 p-3 text-sm">
                <pre className="font-mono text-xs leading-tight text-slate-200 whitespace-pre-wrap">
                  <code>{lang.sample}</code>
                </pre>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-slate-300">
                <small className="text-xs">Live examples •</small>
                <span className="text-xs font-mono">Level: Beginner</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copySample(lang.id, lang.sample)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/6 rounded-lg text-xs hover:scale-105 transition"
                  aria-label={`Copy ${lang.name} sample`}
                >
                  {copiedId === lang.id ? "Copied!" : "Copy"}
                </button>

                <a
                  href={WHA(`Hi Wanga, I'd like private ${lang.name} lessons`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg text-white text-sm shadow"
                >
                  Enroll
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="max-w-6xl mx-auto mt-10">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-white/3 to-white/5 border border-white/6 shadow-lg">
          <h3 className="text-xl font-semibold">Want a custom course or hire us?</h3>
          <p className="text-slate-300 mt-2">We create private cohorts, project-based learning, and developer teams for hire. Send your brief via WhatsApp or call.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={WHA("Hello Tevona, I want a custom course / hire devs")} className="px-4 py-2 rounded-xl bg-emerald-500">WhatsApp</a>
            <a href={TEL} className="px-4 py-2 rounded-xl bg-indigo-600">Call</a>
            <a href="mailto:tevona09@gmail.com" className="px-4 py-2 rounded-xl bg-white/5">Email</a>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto mt-10 text-center text-slate-400">
        © {new Date().getFullYear()} Tevona • trackerwanga (FB, IG, TikTok, Twitter)
      </footer>

      <style jsx>{`
        .floating-badge {
          position: absolute;
          right: -36px;
          top: -28px;
          width: 140px;
          height: 140px;
          filter: blur(28px);
          opacity: 0.12;
          transform: rotate(18deg);
          z-index: 0;
        }

        @keyframes floaty {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }

        article { animation: floaty 6s ease-in-out infinite; }
      `}</style>
    </main>
  );
}

/* helpers kept inside file for easy copy-paste */
function FloatingBadge({ colorFrom, colorTo }: { colorFrom: string; colorTo: string }) {
  return (
    <div
      className={`floating-badge rounded-full bg-gradient-to-br ${colorFrom} ${colorTo}`}
      aria-hidden
    />
  );
                                                        }
