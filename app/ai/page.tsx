// app/ai/page.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    title: "💬 Chat AI",
    description: "Smart conversational assistants",
    models: [
      { name: "Mistral 7B", path: "/ai/mistral", color: "from-blue-500 to-cyan-500" },
      { name: "GPT-4o", path: "/ai/gpt4o", color: "from-purple-500 to-pink-500" },
      { name: "Bible AI", path: "/ai/bibleai", color: "from-amber-500 to-yellow-400" },
    ],
  },
  {
    title: "🎨 Image AI",
    description: "Generate stunning art & visuals",
    models: [
      { name: "Stable Diffusion", path: "/ai/stablediffusion", color: "from-green-500 to-emerald-400" },
      { name: "Flux", path: "/ai/flux", color: "from-pink-500 to-red-500" },
    ],
  },
  {
    title: "🔍 Research & Creative",
    description: "Knowledge & idea generation",
    models: [
      { name: "Perplexity AI", path: "/ai/perplexity", color: "from-indigo-500 to-sky-400" },
      { name: "PowerBrain", path: "/ai/powerbrain", color: "from-fuchsia-500 to-violet-500" },
    ],
  },
]

export default function AILandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        🚀 AI Control Hub
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12 text-gray-300"
      >
        Choose your AI assistant – chat, create, or explore knowledge.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, idx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
          >
            <Card className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:shadow-xl hover:shadow-cyan-500/20 transition">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
                <p className="text-gray-400 mb-4">{category.description}</p>

                <div className="space-y-3">
                  {category.models.map((model) => (
                    <Link key={model.name} href={model.path}>
                      <Button
                        className={`w-full py-2 rounded-xl bg-gradient-to-r ${model.color} text-white font-medium shadow-lg hover:scale-105 transition`}
                      >
                        {model.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
