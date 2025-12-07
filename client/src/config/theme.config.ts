/**
 * Theme Configuration
 * Controls branding, colors, fonts, and visual styling
 * Modify this file to customize the app appearance without changing component code
 */

export interface ThemeColors {
  // Primary brand color
  primary: string;
  primaryForeground: string;
  // Secondary color
  secondary: string;
  secondaryForeground: string;
  // Accent color
  accent: string;
  accentForeground: string;
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  // App branding
  appName: string;
  appTagline: string;
  appDescription: string;
  // Logo configuration
  logo: {
    text: string;
    showIcon: boolean;
    iconName: string;
  };
  // Color themes
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  // Typography
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  // Border radius variants
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  // Animation preferences
  animations: {
    enabled: boolean;
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: string;
  };
  // Feature appearance
  features: {
    showParticlesBackground: boolean;
    showConfettiOnApproval: boolean;
    enableGlassmorphism: boolean;
    enableGradients: boolean;
    enableAnimatedBackgrounds: boolean;
  };
}

export const THEME_CONFIG: ThemeConfig = {
  // Branding
  appName: "Project Orion",
  appTagline: "AI-Powered Loan Processing",
  appDescription: "Experience the future of loan processing with our intelligent multi-agent system",

  // Logo
  logo: {
    text: "Orion",
    showIcon: true,
    iconName: "Orbit",
  },

  // Colors
  colors: {
    light: {
      primary: "#16a34a",           // Green 600
      primaryForeground: "#ffffff",
      secondary: "#f1f5f9",         // Slate 100
      secondaryForeground: "#0f172a",
      accent: "#22c55e",            // Green 500
      accentForeground: "#ffffff",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    dark: {
      primary: "#22c55e",           // Green 500
      primaryForeground: "#ffffff",
      secondary: "#1e293b",         // Slate 800
      secondaryForeground: "#f1f5f9",
      accent: "#4ade80",            // Green 400
      accentForeground: "#0f172a",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#60a5fa",
    },
  },

  // Typography
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  // Border radius
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },

  // Animations
  animations: {
    enabled: true,
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Feature appearance
  features: {
    showParticlesBackground: true,
    showConfettiOnApproval: true,
    enableGlassmorphism: true,
    enableGradients: true,
    enableAnimatedBackgrounds: true,
  },
};

// CSS custom property generator
export const generateCSSVariables = (theme: "light" | "dark"): Record<string, string> => {
  const colors = THEME_CONFIG.colors[theme];
  return {
    "--color-primary": colors.primary,
    "--color-primary-foreground": colors.primaryForeground,
    "--color-secondary": colors.secondary,
    "--color-secondary-foreground": colors.secondaryForeground,
    "--color-accent": colors.accent,
    "--color-accent-foreground": colors.accentForeground,
    "--color-success": colors.success,
    "--color-warning": colors.warning,
    "--color-error": colors.error,
    "--color-info": colors.info,
  };
};

// Get animation duration class
export const getAnimationDuration = (speed: "fast" | "normal" | "slow"): string => {
  if (!THEME_CONFIG.animations.enabled) return "duration-0";
  const duration = THEME_CONFIG.animations.duration[speed];
  return `duration-[${duration}ms]`;
};

// Check if feature is enabled
export const isFeatureEnabled = (feature: keyof ThemeConfig["features"]): boolean => {
  return THEME_CONFIG.features[feature];
};
