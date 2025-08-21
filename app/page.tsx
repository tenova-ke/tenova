// app/page.tsx
// 🔹 Landing page content

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <section className="grid gap-6 text-center py-12">
      <h1 className="text-4xl font-bold text-brand-highlight">
        Welcome to Tevona 🚀
      </h1>
      <p className="max-w-xl mx-auto text-gray-300">
        Creative tools, code playgrounds, downloads, and a vibrant community —
        all in one hub.
      </p>

      <div className="flex justify-center gap-4">
        <Button variant="primary">Explore Tools</Button>
        <Button variant="outline">Join Community</Button>
      </div>

      <Card className="mt-10">
        <h2 className="text-xl font-semibold mb-2">🔥 Hot Feature</h2>
        <p>
          Try our new downloader API integration — fast, smooth, and ready for
          action.
        </p>
      </Card>
    </section>
  );
}
