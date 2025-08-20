// components/Button.tsx
import { cn } from "@/lib/utils";

export default function Button({ children, variant = "primary", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "px-4 py-2 rounded-2xl font-semibold transition",
        variant === "primary" && "bg-brand-primary text-white hover:bg-blue-600",
        variant === "secondary" && "bg-brand-card text-brand-text hover:bg-gray-700"
      )}
    >
      {children}
    </button>
  );
