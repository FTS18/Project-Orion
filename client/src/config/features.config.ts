/**
 * Feature Flags Configuration
 * Controls feature availability across the application
 * Modify this file to enable/disable features without code changes
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  // Optional: Enable for specific environments
  environments?: ("development" | "staging" | "production")[];
  // Optional: Enable for specific user roles
  roles?: string[];
  // Optional: A/B test percentage (0-100)
  abTestPercentage?: number;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Agentic Mode Features
  agenticMode: {
    id: "agenticMode",
    name: "Agentic AI Mode",
    description: "Enable the multi-agent AI loan processing mode",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  chatTypingAnimation: {
    id: "chatTypingAnimation",
    name: "Chat Typing Animation",
    description: "Show character-by-character typing animation for AI responses",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  particlesBackground: {
    id: "particlesBackground",
    name: "Particles Background",
    description: "Show animated particles in the background",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  confettiOnApproval: {
    id: "confettiOnApproval",
    name: "Confetti on Approval",
    description: "Show confetti animation when loan is approved",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  
  // Loan Features
  multipleLoanProducts: {
    id: "multipleLoanProducts",
    name: "Multiple Loan Products",
    description: "Allow selection from multiple loan product types",
    enabled: false,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  preApprovalCheck: {
    id: "preApprovalCheck",
    name: "Pre-Approval Check",
    description: "Show pre-approval limit before full application",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  documentUpload: {
    id: "documentUpload",
    name: "Document Upload",
    description: "Allow customers to upload documents for verification",
    enabled: false,
    environments: ["development", "staging"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  
  // UI Features
  darkMode: {
    id: "darkMode",
    name: "Dark Mode",
    description: "Enable dark mode theme toggle",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  advancedAnimations: {
    id: "advancedAnimations",
    name: "Advanced Animations",
    description: "Enable advanced micro-interactions and animations",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  glassmorphism: {
    id: "glassmorphism",
    name: "Glassmorphism Effects",
    description: "Enable glass-like blur effects on cards",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  
  // Testing Features
  abTesting: {
    id: "abTesting",
    name: "A/B Testing Dashboard",
    description: "Show A/B testing dashboard for experiments",
    enabled: false,
    environments: ["development", "staging"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  debugMode: {
    id: "debugMode",
    name: "Debug Mode",
    description: "Show debug information and developer tools",
    enabled: false,
    environments: ["development"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  mockData: {
    id: "mockData",
    name: "Mock Data",
    description: "Use mock data instead of real API calls",
    enabled: false,
    environments: ["development"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  
  // Security Features
  twoFactorAuth: {
    id: "twoFactorAuth",
    name: "Two-Factor Authentication",
    description: "Require 2FA for sensitive operations",
    enabled: false,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  sessionTimeout: {
    id: "sessionTimeout",
    name: "Session Timeout",
    description: "Automatically log out inactive users",
    enabled: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
};

// Get current environment
const getCurrentEnvironment = (): "development" | "staging" | "production" => {
  const env = import.meta.env.MODE;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
};

// Check if feature is enabled
export const isFeatureEnabled = (featureId: string): boolean => {
  const flag = FEATURE_FLAGS[featureId];
  if (!flag) return false;
  
  // Check if globally disabled
  if (!flag.enabled) return false;
  
  // Check environment restrictions
  if (flag.environments && flag.environments.length > 0) {
    const currentEnv = getCurrentEnvironment();
    if (!flag.environments.includes(currentEnv)) {
      return false;
    }
  }
  
  // A/B test logic (simple random, would need user persistence in real app)
  if (flag.abTestPercentage !== undefined) {
    const random = Math.random() * 100;
    return random < flag.abTestPercentage;
  }
  
  return true;
};

// Get all enabled features
export const getEnabledFeatures = (): string[] => {
  return Object.keys(FEATURE_FLAGS).filter(isFeatureEnabled);
};

// Hook-friendly feature check
export const useFeatureFlag = (featureId: string): boolean => {
  return isFeatureEnabled(featureId);
};

// Get feature flag details
export const getFeatureFlag = (featureId: string): FeatureFlag | undefined => {
  return FEATURE_FLAGS[featureId];
};
