import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderContextProps {
  theme: Theme;
  setTheme: (theme: Theme, buttonPosition?: { x: number; y: number }) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeProviderContext = createContext<ThemeProviderContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "loan-assistant-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let resolved: "dark" | "light" = "light";

    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      resolved = theme;
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);
  }, [theme]);

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        const resolved = e.matches ? "dark" : "light";
        root.classList.add(resolved);
        setResolvedTheme(resolved);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme, buttonPosition?: { x: number; y: number }) => {
      const applyTheme = () => {
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      };

      // Detect if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth < 768;

      // Check if View Transitions API is supported AND not mobile
      const useViewTransitions = buttonPosition 
        && typeof document !== 'undefined' 
        && 'startViewTransition' in document
        && !isMobile;

      if (useViewTransitions) {
        const { x, y } = buttonPosition;
        
        // Set CSS custom properties for the animation
        const xPercent = (x / window.innerWidth) * 100;
        const yPercent = (y / window.innerHeight) * 100;
        
        document.documentElement.style.setProperty('--x', `${xPercent}%`);
        document.documentElement.style.setProperty('--y', `${yPercent}%`);

        // @ts-ignore - View Transitions API
        const transition = document.startViewTransition(() => {
          applyTheme();
        });

        // Ensure smooth transition on all devices
        transition.ready.catch(() => {
          applyTheme();
        });
      } else if (buttonPosition) {
        // Fallback animation for mobile browsers - Vertical stack
        const root = document.documentElement;
        
        // Determine target theme (handling 'system' preference)
        const isTargetDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // Green (#00ff77) for Dark Mode, Blue (#180880) for Light Mode
        const transitionColor = isTargetDark ? '#00ff77' : '#180880';
        
        // Create additional bars (bars 3 and 4) since CSS can only do ::before and ::after
        const bar3 = document.createElement('div');
        const bar4 = document.createElement('div');
        
        const baseBarStyle = `
          position: fixed;
          top: 0;
          width: 26%;
          height: 100%;
          z-index: 999999;
          pointer-events: none;
          background: ${transitionColor};
          animation: stack-slide 0.7s ease-in-out forwards;
        `;
        
        bar3.style.cssText = `${baseBarStyle} left: 50%; animation-delay: 0.1s;`;
        bar4.style.cssText = `${baseBarStyle} left: 75%; animation-delay: 0.15s;`;
        
        document.body.appendChild(bar3);
        document.body.appendChild(bar4);
        
        // Set the background colors for CSS bars (::before and ::after)
        root.style.setProperty('--transition-bg-1', transitionColor);
        root.style.setProperty('--transition-bg-2', transitionColor);
        
        // Add transition class for bars 1 and 2 (::before and ::after)
        root.classList.add('theme-transitioning');
        
        // Apply theme at the midpoint of animation (when bars are covering screen)
        setTimeout(() => {
          applyTheme();
        }, 250);
        
        // Remove everything after animation completes
        setTimeout(() => {
          root.classList.remove('theme-transitioning');
          root.style.removeProperty('--transition-bg-1');
          root.style.removeProperty('--transition-bg-2');
          bar3.remove();
          bar4.remove();
        }, 700);
      } else {
        // No animation
        applyTheme();
      }
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
