import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  hoverScale?: boolean;
  borderGlow?: boolean;
}

export function SpotlightCard({ 
  children, 
  className, 
  spotlightColor = "rgba(255, 255, 255, 0.15)",
  hoverScale = false,
  borderGlow = true,
  ...props 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverScale ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
        borderGlow && isHovered && "border-primary/30 shadow-lg shadow-primary/5",
        !isHovered && "border-border",
        className
      )}
      {...props}
    >
      {/* Main spotlight effect - follows cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      
      {/* Secondary ambient glow effect */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, ${spotlightColor.replace('0.15', '0.05')}, transparent 60%)`,
        }}
      />
      
      {/* Border highlight effect - Windows Settings style */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: opacity * 0.8,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, transparent 50%, ${spotlightColor.replace('0.15', '0.03')} 100%)`,
        }}
      />
      
      {/* Top edge highlight */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          opacity,
          background: `linear-gradient(90deg, transparent, ${spotlightColor.replace('0.15', '0.3')} ${Math.max(0, Math.min(100, (position.x / (divRef.current?.offsetWidth || 1)) * 100))}%, transparent)`,
        }}
      />
      
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}
