import { useState, useRef, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SpotlightCard } from "./ui/spotlight-card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { 
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap
} from "lucide-react";
import type { AgentType, AgentStatus, AgentMessage } from "@shared/schema";
import { AGENT_CONFIGS, getAgentConfig } from "@/config/agents.config";

interface AgentPanelProps {
  agentType: AgentType;
  status: AgentStatus;
  lastAction?: string;
  messages: AgentMessage[];
  progress?: number;
  isActive?: boolean;
}

// Transform centralized config to component-friendly format
const getAgentDisplayConfig = (agentType: AgentType) => {
  const config = AGENT_CONFIGS[agentType];
  if (!config) {
    // Fallback for unknown agent types
    return {
      icon: Loader2,
      title: agentType,
      description: "",
      gradient: "from-gray-500 to-gray-600",
      lightGradient: "from-gray-500/20 to-gray-600/20",
      color: "text-gray-400",
      bgColor: "bg-gray-500/10",
      spotlightColor: "rgba(156, 163, 175, 0.2)",
      ringColor: "border-gray-500",
    };
  }
  return {
    icon: config.icon,
    title: config.title,
    description: config.description,
    gradient: config.colors.gradient,
    lightGradient: config.colors.lightGradient,
    color: config.colors.textColor,
    bgColor: config.colors.bgColor,
    spotlightColor: config.colors.spotlightColor,
    ringColor: config.colors.ringColor,
  };
};

const statusConfig = {
  idle: { icon: null, label: "Idle", color: "text-muted-foreground", bg: "bg-muted" },
  active: { icon: Loader2, label: "Working", color: "text-primary", bg: "bg-primary/20" },
  completed: { icon: CheckCircle2, label: "Complete", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/20" },
  error: { icon: XCircle, label: "Error", color: "text-red-500 dark:text-red-400", bg: "bg-red-500/20" },
} as const;

// Mini Progress Ring Component
function ProgressRing({ progress, size = 40, strokeWidth = 3, color }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="text-muted/30"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        className={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

// Memoized TiltCard Component
const TiltCard = memo(function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Use springs outside render loop where possible, but here they depend on hooks
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  // Optimized event handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative overflow-hidden rounded-xl", className)}
    >
      <div
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
        className="overflow-hidden rounded-xl"
      >
        {children}
        {/* Shine effect on hover - inside the card */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
            opacity: isHovered ? 1 : 0,
          }}
          animate={{
            backgroundPosition: isHovered ? "200% 0" : "-200% 0",
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
});

export const EnhancedAgentPanel = memo(function EnhancedAgentPanel({ 
  agentType, 
  status, 
  lastAction, 
  messages, 
  progress,
  isActive 
}: AgentPanelProps) {
  const config = getAgentDisplayConfig(agentType);
  const statusInfo = statusConfig[status];
  const Icon = config.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <TiltCard className="h-full perspective-1000">
      <SpotlightCard
        className={cn(
          "relative overflow-hidden transition-all duration-500 h-full min-h-[100px] border-0",
          "bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl",
          isActive && "ring-2 ring-offset-2 ring-offset-background",
          isActive && config.ringColor
        )}
        spotlightColor={config.spotlightColor}
      >
        {/* Animated background gradient */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-30 bg-gradient-to-br",
            config.lightGradient
          )}
          animate={isActive ? {
            opacity: [0.2, 0.4, 0.2],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Pulse ring effect when active */}
        {isActive && (
          <motion.div
            className={cn("absolute inset-0 rounded-xl border-2", config.ringColor)}
            animate={{
              opacity: [0.5, 0, 0.5],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <div className="p-4 relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  "relative p-3 rounded-xl bg-gradient-to-br",
                  config.lightGradient
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Icon glow effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl blur-md"
                    style={{ background: `linear-gradient(to br, ${config.spotlightColor}, transparent)` }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              <Icon className={cn("h-6 w-6 relative z-10", config.color)} />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{config.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
              </div>
            </div>
            
            {/* Status Badge with Progress Ring */}
            <div className="flex items-center gap-2">
              {progress !== undefined && status === "active" && (
                <ProgressRing progress={progress} size={32} strokeWidth={3} color={config.color} />
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "gap-1.5 px-2.5 py-1 border-0",
                      statusInfo.bg,
                      statusInfo.color
                    )}
                  >
                    {StatusIcon && (
                      <StatusIcon className={cn(
                        "h-3 w-3",
                        status === "active" && "animate-spin"
                      )} />
                    )}
                    {statusInfo.label}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Activity Indicator */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
            >
              <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Currently Active</span>
            </motion.div>
          )}

          {/* Last Action */}
          {lastAction && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-white/5"
            >
              <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <p className="text-xs text-muted-foreground leading-relaxed">{lastAction}</p>
            </motion.div>
          )}

          {/* Message Count */}
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-muted-foreground flex items-center gap-1"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", status === "completed" ? "bg-emerald-500" : "bg-muted-foreground")} />
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </motion.div>
          )}
        </div>

        {/* Bottom gradient line */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50",
          config.gradient
        )} />
      </SpotlightCard>
    </TiltCard>
  );
});

export const AgentPanelGrid = memo(function AgentPanelGrid({ 
  agents,
  activeAgentType
}: { 
  agents: Array<AgentPanelProps>;
  activeAgentType?: AgentType | null;
}) {
  // Separate master agent from others with UseMemo
  const { masterAgent, otherAgents } = useMemo(() => {
    return {
      masterAgent: agents.find(a => AGENT_CONFIGS[a.agentType]?.fullWidth),
      otherAgents: agents.filter(a => !AGENT_CONFIGS[a.agentType]?.fullWidth)
    };
  }, [agents]);

  return (
    <div className="flex flex-col gap-3">
      {/* Master Agent - Full Width */}
      {masterAgent && (
        <motion.div
          key={masterAgent.agentType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <EnhancedAgentPanel 
            {...masterAgent} 
            isActive={masterAgent.agentType === activeAgentType}
          />
        </motion.div>
      )}

      {/* Other Agents - 2x2 Grid with Fixed Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {otherAgents.map((agent, index) => (
          <motion.div
            key={agent.agentType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
            className="h-[120px]"
          >
            <EnhancedAgentPanel 
              {...agent} 
              isActive={agent.agentType === activeAgentType}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Connection lines visualization */}
      <AgentConnectionLines />
    </div>
  );
});

// Animated connection lines between agents
function AgentConnectionLines() {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible hidden md:block" style={{ zIndex: -1 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
          <stop offset="50%" stopColor="rgba(99, 102, 241, 0.5)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Placeholder for dynamic connection lines */}
    </svg>
  );
}
