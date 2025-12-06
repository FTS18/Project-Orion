import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "./ui/spotlight-card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  ShoppingCart, 
  Shield, 
  Calculator, 
  FileCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";
import type { AgentType, AgentStatus, AgentMessage } from "@shared/schema";

interface AgentPanelProps {
  agentType: AgentType;
  status: AgentStatus;
  lastAction?: string;
  messages: AgentMessage[];
  progress?: number;
  isActive?: boolean;
}

const agentConfig = {
  master: {
    icon: Bot,
    title: "Master Agent",
    description: "Orchestrates the entire loan process",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    spotlightColor: "rgba(168, 85, 247, 0.15)"
  },
  sales: {
    icon: ShoppingCart,
    title: "Sales Agent",
    description: "Collects loan requirements and suggests offers",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    spotlightColor: "rgba(59, 130, 246, 0.15)"
  },
  verification: {
    icon: Shield,
    title: "Verification Agent",
    description: "Validates KYC data against CRM records",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    spotlightColor: "rgba(34, 197, 94, 0.15)"
  },
  underwriting: {
    icon: Calculator,
    title: "Underwriting Agent",
    description: "Evaluates loan eligibility and risk",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    spotlightColor: "rgba(249, 115, 22, 0.15)"
  },
  sanction: {
    icon: FileCheck,
    title: "Sanction Letter Agent",
    description: "Generates approval documentation",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    spotlightColor: "rgba(236, 72, 153, 0.15)"
  },
};

const statusConfig = {
  idle: { icon: null, label: "Idle", color: "text-muted-foreground" },
  active: { icon: Loader2, label: "Working", color: "text-primary animate-spin" },
  completed: { icon: CheckCircle2, label: "Complete", color: "text-green-500" },
  error: { icon: XCircle, label: "Error", color: "text-red-500" },
  waiting: { icon: Loader2, label: "Waiting", color: "text-blue-500 animate-pulse" },
} as const;

export function EnhancedAgentPanel({ 
  agentType, 
  status, 
  lastAction, 
  messages, 
  progress,
  isActive 
}: AgentPanelProps) {
  const config = agentConfig[agentType];
  const statusInfo = statusConfig[status];
  const Icon = config.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <SpotlightCard
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isActive && "ring-2 ring-primary shadow-lg"
      )}
      spotlightColor={config.spotlightColor}
      hoverScale
    >
      {/* Active Pulse Effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={cn("p-3 rounded-xl", config.bgColor)}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={cn("h-6 w-6", config.color)} />
            </motion.div>
            <div>
              <h3 className="font-semibold text-sm">{config.title}</h3>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Badge
                variant={status === "completed" ? "default" : status === "error" ? "destructive" : "secondary"}
                className="gap-1"
              >
                {StatusIcon && <StatusIcon className={cn("h-3 w-3", statusInfo.color)} />}
                {statusInfo.label}
              </Badge>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && status === "active" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", config.bgColor.replace('/10', ''))}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Last Action */}
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mt-3"
          >
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{lastAction}</p>
          </motion.div>
        )}

        {/* Message Count */}
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-xs text-muted-foreground"
          >
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>
    </SpotlightCard>
  );
}

export function AgentPanelGrid({ 
  agents 
}: { 
  agents: Array<AgentPanelProps>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent, index) => (
        <motion.div
          key={agent.agentType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <EnhancedAgentPanel {...agent} />
        </motion.div>
      ))}
    </div>
  );
}
