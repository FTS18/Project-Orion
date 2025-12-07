/**
 * Configuration Index
 * Central export point for all configuration modules
 */

// Agent Configuration
export * from "./agents.config";

// Loan Configuration
export * from "./loan.config";

// Workflow Configuration
export * from "./workflow.config";

// Theme Configuration
export { THEME_CONFIG, generateCSSVariables, getAnimationDuration } from "./theme.config";
export type { ThemeColors, ThemeConfig } from "./theme.config";

// Feature Flags
export * from "./features.config";

// AI Prompts
export * from "./prompts.config";

