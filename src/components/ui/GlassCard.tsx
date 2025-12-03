import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "container" | "block" | "card";
  onClick?: () => void;
}

export function GlassCard({ 
  children, 
  className, 
  variant = "card",
  onClick 
}: GlassCardProps) {
  const variants = {
    container: "glass-container",
    block: "glass-block",
    card: "glass-card p-4",
  };

  return (
    <div 
      className={cn(variants[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
