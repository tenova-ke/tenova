// components/Footer.tsx
// 🔹 Footer for branding + quick links

export function Footer() {
  return (
    <footer className="bg-brand-card/40 border-t border-brand-accent/20 py-6 mt-10">
      <div className="container mx-auto text-center text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} Tevona. Built with ❤️ for creativity &
          community.
        </p>
      </div>
    </footer>
  );
}
