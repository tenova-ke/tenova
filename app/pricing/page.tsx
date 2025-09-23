"use client";

import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles-engine"; // ✅ fixed import
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
} from "lucide-react";

export default function SupportOpportunitiesPage() {
  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const wa = (text: string) =>
    `https://wa.me/254758476795?text=${encodeURIComponent(text)}`;

  const ctas = {
    support: wa(
      "Hi Tevona, I want to support Tevona. How can I help?"
    ),
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
      desc: "Fun browser games to build community — we’ll run contests, leaderboards and social features.",
    },
    {
      icon: <Code className="w-7 h-7 text-white" />,
      title: "Learn",
      desc: "Step-by-step coding lessons across languages with an AI assistant that helps build real projects.",
    },
    {
      icon: <Server className="w-7 h-7 text-white" />,
      title: "APIs",
      desc: "Search, download and automation APIs you can plug into your own apps and workflows.",
    },
    {
      icon: <Zap className="w-7 h-7 text-white" />,
      title: "Automation",
      desc: "Automate repetitive tasks: scheduled downloads, content posting, pipeline triggers and more.",
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      title: "Accounts & IDs",
      desc: "Signup/login, unique Tevona IDs for users, saved projects and dashboards.",
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
Send your image or short video to WhatsApp at +254758476795 and include your preferred text and link. We’ll craft the ad and help promote it.

**What payment methods do you accept?**  
M-Pesa (0758476795), PayPal (contact us), or direct support via WhatsApp.

**Do you offer custom development?**  
Yes. We build websites, APIs and automation. Send a short CV or project brief to tevona@gmail.com or WhatsApp us.
`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071025] via-[#0b1220] to-[#081022] text-white py-12">
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          fpsLimit: 60,
          particles: {
            number: { value: 40, density: { enable: true, area: 800 } },
            color: { value: ["#7c3aed", "#06b6d4", "#f472b6"] },
            shape: { type: "circle" },
            opacity: { value: 0.7 },
            size: { value: { min: 1, max: 4 } },
            move: { enable: true, speed: 1.2, outMode: "bounce" },
            links: {
              enable: true,
              distance: 140,
              color: "#5b21b6",
              opacity: 0.15,
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
            },
          },
        }}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      {/* Page content */}
      <section className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero */}
        {/* ... keep the rest of your JSX unchanged from your last version ... */}

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
