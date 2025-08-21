export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-card shadow-md">
      <h1 className="text-xl font-bold text-primary">Tenova</h1>
      <ul className="flex gap-6 text-text">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  );
}
