import * as React from "react";
import { cn } from "@/lib/utils"; // if you don’t have cn util, I can provide a helper

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={cn("p-6", className)} {...props} />
  );
}

export { Card, CardContent };
