import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all",
        variant === "default" &&
          "bg-blue-600 text-white hover:bg-blue-700",
        variant === "outline" &&
          "border border-gray-400 text-gray-800 hover:bg-gray-100",
        variant === "ghost" &&
          "text-gray-600 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
}
