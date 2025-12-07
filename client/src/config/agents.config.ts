/**
 * Agent Configuration
 * Controls agent types, names, descriptions, colors, and capabilities
 * Modify this file to customize agent behavior without changing component code
 */

import { 
  Bot, 
  ShoppingCart, 
  Shield, 
  Calculator, 
  FileCheck,
  type LucideIcon 
} from "lucide-react";
import type { AgentType } from "@shared/schema";

export interface AgentConfig {
  id: AgentType;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  description: string;
  // Theme-aware colors
  colors: {
    gradient: string;           // Primary gradient (dark mode)
    lightGradient: string;      // Background gradient overlay
    textColor: string;          // Icon/text color
    bgColor: string;            // Background color
    spotlightColor: string;     // Spotlight effect color
    ringColor: string;          // Active ring border color
    glowColor: string;          // Glow effect RGB values
  };
  // Agent capabilities
  capabilities: string[];
  // Order in workflow (1-based)
  workflowOrder: number;
  // Whether this agent spans full width in grid
  fullWidth: boolean;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  master: {
    id: "master",
    icon: Bot,
    title: "Master Agent",
    shortTitle: "Master",
    description: "Orchestrates the entire loan process",
    colors: {
      gradient: "from-violet-500 to-purple-600",
      lightGradient: "from-violet-500/20 to-purple-500/20",
      textColor: "text-violet-500 dark:text-violet-400",
      bgColor: "bg-violet-500/10",
      spotlightColor: "rgba(139, 92, 246, 0.2)",
      ringColor: "border-violet-500",
      glowColor: "139, 92, 246",
    },
    capabilities: ["orchestration", "delegation", "monitoring", "decision-making"],
    workflowOrder: 1,
    fullWidth: true,
  },
  sales: {
    id: "sales",
    icon: ShoppingCart,
    title: "Sales Agent",
    shortTitle: "Sales",
    description: "Collects loan requirements and customer info",
    colors: {
      gradient: "from-blue-500 to-cyan-500",
      lightGradient: "from-blue-500/20 to-cyan-500/20",
      textColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      spotlightColor: "rgba(59, 130, 246, 0.2)",
      ringColor: "border-blue-500",
      glowColor: "59, 130, 246",
    },
    capabilities: ["customer-interaction", "data-collection", "loan-consultation"],
    workflowOrder: 2,
    fullWidth: false,
  },
  verification: {
    id: "verification",
    icon: Shield,
    title: "Verification Agent",
    shortTitle: "Verify",
    description: "Validates KYC data and documents",
    colors: {
      gradient: "from-emerald-500 to-green-500",
      lightGradient: "from-emerald-500/20 to-green-500/20",
      textColor: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      spotlightColor: "rgba(16, 185, 129, 0.2)",
      ringColor: "border-emerald-500",
      glowColor: "16, 185, 129",
    },
    capabilities: ["kyc-verification", "document-validation", "identity-check"],
    workflowOrder: 3,
    fullWidth: false,
  },
  underwriting: {
    id: "underwriting",
    icon: Calculator,
    title: "Underwriting Agent",
    shortTitle: "Underwrite",
    description: "Evaluates loan eligibility and risk",
    colors: {
      gradient: "from-orange-500 to-amber-500",
      lightGradient: "from-orange-500/20 to-amber-500/20",
      textColor: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      spotlightColor: "rgba(249, 115, 22, 0.2)",
      ringColor: "border-orange-500",
      glowColor: "249, 115, 22",
    },
    capabilities: ["risk-assessment", "credit-analysis", "loan-decisioning"],
    workflowOrder: 4,
    fullWidth: false,
  },
  sanction: {
    id: "sanction",
    icon: FileCheck,
    title: "Sanction Letter Agent",
    shortTitle: "Sanction",
    description: "Generates approval documents",
    colors: {
      gradient: "from-pink-500 to-rose-500",
      lightGradient: "from-pink-500/20 to-rose-500/20",
      textColor: "text-pink-500 dark:text-pink-400",
      bgColor: "bg-pink-500/10",
      spotlightColor: "rgba(236, 72, 153, 0.2)",
      ringColor: "border-pink-500",
      glowColor: "236, 72, 153",
    },
    capabilities: ["document-generation", "letter-formatting", "compliance-check"],
    workflowOrder: 5,
    fullWidth: false,
  },
};

// Get agents in workflow order
export const getOrderedAgents = (): AgentConfig[] => {
  return Object.values(AGENT_CONFIGS).sort((a, b) => a.workflowOrder - b.workflowOrder);
};

// Get agent by ID
export const getAgentConfig = (agentId: AgentType): AgentConfig | undefined => {
  return AGENT_CONFIGS[agentId];
};

// Get agent IDs in workflow order
export const getAgentWorkflowOrder = (): AgentType[] => {
  return getOrderedAgents().map(agent => agent.id);
};

export type AgentId = keyof typeof AGENT_CONFIGS;

