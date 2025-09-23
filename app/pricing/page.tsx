"use client";

import React from "react"; import Particles from "react-tsparticles"; import { loadFull } from "tsparticles"; import { motion } from "framer-motion"; import { TypeAnimation } from "react-type-animation"; import ReactPlayer from "react-player"; import ReactMarkdown from "react-markdown"; import { Gift, Users, Code, Gamepad2, Server, Briefcase, Phone, Mail, MessageCircle, Zap, ImageIcon, } from "lucide-react";

export default function SupportOpportunitiesPage() { const particlesInit = async (main) => { await loadFull(main); };

const wa = (text: string) =>
  `https://wa.me/254758476795?text=${encodeURIComponent(text)}`;

const ctas = { support: wa("Hi Tevona, I want to support Tevona. How can I help?"), submitAd: wa( "Hello Tevona, I want to submit an image/video banner for advertising. Please advise." ), applyLearner: wa("Hi Tevona, I want to apply as a learner at Tevona. Please guide me."), hireUs: wa("Hello Tevona team, I want to hire you for a website/project. Let's talk."), };

const features = [ { icon: <Gamepad2 className="w-7 h-7 text-white" />, title: "Games", desc: "Fun browser games to build community — we’ll run contests, leaderboards and social features.", }, { icon: <Code className="w-7 h-7 text-white" />, title: "Learn", desc: "Step-by-step coding lessons across languages with an AI assistant that helps build real projects.", }, { icon: <Server className="w-7 h-7 text-white" />, title: "APIs", desc: "Search, download and automation APIs you can plug into your own apps and workflows.", }, { icon: <Zap className="w-7 h-7 text-white" />, title: "Automation", desc: "Automate repetitive tasks: scheduled downloads, content posting, pipeline triggers and more.", }, { icon: <Users className="w-7 h-7 text-white" />, title: "Accounts & IDs", desc: "Signup/login, unique Tevona IDs for users, saved projects and dashboards.", }, { icon: <Briefcase className="w-7 h-7 text-white" />, title: "Hire Tevona Devs", desc: "Need a site, tool or automation? Send your brief — we build product-ready apps.", }, ];

const faqMd = `

Frequently Asked

Can I support Tevona without paying?
Yes — you can donate, share our tools, or submit content. Support keeps everything free.

How do I submit an ad?
Send your image or short video to WhatsApp at +254758476795 and include your preferred text and link. We’ll craft the ad and help promote it.

What payment methods do you accept?
M-Pesa (0758476795), PayPal (contact us), or direct support via WhatsApp.

Do you offer custom development?
Yes. We build websites, APIs and automation. Send a short CV or project brief to tevona@gmail.com or WhatsApp us. `;

return ( <main className="min-h-screen bg-gradient-to-b from-[#071025] via-[#0b1220] to-[#081022] text-white py-12"> {/* Particles background */} <Particles id="tsparticles" init={particlesInit} options={{ fullScreen: { enable: false }, fpsLimit: 60, particles: { number: { value: 40, density: { enable: true, area: 800 } }, color: { value: ["#7c3aed", "#06b6d4", "#f472b6"] }, shape: { type: "circle" }, opacity: { value: 0.7 }, size: { value: { min: 1, max: 4 } }, move: { enable: true, speed: 1.2, outMode: "bounce" }, links: { enable: true, distance: 140, color: "#5b21b6", opacity: 0.15 }, }, interactivity: { events: { onHover: { enable: true, mode: "repulse" } } }, }} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

<section className="relative z-10 max-w-6xl mx-auto px-6">
    {/* Hero */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Tevona — Free Tools, Community & Opportunity
        </h1>

        <div className="text-xl text-slate-300">
          <TypeAnimation
            sequence={[
              "Learn to code with an AI tutor.",
              1500,
              "Play fun browser games.",
              1500,
              "Use powerful APIs for your apps.",
              1500,
            ]}
            speed={40}
            repeat={Infinity}
            wrapper="span"
          />
        </div>

        <p className="text-slate-400 max-w-xl">
          Everything on Tevona is free. We build tools for the community — from music utilities to developer APIs. If you like what
          we do, support us so we can build more: games, lessons, automation and long-term free access.
        </p>

        <div className="flex flex-wrap gap-3">
          <a href={ctas.support} className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 shadow-lg">
            <Gift className="w-5 h-5" /> Support Tevona
          </a>

          <a href={ctas.submitAd} className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
            <ImageIcon className="w-5 h-5" /> Submit Ad (WhatsApp)
          </a>

          <a href={ctas.applyLearner} className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5">
            <Users className="w-5 h-5" /> Apply as Learner
          </a>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          <strong>Contacts:</strong>
          <div className="flex flex-wrap gap-4 mt-2">
            <a className="flex items-center gap-2" href="tel:+254758476795"><Phone className="w-4 h-4" /> +254 758 476 795</a>
            <a className="flex items-center gap-2" href="mailto:tevona@gmail.com"><Mail className="w-4 h-4" /> tevona@gmail.com</a>
            <a className="flex items-center gap-2" href="https://wa.me/254758476795"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
          </div>
          <div className="mt-2 text-yellow-300">M-Pesa: <strong>0758476795</strong> (Send money or contact us for paybill/till).</div>
        </div>
      </motion.div>

      {/* Right: Promo video + quick stats */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="bg-gradient-to-br from-white/3 to-white/6 rounded-2xl p-4 shadow-xl border border-white/6">
          <ReactPlayer
            url={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
            light={true}
            width="100%"
            height={240}
            controls={true}
          />

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold">Free</div>
              <div className="text-xs text-slate-300">All tools</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold">Learners</div>
              <div className="text-xs text-slate-300">1,200+</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold">APIs</div>
              <div className="text-xs text-slate-300">20+</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <a href={ctas.hireUs} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl">
              <Briefcase className="w-4 h-4" /> Hire Tevona Devs
            </a>
            <a href={ctas.submitAd} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
              <ImageIcon className="w-4 h-4" /> Submit Ad
            </a>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Features grid */}
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">What we’re building</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-gradient-to-br from-white/3 to-white/6 rounded-2xl p-6 shadow-lg border border-white/6 hover:scale-105 transition transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-xl shadow-md">
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-lg">{f.title}</div>
                <p className="text-sm text-slate-300 mt-1">{f.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Ads & Promo area */}
    <section className="mt-12 bg-gradient-to-br from-white/2 to-white/4 p-6 rounded-2xl border border-white/6">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold">Promote with Tevona</h3>
          <p className="text-slate-300 mt-2">Send us your image or short video banner and we’ll create a high-performing ad for you. We offer targeted promotion and design support to maximize views.</p>

          <ul className="mt-4 list-disc list-inside text-slate-300">
            <li>Submit your asset via WhatsApp: <a className="text-blue-300" href="https://wa.me/254758476795">wa.me/254758476795</a></li>
            <li>We edit your asset and suggest copy & CTAs.</li>
            <li>Paid promotion options available — message us for packages.</li>
          </ul>

          <div className="mt-4 flex gap-3">
            <a href={ctas.submitAd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600">Submit Ad (WhatsApp)</a>
            <a href={ctas.support} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 text-black">Support (M-Pesa)</a>
          </div>
        </div>

        <div className="w-64">
          <img src="/assets/ad-sample.png" alt="ad sample" className="rounded-xl shadow-md bg-gray-800" />
        </div>
      </div>
    </section>

    {/* Jobs / Hire / CV */}
    <section className="mt-12 grid lg:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-white/3 to-white/6 p-6 rounded-2xl border border-white/6">
        <h3 className="text-xl font-bold">Work with Tevona Devs</h3>
        <p className="text-slate-300 mt-2">We build websites, tools and automation. Send a CV or project brief — we’ll get back with a proposal.</p>
        <ul className="mt-4 list-disc list-inside text-slate-300">
          <li>Custom websites & dashboards</li>
          <li>API integrations</li>
          <li>Automation & scheduled tasks</li>
          <li>Ad creation & promotion</li>
        </ul>
        <div className="mt-4 flex gap-3">
          <a href={ctas.hireUs} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600">Hire us / Send CV</a>
          <a href="mailto:tevona@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">Email CV</a>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/3 to-white/6 p-6 rounded-2xl border border-white/6">
        <h3 className="text-xl font-bold">Apply as Learner</h3>
        <p className="text-slate-300 mt-2">We run guided courses with AI helpers and project-based learning. Apply and we’ll place you in the next cohort.</p>
        <ol className="mt-4 list-decimal list-inside text-slate-300">
          <li>Short application via WhatsApp</li>
          <li>Intro call & placement</li>
          <li>Project-based mentorship</li>
        </ol>
        <div className="mt-4">
          <a href={ctas.applyLearner} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500">Apply on WhatsApp</a>
        </div>
      </div>
    </section>

    {/* FAQ & Footer */}
    <section className="mt-12 grid lg:grid-cols-2 gap-6">
      <div className="p-6 bg-gradient-to-br from-white/3 to-white/6 rounded-2xl border border-white/6">
        <h3 className="text-xl font-bold mb-4">FAQ</h3>
        <ReactMarkdown className="prose prose-invert text-slate-300">{faqMd}</ReactMarkdown>
      </div>

      <div className="p-6 bg-gradient-to-br from-white/3 to-white/6 rounded-2xl border border-white/6">
        <h3 className="text-xl font-bold">Contact & Support</h3>
        <p className="text-slate-300 mt-2">Prefer direct contact? Use any of the methods below and we’ll respond fast.</p>
        <div className="mt-4 space-y-3 text-slate-300">
          <div className="flex items-center gap-3"><Phone className="w-5 h-5" /> <a href="tel:+254758476795">+254 758 476 795</a></div>
          <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5" /> <a href="https://wa.me/254758476795">WhatsApp</a></div>
          <div className="flex items-center gap-3"><Mail className="w-5 h-5" /> <a href="mailto:tevona@gmail.com">tevona@gmail.com</a></div>
          <div className="flex items-center gap-3 text-yellow-300"><strong>M-Pesa:</strong> 0758476795</div>
        </div>

        <div className="mt-6">
          <a href={ctas.support} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500">Support Tevona</a>
        </div>
      </div>
    </section>

    <footer className="mt-12 text-center text-slate-400">
      <div>Tevona — Free tools for learners, creators & builders.</div>
      <div className="mt-2 text-sm">© {new Date().getFullYear()} Tevona. All rights reserved.</div>
    </footer>
  </section>
</main>

); }

                                                                                                                                                                                                                                                                                                        
