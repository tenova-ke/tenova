import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-brand-card p-4 shadow-soft border border-brand-primary/20",
        className
      )}
    >
      {children}
    </div>
  );
}
