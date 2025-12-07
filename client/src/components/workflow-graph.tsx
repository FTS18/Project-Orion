import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import type { AgentType, AgentStatus } from "@shared/schema";
import { AGENT_CONFIGS, getAgentWorkflowOrder } from "@/config/agents.config";

interface WorkflowNode {
  id: AgentType;
  label: string;
  icon: React.ReactNode;
  status: AgentStatus;
}

interface WorkflowGraphProps {
  nodes: WorkflowNode[];
  activeAgent?: AgentType | null;
}

// Get agent icon from centralized config
const getAgentIcon = (agentType: AgentType) => {
  return AGENT_CONFIGS[agentType]?.icon || Loader2;
};

// Get agent colors from centralized config
const getAgentColors = (agentType: AgentType) => {
  const config = AGENT_CONFIGS[agentType];
  if (!config) {
    return { gradient: "from-gray-500 to-gray-600", glow: "rgba(156, 163, 175, 0.5)", text: "text-gray-400" };
  }
  return {
    gradient: config.colors.gradient,
    glow: `rgba(${config.colors.glowColor}, 0.5)`,
    text: config.colors.textColor,
  };
};

// Get agent short title from centralized config
const getAgentLabel = (agentType: AgentType) => {
  return AGENT_CONFIGS[agentType]?.shortTitle || agentType;
};

const statusIcons: Record<AgentStatus, React.ElementType | null> = {
  idle: null,
  active: Loader2,
  completed: CheckCircle2,
  error: XCircle,
};

export function WorkflowGraph({ nodes, activeAgent }: WorkflowGraphProps) {
  const orderedNodes = useMemo(() => {
    const order = getAgentWorkflowOrder();
    return order.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
  }, [nodes]);

  return (
    <div className="relative py-4">
      {/* Background glow for active workflow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-indigo-500/10 to-violet-500/5 rounded-xl blur-xl"
        animate={{
          opacity: activeAgent ? [0.3, 0.6, 0.3] : 0.2,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative flex flex-col gap-3">
        {orderedNodes.map((node, index) => {
          const Icon = getAgentIcon(node.id);
          const StatusIcon = statusIcons[node.status];
          const colors = getAgentColors(node.id);
          const isActive = activeAgent === node.id;
          const isCompleted = node.status === "completed";
          const isPending = node.status === "idle";

          return (
            <div key={node.id} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  "bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm",
                  "border",
                  isActive ? "border-violet-500/50 shadow-lg" : "border-white/5",
                  isActive && "shadow-violet-500/20"
                )}
              >
                {/* Node icon with status */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-br",
                      isCompleted ? colors.gradient : isPending ? "from-muted to-muted/50" : colors.gradient
                    )}
                    animate={isActive ? {
                      boxShadow: [
                        `0 0 0 0 ${colors.glow}`,
                        `0 0 20px 5px ${colors.glow}`,
                        `0 0 0 0 ${colors.glow}`,
                      ],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isCompleted || isActive ? "text-white" : "text-muted-foreground"
                    )} />
                  </motion.div>

                  {/* Status indicator */}
                  <AnimatePresence>
                    {StatusIcon && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                          node.status === "completed" && "bg-emerald-500",
                          node.status === "active" && "bg-violet-500",
                          node.status === "error" && "bg-red-500",
                          node.status === "idle" && "bg-muted"
                        )}
                      >
                        <StatusIcon className={cn(
                          "w-3 h-3 text-white",
                          node.status === "active" && "animate-spin"
                        )} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Node label */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {getAgentLabel(node.id)}
                  </p>
                  <p className="text-xs text-muted-foreground/60 capitalize">
                    {node.status}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30"
                  >
                    <Zap className="w-3 h-3 text-violet-400 animate-pulse" />
                    <span className="text-xs font-medium text-violet-400">Active</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Connection line to next node */}
              {index < orderedNodes.length - 1 && (
                <div className="flex justify-center py-1">
                  <motion.div
                    className="relative h-4 w-0.5 bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/10"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {/* Animated particle moving down */}
                    {(isCompleted || isActive) && (
                      <motion.div
                        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400"
                        animate={{
                          y: [0, 16],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatDelay: 0.5,
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flow direction indicator */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground/30"
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowRight className="w-4 h-4" />
      </motion.div>
    </div>
  );
}

// Horizontal workflow visualization for larger screens
export function WorkflowGraphHorizontal({ nodes, activeAgent }: WorkflowGraphProps) {
  const orderedNodes = useMemo(() => {
    const order = getAgentWorkflowOrder();
    return order.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
  }, [nodes]);

  return (
    <div className="relative py-4 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max px-2">
        {orderedNodes.map((node, index) => {
          const Icon = getAgentIcon(node.id);
          const colors = getAgentColors(node.id);
          const isActive = activeAgent === node.id;
          const isCompleted = node.status === "completed";

          return (
            <div key={node.id} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-2 rounded-lg",
                  isActive && "bg-violet-500/10"
                )}
              >
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br",
                    isCompleted ? colors.gradient : isActive ? colors.gradient : "from-muted to-muted/50"
                  )}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 0 0 ${colors.glow}`,
                      `0 0 15px 3px ${colors.glow}`,
                      `0 0 0 0 ${colors.glow}`,
                    ],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    (isCompleted || isActive) ? "text-white" : "text-muted-foreground"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? colors.text : "text-muted-foreground"
                )}>
                  {getAgentLabel(node.id)}
                </span>
              </motion.div>

              {/* Connector line */}
              {index < orderedNodes.length - 1 && (
                <div className="relative w-8 h-0.5 mx-1">
                  <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" />
                  {isCompleted && (
                    <motion.div
                      className={cn("absolute inset-0 rounded-full bg-gradient-to-r", colors.gradient)}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  {/* Animated particle */}
                  {isActive && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400"
                      animate={{ x: [0, 32] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple workflow graph for landing page demo
export function SimpleWorkflowGraph() {
  const demoNodes = getAgentWorkflowOrder();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % demoNodes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative py-6">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {demoNodes.map((agentType, index) => {
          const Icon = getAgentIcon(agentType);
          const colors = getAgentColors(agentType);
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;

          return (
            <div key={agentType} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center gap-2"
              >
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br",
                    isCompleted ? colors.gradient : isActive ? colors.gradient : "from-muted to-muted/50"
                  )}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 0 0 ${colors.glow}`,
                      `0 0 20px 5px ${colors.glow}`,
                      `0 0 0 0 ${colors.glow}`,
                    ],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon className={cn(
                    "w-6 h-6 transition-colors",
                    (isCompleted || isActive) ? "text-white" : "text-muted-foreground"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? colors.text : "text-muted-foreground"
                )}>
                  {getAgentLabel(agentType)}
                </span>
                
                {/* Status indicator */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Connector */}
              {index < demoNodes.length - 1 && (
                <div className="hidden sm:block relative w-6 h-0.5 mx-2">
                  <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" />
                  {isCompleted && (
                    <motion.div
                      className={cn("absolute inset-0 rounded-full bg-gradient-to-r", colors.gradient)}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

