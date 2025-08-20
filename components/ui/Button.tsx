import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export function Button({
  className,
  loading,
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 shadow-soft";

  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-accent focus:ring-2 focus:ring-brand-highlight",
    secondary:
      "bg-brand-card text-brand-text hover:bg-brand-accent/30 focus:ring-2 focus:ring-brand-accent",
    outline:
      "border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={loading}
      className={cn(base, variants[variant], className, "px-4 py-2")}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
