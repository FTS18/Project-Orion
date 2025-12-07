import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
}

const colors = [
  "#10b981", // emerald
  "#22c55e", // green
  "#84cc16", // lime
  "#eab308", // yellow
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#3b82f6", // blue
];

export function Confetti({ active, duration = 3000, particleCount = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => setPieces([]), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}vw`,
              y: "-10vh",
              rotate: 0,
              scale: piece.scale,
            }}
            animate={{
              y: "110vh",
              rotate: piece.rotation + 720,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: piece.delay,
              ease: "linear",
            }}
            className="absolute w-3 h-3"
            style={{
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function SuccessConfetti({ show }: { show: boolean }) {
  return <Confetti active={show} particleCount={100} duration={4000} />;
}
