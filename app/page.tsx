import Image from "next/image";
import Slideshow from "@/components/Slideshow";

export default function Home() {
  const features = [
    { title: "Quick Song Downloads", desc: "Download MP3s in seconds." },
    { title: "Quick Video Downloads", desc: "MP4s in HD instantly." },
    { title: "APK Downloader", desc: "Grab Android apps with ease." },
    { title: "Stream Music", desc: "Play music directly online." },
    { title: "Stream Videos", desc: "Watch videos without ads." },
    { title: "Text → PDF", desc: "Convert notes into clean PDFs." },
    { title: "Encrypt / Decrypt", desc: "Protect & unlock your files." },
    { title: "Image Generator", desc: "AI-powered artwork instantly." },
    { title: "Logo Creator", desc: "Generate custom brand logos." },
    { title: "AI Chatbot", desc: "Talk with AI assistants." },
    { title: "Ephoto360", desc: "Fun image effects & text art." },
    { title: "Code Playground", desc: "Run & share code online." },
    { title: "Fancy Texts", desc: "Stylish fonts for socials." },
    { title: "More Tools...", desc: "Expanding every update 🚀" },
  ];

  return (
    <main className="flex flex-col items-center gap-10 px-6 py-12">
      {/* Profile */}
      <div className="flex flex-col items-center">
        <Image
          src="profile/IMG-20250821-WA0021.jpg"
          alt="profile"
          width={100}
          height={100}
          className="rounded-full shadow-md"
        />
        <h1 className="text-2xl font-bold mt-3">Tevona v2</h1>
        <p className="text-gray-400">Powered by Wanga • Inspired by Tracker & Gifted Tech</p>
      </div>

      {/* Button */}
      <a
        href="/dashboard"
        className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-lg font-semibold px-10 py-3 rounded-full shadow-lg hover:scale-105 transition"
      >
        Visit Dashboard
      </a>

      {/* Slideshow */}
      <Slideshow />

      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 max-w-5xl w-full">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg hover:scale-105 transition"
          >
            <h3 className="font-semibold text-lg text-white">{f.title}</h3>
            <p className="text-gray-300 text-sm mt-2">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Thanks Section */}
      <div className="text-center max-w-3xl mt-10">
        <h2 className="text-xl font-bold text-white">Big Thanks 🙏</h2>
        <p className="text-gray-300 mt-2">
          Special thanks to Gifted Tech, Creepy, and Tracker Engines for inspiring this journey.
          Tevona is open for your ideas — let’s build together!
        </p>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/254758476795"
        target="_blank"
        className="mt-6 bg-green-500 text-white px-8 py-3 rounded-full shadow-lg hover:bg-green-600 transition"
      >
        Chat with Wanga on WhatsApp
      </a>
    </main>
  );
  }
