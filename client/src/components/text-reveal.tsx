import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface TextRevealProps {
  text: string;
  className?: string;
}

export const TextReveal = ({ text, className }: TextRevealProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 py-24 md:py-32", className)}>
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <p className="flex flex-wrap justify-center text-center text-2xl font-bold md:text-4xl lg:text-5xl leading-tight">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + (1 / words.length);
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

interface WordProps {
  children: string;
  progress: any;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  
  return (
    <motion.span 
      style={{ opacity }} 
      className="mx-1 lg:mx-1.5 text-foreground"
    >
      {children}
    </motion.span>
  );
};
