// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";

/**
 * Dashboard page (self-contained).
 *
 * - Uses `public/view/*` images (so keep your images in public/view/)
 * - Streams audio from GiftedTech endpoints (built on the fly)
 * - Simple sidebar toggle, modal on first visit, carousel, small cards
 */

const IMAGE_FILES = [
  "/view/Gradient_Text_WANGA.png (1).jpg",
  "/view/Logo_Maker_WANGA.png (1).jpg",
  "/view/Neon_Glitch_WANGA.png (2).jpg",
  "/view/Pixel_Glitch_WANGA.png (1).jpg",
  "/view/Pixel_Glitch_WANGA.png.jpg",
  "/view/Text_Effect_WANGA.png.jpg",
  "/view/image-19.jpg",
  "/view/image-7.jpg",
  "/view/image.jpg",
].filter(Boolean);

const SAMPLE_VIDEO_IDS = [
  "60ItHLz5WEA", // example (Sia - Cheap Thrills? — replace as you like)
  "qF-JLqKtr2Q",
  "3JZ4pnNtyxQ",
];

function buildGiftedAudioUrl(videoId: string) {
  const videoUrl = encodeURIComponent(`https://youtu.be/${videoId}`);
  return `https://api.giftedtech.web.id/api/download/ytaudio?apikey=gifted&format=128kbps&url=${videoUrl}`;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // show popup once per user session (use sessionStorage)
  useEffect(() => {
    const seen = sessionStorage.getItem("tevona_popup_shown");
    if (!seen) {
      setShowPopup(true);
      sessionStorage.setItem("tevona_popup_shown", "1");
    }
  }, []);

  // carousel auto-advance
  useEffect(() => {
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % IMAGE_FILES.length);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  const startRandomInstrumental = () => {
    // pick a random ID and stream it
    const id = SAMPLE_VIDEO_IDS[Math.floor(Math.random() * SAMPLE_VIDEO_IDS.length)];
    playAudio(id);
    setShowPopup(false);
  };

  const playAudio = (videoId: string) => {
    const src = buildGiftedAudioUrl(videoId);
    setPlayingId(videoId);
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.play().catch(() => {
        // autoplay might be blocked; user can press play
      });
    }
  };

  const downloadAudio = (videoId: string) => {
    const src = buildGiftedAudioUrl(videoId);
    // open download in new tab
    window.open(src, "_blank");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#071029,#02101b)", color: "#eaf6ff" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 72,
        transition: "width .25s",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        padding: 12,
        boxSizing: "border-box",
        borderRight: "1px solid rgba(255,255,255,0.03)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "linear-gradient(135deg,#06b6d4,#7c3aed)",
            display: "grid", placeItems: "center", color: "#021017", fontWeight: 800
          }}>T</div>
          {sidebarOpen && <div>
            <div style={{ fontWeight: 700 }}>Tevona</div>
            <small style={{ color: "#9fb4d6" }}>v2</small>
          </div>}
          <button
            aria-label="toggle"
            onClick={() => setSidebarOpen(s => !s)}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#9fb4d6", cursor: "pointer" }}
          >
            ☰
          </button>
        </div>

        <nav style={{ marginTop: 18 }}>
          {[
            "Apps", "Music", "Movies", "News", "Images", "AI", "Mixes", "Encrypt/Decrypt", "Tools"
          ].map((n) => (
            <div key={n} style={{
              padding: "10px 8px",
              borderRadius: 10,
              marginTop: 8,
              color: "#dbeefe",
              fontSize: 14,
              background: sidebarOpen ? "transparent" : "transparent"
            }}>
              {sidebarOpen ? n : n[0]}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 20 }}>
        {/* Header / small profile + motto */}
        <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.06)"
          }}>
            <img src="/view/image.jpg" alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Hi — I'm Tevona 👋</div>
            <div style={{ color: "#98bcd9", fontSize: 13 }}>Your friendly music assistant. I help you find and stream songs fast.</div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button onClick={() => window.open("https://wa.me/254758476795", "_blank")}
              style={{
                background: "linear-gradient(90deg,#10b981,#06b6d4)",
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                color: "#021017",
                fontWeight: 700
              }}>
              Contact
            </button>
            <button style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "8px 12px",
              color: "#9fb4d6",
              borderRadius: 10
            }}>
              Server Info
            </button>
          </div>
        </header>

        {/* Big hero / CTA */}
        <section style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          padding: 18,
          borderRadius: 14,
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 18,
          boxShadow: "0 6px 24px rgba(3,7,18,0.6)"
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Tevona — Quick downloads · streams · tools</h2>
            <p style={{ margin: "8px 0 0 0", color: "#9fb4d6" }}>
              Welcome to Tevona v2 — quick downloads, streaming, tools and little AI helpers.
              Use the buttons to explore.
            </p>
            <div style={{ marginTop: 12 }}>
              <a href="#cards" style={{
                display: "inline-block", padding: "10px 20px", borderRadius: 999,
                background: "linear-gradient(90deg,#7c3aed,#06b6d4)", color: "#fff", fontWeight: 700, textDecoration: "none"
              }}>
                Visit Tools & Dashboard
              </a>
            </div>
          </div>

          <div style={{ width: 240 }}>
            {/* mini carousel preview */}
            <div style={{ borderRadius: 12, overflow: "hidden", height: 120 }}>
              <img src={IMAGE_FILES[carouselIndex % IMAGE_FILES.length] || IMAGE_FILES[0]} alt="slide" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </section>

        {/* small cards area */}
        <section id="cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 18 }}>
          {[
            { title: "Quick download songs", desc: "Download mp3 fast" },
            { title: "Stream songs", desc: "Play audio inline" },
            { title: "Quick download videos", desc: "MP4 downloads" },
            { title: "APK downloads", desc: "Get APK files" },
            { title: "AI Tools", desc: "Chatbot, image gen, logo maker" },
            { title: "Encrypt / Decrypt", desc: "Small privacy tools" },
          ].map((c) => (
            <div key={c.title} style={{
              padding: 12,
              borderRadius: 12,
              background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.03)"
            }}>
              <div style={{ fontWeight: 800 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "#9fb4d6", marginTop: 6 }}>{c.desc}</div>
            </div>
          ))}
        </section>

        {/* image gallery carousel (big) */}
        <section style={{ marginBottom: 22 }}>
          <h3 style={{ marginBottom: 10 }}>Gallery</h3>
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", height: 260 }}>
            <img
              src={IMAGE_FILES[carouselIndex % IMAGE_FILES.length] || IMAGE_FILES[0]}
              alt="gallery"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .4s" }}
            />
            <div style={{ position: "absolute", left: 12, bottom: 12, color: "#fff", background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: 8 }}>
              Tevona Gallery
            </div>
          </div>
        </section>

        {/* audio player area */}
        <section style={{ marginBottom: 30 }}>
          <h3 style={{ marginBottom: 12 }}>Play / Stream (demo)</h3>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {SAMPLE_VIDEO_IDS.map((id) => (
              <div key={id} style={{
                flex: "1 0 220px",
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,0.02)"
              }}>
                <div style={{ fontWeight: 700 }}>Song {id}</div>
                <div style={{ color: "#9fb4d6", marginTop: 6, marginBottom: 8 }}>demo streaming via Gifted API</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => playAudio(id)} style={{ padding: "8px 10px", borderRadius: 8, background: "#06b6d4", border: "none", color: "#012" }}>▶ Stream</button>
                  <button onClick={() => downloadAudio(id)} style={{ padding: "8px 10px", borderRadius: 8, background: "#7c3aed", border: "none", color: "#fff" }}>⬇ Download</button>
                </div>
              </div>
            ))}
          </div>

          {/* actual audio element */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, color: "#9fb4d6", marginBottom: 6 }}>{playingId ? `Now Playing: ${playingId}` : "Not playing"}</div>
            <audio ref={audioRef} controls style={{ width: "100%", borderRadius: 10, background: "#021" }} />
          </div>
        </section>

        <footer style={{ marginTop: 40, color: "#9fb4d6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <strong>Tevona</strong> • Quick downloads & playful tools — powered by gifted tech & tracker inspirations.
            </div>
            <div style={{ fontSize: 13 }}>
              <small>Share ideas — We're open</small>
            </div>
          </div>
        </footer>
      </main>

      {/* Pop-up modal (first-visit) */}
      {showPopup && (
        <div style={{
          position: "fixed", inset: 0, display: "grid", placeItems: "center",
          background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.6))", zIndex: 80
        }}>
          <div style={{ background: "#021827", padding: 18, borderRadius: 12, width: 420 }}>
            <h3 style={{ margin: 0 }}>Welcome to Tevona</h3>
            <p style={{ color: "#9fb4d6" }}>Start playing random instrumental tracks? (Demo)</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={startRandomInstrumental} style={{ flex: 1, padding: 10, borderRadius: 10, background: "#06b6d4", border: "none" }}>Start</button>
              <button onClick={() => setShowPopup(false)} style={{ flex: 1, padding: 10, borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#9fb4d6" }}>Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
