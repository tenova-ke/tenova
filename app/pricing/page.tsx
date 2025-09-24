"use client";

import React from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import ReactPlayer from "react-player";
import ReactMarkdown from "react-markdown";
import {
  Gift,
  Users,
  Code,
  Gamepad2,
  Server,
  Briefcase,
  Phone,
  Mail,
  MessageCircle,
  Zap,
  ImageIcon,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function SupportOpportunitiesPage() {
  const wa = (text: string) =>
    `https://wa.me/254758476795?text=${encodeURIComponent(text)}`;

  const ctas = {
    support: wa("Hi Tevona, I want to support Tevona. How can I help?"),
    submitAd: wa(
      "Hello Tevona, I want to submit an image/video banner for advertising. Please advise."
    ),
    applyLearner: wa(
      "Hi Tevona, I want to apply as a learner at Tevona. Please guide me."
    ),
    hireUs: wa(
      "Hello Tevona team, I want to hire you for a website/project. Let's talk."
    ),
  };

  const features = [
    {
      icon: <Gamepad2 className="w-7 h-7 text-white" />,
      title: "Games",
      desc: "Fun browser games to build community — contests, leaderboards & social features.",
    },
    {
      icon: <Code className="w-7 h-7 text-white" />,
      title: "Learn",
      desc: "Step-by-step coding lessons with AI support to build real projects.",
    },
    {
      icon: <Server className="w-7 h-7 text-white" />,
      title: "APIs",
      desc: "Search, download and automation APIs you can plug into apps and workflows.",
    },
    {
      icon: <Zap className="w-7 h-7 text-white" />,
      title: "Automation",
      desc: "Automate tasks: scheduled downloads, content posting, pipeline triggers and more.",
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      title: "Accounts & IDs",
      desc: "Signup/login, unique Tevona IDs, saved projects and dashboards.",
    },
    {
      icon: <Briefcase className="w-7 h-7 text-white" />,
      title: "Hire Tevona Devs",
      desc: "Need a site, tool or automation? Send your brief — we build product-ready apps.",
    },
  ];

  const faqMd = `
**Frequently Asked**

**Can I support Tevona without paying?**  
Yes — you can donate, share our tools, or submit content. Support keeps everything free.

**How do I submit an ad?**  
Send your image or short video to WhatsApp at +254758476795 and include your text and link. We’ll craft the ad and promote it.

**What payment methods do you accept?**  
M-Pesa (0758476795), PayPal (contact us), or direct WhatsApp.

**Do you offer custom development?**  
Yes. We build websites, APIs and automation. Send a project brief to tevona09@gmail.com or WhatsApp us.
`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071025] via-[#0b1220] to-[#081022] text-white py-12">
      {/* Page content */}
      <section className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold"
          >
            Tevona Support & Opportunities
          </motion.h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            Empowering learners, creators & businesses with free tools, APIs, and automation.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-slate-800/40 rounded-2xl p-6 flex flex-col items-start space-y-3 shadow-md hover:shadow-lg transition"
            >
              <div className="p-3 rounded-xl bg-violet-600">{f.icon}</div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-slate-800/40 rounded-2xl p-6">
          <ReactMarkdown className="prose prose-invert">{faqMd}</ReactMarkdown>
        </div>

        {/* Contacts & Socials */}
        <div className="mt-12 text-center space-y-3">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>Phone: <a href="tel:+254758476795">+254 758 476 795</a></p>
          <p>Email: <a href="mailto:tevona09@gmail.com">tevona09@gmail.com</a></p>
          <p>WhatsApp: <a href="https://wa.me/254758476795">Chat with us</a></p>

          <div className="flex justify-center space-x-4 mt-3 text-slate-400">
            <a href="https://facebook.com/trackerwanga" target="_blank">Facebook</a>
            <a href="https://instagram.com/trackerwanga" target="_blank">Instagram</a>
            <a href="https://tiktok.com/@trackerwanga" target="_blank">TikTok</a>
            <a href="https://twitter.com/trackerwanga" target="_blank">Twitter</a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400">
          <div>Tevona — Free tools for learners, creators & builders.</div>
          <div className="mt-2 text-sm">
            © {new Date().getFullYear()} Tevona. All rights reserved.
          </div>
        </footer>
      </section>
    </main>
  );
  }
