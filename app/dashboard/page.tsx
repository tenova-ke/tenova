"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Music,
  Youtube,
  ImageIcon,
  FileText,
  Globe,
  Lock,
  Users,
  Download,
  Wifi,
  Zap,
  Play,
  Gamepad,
  Code,
  FileVideo,
  Disc,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Dashboard page (full)
 * - Place as app/dashboard/page.tsx
 * - Requires: tailwindcss, framer-motion, recharts, lucide-react
 *
 * - Clicking a tile uses router.push to internal pages (no popup)
 * - PING_URL is polled every 5s to measure latency and online/offline
 */

/* ----------------- Utilities & Types ----------------- */

type Point = { x: number; y: number };

function genInitialSeries(length = 24, base = 50, variance = 20): Point[] {
  const arr: Point[] = [];
  for (let i = 0; i < length; i++) {
    arr.push({
      x: i,
      y: Math.max(5, Math.round(base + (Math.random() - 0.5) * variance)),
    });
  }
  return arr;
}

function useAnimatedCounter(target: number, duration = 900) {
  const [value, setValue] = useState<number>(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.floor(target * t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

type StatCardProps = {
  title: string;
  subtitle?: string;
  value: number | string;
  onToggle?: () => void;
  show?: boolean;
  series?: Point[];
  color?: string;
};

/* ----------------- Page ----------------- */

export default function DashboardPage(): JSX.Element {
  const router = useRouter();

  // Search
  const [query, setQuery] = useState("");

  // Tools list (map id -> internal route)
  const tools = [
    { id: "youtube", title: "YouTube", icon: <Youtube className="w-6 h-6" />, route: "/youtube" },
    { id: "ephoto360", title: "Ephoto360", icon: <ImageIcon className="w-6 h-6" />, route: "/ephoto360" },
    { id: "fancypdf", title: "PDF", icon: <FileText className="w-6 h-6" />, route: "/pdf" },
    { id: "webtools", title: "apps", icon: <Globe className="w-6 h-6" />, route: "/apk" },
    { id: "encrypt", title: "Encrypt", icon: <Lock className="w-6 h-6" />, route: "/encrypt" },
    { id: "downloads", title: "Tools", icon: <Download className="w-6 h-6" />, route: "/tools" },
  ];

  // Additional row requested (Spotify, Music, Fancy, Videos, Binary, Games)
  const toolsRow2 = [
    { id: "spotify", title: "Spotify", icon: <Disc className="w-6 h-6" />, route: "/spotify" },
    { id: "music", title: "Music", icon: <Music className="w-6 h-6" />, route: "/music" },
    { id: "fancy", title: "Fancy", icon: <Play className="w-6 h-6" />, route: "/fancy" },
    { id: "videos", title: "Videos", icon: <FileVideo className="w-6 h-6" />, route: "/videos" },
    { id: "binary", title: "Binary", icon: <Code className="w-6 h-6" />, route: "/binary" },
    { id: "games", title: "Games", icon: <Gamepad className="w-6 h-6" />, route: "/games" },
  ];

  // Data series for charts
  const [monthSeries, setMonthSeries] = useState<Point[]>(() => genInitialSeries(20, 1200, 600));
  const [weekSeries, setWeekSeries] = useState<Point[]>(() => genInitialSeries(14, 320, 150));
  const [todaySeries, setTodaySeries] = useState<Point[]>(() => genInitialSeries(12, 48, 22));
  const [apiSeries, setApiSeries] = useState<Point[]>(() => genInitialSeries(20, 380, 40));
  const [pingHistory, setPingHistory] = useState<Point[]>(() => genInitialSeries(18, 60, 50));

  const [showGraphFor, setShowGraphFor] = useState<string | null>(null);

  // Ping / uptime
  const PING_URL = "/api/health"; // <-- change if your health endpoint differs
  const [ping, setPing] = useState<number>(55);
  const [uptimeStatus, setUptimeStatus] = useState<boolean>(false);

  // Animated counters
  const monthCount = useAnimatedCounter(12400);
  const weekCount = useAnimatedCounter(3560);
  const todayCount = useAnimatedCounter(480);

  // API requests animated counter
  const [apiRequestsTarget, setApiRequestsTarget] = useState<number>(391);
  const apiCount = useAnimatedCounter(apiRequestsTarget);

  /* ----------------- Polling: ping & uptime (real fetch with timeout) ----------------- */
  useEffect(() => {
    let mounted = true;

    const doPing = async () => {
      const ac = new AbortController();
      const timeoutId = setTimeout(() => ac.abort(), 4000); // 4s timeout
      const start = performance.now();

      try {
        const resp = await fetch(`${PING_URL}?_t=${Date.now()}`, {
          method: "GET",
          signal: ac.signal,
          cache: "no-store",
        });

        const ms = Math.max(1, Math.round(performance.now() - start));
        if (!mounted) return;

        // determine online status: prefer resp.ok, but also accept JSON {status:'ok'} or {success:true}
        let online = resp.ok;
        try {
          const txt = await resp.text();
          try {
            const parsed = JSON.parse(txt);
            if (parsed && (parsed.status === "ok" || parsed.success === true)) {
              online = true;
            }
          } catch {
            // not JSON — keep online = resp.ok
          }
        } catch {
          // ignore
        }

        setPing(ms);
        setPingHistory((prev) => {
          const next = prev.slice(-19);
          next.push({ x: prev.length ? prev[prev.length - 1].x + 1 : 0, y: ms });
          return next;
        });
        setUptimeStatus(online);
      } catch (err) {
        // fetch failed or aborted
        const ms = Math.max(1, Math.round(performance.now() - start));
        if (!mounted) return;
        setPing(ms);
        setPingHistory((prev) => {
          const next = prev.slice(-19);
          next.push({ x: prev.length ? prev[prev.length - 1].x + 1 : 0, y: ms });
          return next;
        });
        setUptimeStatus(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // initial ping and interval
    doPing();
    const id = setInterval(doPing, 5000); // every 5s as requested
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [PING_URL]);

  /* ----------------- API request / visual data animation ----------------- */
  useEffect(() => {
    const id = setInterval(() => {
      setApiRequestsTarget((t) => t + Math.round(Math.random() * 3));
      setApiSeries((prev) => {
        const next = prev.slice(-19);
        next.push({
          x: prev.length ? prev[prev.length - 1].x + 1 : 0,
          y: Math.max(300, Math.round(350 + Math.random() * 120)),
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setMonthSeries((p) => {
        const q = p.slice(-19);
        q.push({ x: p.length ? p[p.length - 1].x + 1 : 0, y: Math.round(1000 + Math.random() * 1000) });
        return q;
      });
      setWeekSeries((p) => {
        const q = p.slice(-13);
        q.push({ x: p.length ? p[p.length - 1].x + 1 : 0, y: Math.round(200 + Math.random() * 300) });
        return q;
      });
      setTodaySeries((p) => {
        const q = p.slice(-11);
        q.push({ x: p.length ? p[p.length - 1].x + 1 : 0, y: Math.round(30 + Math.random() * 90) });
        return q;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* ----------------- Animations ----------------- */
  const floatVariants = {
    rest: { y: 0 },
    float: { y: -8 },
  };

  /* ----------------- Filter tools by search ----------------- */
  const filteredTools = useMemo(() => {
    const all = [...tools, ...toolsRow2];
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((t) => t.title.toLowerCase().includes(q));
  }, [tools, toolsRow2, query]);

  /* ----------------- Handlers ----------------- */
  function openToolRoute(route: string) {
    // redirect inside the app (no popup)
    router.push(route);
  }

  /* ----------------- Render ----------------- */
  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-[#0b0512] via-[#14102a] to-[#071021] text-white">
      {/* Header (stacked vertically for Android-friendly layout) */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight neon-glow">TEVONA</h1>
          <div className="mt-2">
            <motion.div
              key="subtitle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-medium text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300"
            >
              <AnimatedSubtitle />
            </motion.div>
            <div className="text-sm text-gray-400 mt-1">• Your choice of tools & APIs</div>
          </div>
        </div>

        {/* Search (below subtitle) */}
        <div className="w-full max-w-xl">
          <label className="text-xs text-gray-300">Search tools</label>
          <div className="mt-2 flex items-center gap-2 bg-white/6 rounded-xl p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search (YouTube, Ephoto360, PDF...)"
              className="flex-1 bg-transparent outline-none px-2 py-2 text-white placeholder:text-gray-400"
            />
            <button
              onClick={() => setQuery("")}
              className="px-3 py-1 rounded-lg bg-white/8 hover:bg-white/12 transition"
              title="Clear"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Tools grid & right column */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools (left: two rows combined via filteredTools) */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTools.map((t, i) => (
            <motion.button
              key={t.id}
              initial="rest"
              whileHover="float"
              animate="rest"
              variants={floatVariants}
              transition={{ y: { yoyo: Infinity, duration: 2 + i * 0.06 } }}
              className="relative p-4 bg-gradient-to-tr from-white/5 to-white/3 rounded-2xl border border-white/8 hover:shadow-xl backdrop-blur-sm"
              title={t.title}
              onClick={() => openToolRoute(t.route)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/6 rounded-lg neon-button">{t.icon}</div>
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-gray-400">Open</div>
                </div>
              </div>
              <div className="absolute right-3 top-3 text-xs text-gray-400">API</div>
            </motion.button>
          ))}

          {/* All Tools button */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-4 flex items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/4"
          >
            <button
              onClick={() => {
                setQuery("");
                router.push("/tools");
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 text-black font-semibold"
            >
              All Tools
            </button>
          </motion.div>
        </div>

        {/* Right column: community + quick stats */}
        <aside className="space-y-4">
          {/* Community */}
          <div className="p-4 rounded-2xl bg-white/6 border border-white/8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Community</div>
                <div className="font-bold">Join our WhatsApp Channel & Group</div>
              </div>
              <Users className="w-8 h-8 text-green-300" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <a
                href="https://whatsapp.com/channel/0029VbB8uytKrWQs4MGIQH17"
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30"
              >
                Join Channel
              </a>
              <a
                href="https://chat.whatsapp.com/GVdaxRDLVUcI1c6nDHGNtH?mode=ac_t"
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30"
              >
                Join Group
              </a>
            </div>
          </div>

          {/* API Requests small card */}
          <div className="p-4 rounded-2xl bg-white/6 border border-white/8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-gray-400">API Requests</div>
                <div className="font-bold text-lg">{apiCount}+</div>
                <div className="text-xs text-gray-400">Total requests · animated</div>
              </div>
              <Zap className="w-8 h-8 text-yellow-300" />
            </div>

            <div className="mt-3">
              <button
                onClick={() => setShowGraphFor((s) => (s === "api" ? null : "api"))}
                className="text-xs px-3 py-1 rounded-lg bg-white/8"
              >
                {showGraphFor === "api" ? "Hide graph" : "See graph"}
              </button>
            </div>

            {showGraphFor === "api" && (
              <div className="mt-3 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiSeries}>
                    <defs>
                      <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <Area dataKey="y" stroke="#f97316" fill="url(#colorApi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Uptime + Ping */}
          <div className={`p-4 rounded-2xl border ${uptimeStatus ? "border-green-400" : "border-red-500"} bg-white/4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-300">Web Uptime</div>
                <div className="font-bold">{uptimeStatus ? "Online" : "Offline"}</div>
                <div className="text-xs text-gray-400">Ping: {ping} ms</div>
              </div>
              <Wifi className={`w-8 h-8 ${uptimeStatus ? "text-green-300" : "text-red-400"}`} />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowGraphFor((s) => (s === "ping" ? null : "ping"))}
                className="text-xs px-3 py-1 rounded-lg bg-white/8"
              >
                {showGraphFor === "ping" ? "Hide graph" : "See graph"}
              </button>

              <button
                onClick={() => {
                  // manual ping now (trigger by fetching)
                  (async () => {
                    try {
                      await fetch(`${PING_URL}?_t=${Date.now()}`, { cache: "no-store" });
                    } catch {
                      // ignore
                    }
                  })();
                }}
                className="text-xs px-3 py-1 rounded-lg bg-white/8"
              >
                Ping now
              </button>
            </div>

            {showGraphFor === "ping" && (
              <div className="mt-3 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pingHistory}>
                    <Line dataKey="y" stroke={uptimeStatus ? "#34d399" : "#fb7185"} dot={false} strokeWidth={2} />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* Stats cards */}
      <section className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="This Month"
          subtitle="Visits"
          value={monthCount}
          onToggle={() => setShowGraphFor((s) => (s === "month" ? null : "month"))}
          show={showGraphFor === "month"}
          series={monthSeries}
          color="#7c3aed"
        />
        <StatCard
          title="This Week"
          subtitle="Visits"
          value={weekCount}
          onToggle={() => setShowGraphFor((s) => (s === "week" ? null : "week"))}
          show={showGraphFor === "week"}
          series={weekSeries}
          color="#06b6d4"
        />
        <StatCard
          title="Today"
          subtitle="Visits"
          value={todayCount}
          onToggle={() => setShowGraphFor((s) => (s === "today" ? null : "today"))}
          show={showGraphFor === "today"}
          series={todaySeries}
          color="#f97316"
        />
        <StatCard
          title="API Requests"
          subtitle="Live"
          value={apiCount}
          onToggle={() => setShowGraphFor((s) => (s === "api2" ? null : "api2"))}
          show={showGraphFor === "api2"}
          series={apiSeries}
          color="#f43f5e"
        />
      </section>

      {/* Footer / HOW TO */}
      <section className="max-w-6xl mx-auto mt-8 p-6 rounded-2xl bg-gradient-to-r from-white/2 to-white/3 border border-white/6">
        <h3 className="font-bold text-xl mb-2">How to use</h3>
        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
          <li>Search a tool in the search box or click one of the tool buttons.</li>
          <li>Click a tool to navigate to its dedicated page (no popups).</li>
          <li>The ping card checks <code>{PING_URL}</code> every 5 seconds to measure latency; it sets Online only if the endpoint responds OK (or returns JSON with <code>status: "ok"</code>).</li>
          <li>Click "See graph" on any stat card to view the live animated graph.</li>
        </ol>
      </section>
    </main>
  );
}

/* ----------------- Helper components ----------------- */

function AnimatedSubtitle(): JSX.Element {
  const phrases = ["APIs on fire", "Stay connected", "Create without limits", "Build fast, ship faster"];
  const [i, setI] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % phrases.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="font-medium text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300"
    >
      {phrases[i]}
    </motion.div>
  );
}

function StatCard({ title, subtitle, value, onToggle, show, series, color }: StatCardProps): JSX.Element {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400">{subtitle}</div>
          <div className="font-bold text-lg">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold">{value}</div>
          <div className="text-xs text-gray-400">animated</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={onToggle} className="px-3 py-1 rounded-lg bg-white/8 text-xs">
          {show ? "Hide graph" : "See graph"}
        </button>
        <div className="text-xs text-gray-400">spark</div>
      </div>

      {show && series && (
        <div className="mt-3 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <Line type="monotone" dataKey="y" stroke={color} dot={false} strokeWidth={2} />
              <XAxis dataKey="x" hide />
              <YAxis hide />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
