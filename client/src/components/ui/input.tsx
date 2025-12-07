import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    return (
      <div className="relative w-full group">
        {/* Glow effect behind input */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-sm pointer-events-none"
            />
          )}
        </AnimatePresence>
        
        <input
          type={type}
          className={cn(
            "relative flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
            isFocused && "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.15)]",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-md">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/80 to-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ originX: 0.5 }}
          />
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
