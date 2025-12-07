import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function GlobalTapEffect() {
  const [ripples, setRipples] = useState<Ripple[]>();

  useEffect(() => {
    let rippleId = 0;

    const handleClick = (e: MouseEvent) => {
      const newRipple: Ripple = {
        id: rippleId++,
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...(prev || []), newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => (prev || []).filter((r) => r.id !== newRipple.id));
      }, 800);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples?.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-primary/30 bg-primary/10"
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 1,
            }}
            animate={{
              width: 100,
              height: 100,
              x: ripple.x - 50,
              y: ripple.y - 50,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
