import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UnderwritingDecision, AgentStatus } from "@shared/schema";
import { Check, X, Clock, Loader2, CircleDot, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: UnderwritingDecision | AgentStatus | "VERIFIED" | "PENDING" | "FAILED" | "PROCESSING";
  size?: "sm" | "default";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<string, { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  className: string;
}> = {
  APPROVE: { 
    label: "Approved", 
    variant: "default",
    icon: <Check className="h-3 w-3" aria-hidden="true" />,
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
  },
  APPROVED: { 
    label: "Approved", 
    variant: "default",
    icon: <Check className="h-3 w-3" aria-hidden="true" />,
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
  },
  REJECT: { 
    label: "Rejected", 
    variant: "destructive",
    icon: <X className="h-3 w-3" aria-hidden="true" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  },
  REJECTED: { 
    label: "Rejected", 
    variant: "destructive",
    icon: <X className="h-3 w-3" aria-hidden="true" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  },
  PENDING: { 
    label: "Pending", 
    variant: "secondary",
    icon: <Clock className="h-3 w-3" aria-hidden="true" />,
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
  },
  VERIFIED: { 
    label: "Verified", 
    variant: "default",
    icon: <Check className="h-3 w-3" aria-hidden="true" />,
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
  },
  FAILED: { 
    label: "Failed", 
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" aria-hidden="true" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  },
  PROCESSING: { 
    label: "Processing", 
    variant: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  idle: { 
    label: "Idle", 
    variant: "outline",
    icon: <CircleDot className="h-3 w-3" aria-hidden="true" />,
    className: "bg-muted text-muted-foreground"
  },
  active: { 
    label: "Active", 
    variant: "default",
    icon: <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />,
    className: "bg-primary/10 text-primary border-primary/20"
  },
  completed: { 
    label: "Completed", 
    variant: "default",
    icon: <Check className="h-3 w-3" aria-hidden="true" />,
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
  },
  error: { 
    label: "Error", 
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" aria-hidden="true" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
  },
};

export function StatusBadge({ status, size = "default", showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
    icon: null,
    className: "",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 font-semibold uppercase tracking-wide border",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1",
        config.className,
        className
      )}
      data-testid={`status-badge-${status.toLowerCase()}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

interface AgentStatusIndicatorProps {
  status: AgentStatus;
  size?: "sm" | "default" | "lg";
}

export function AgentStatusIndicator({ status, size = "default" }: AgentStatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const statusColors = {
    idle: "bg-muted-foreground",
    active: "bg-primary animate-pulse-glow",
    completed: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <span
      className={cn(
        "rounded-full inline-block",
        sizeClasses[size],
        statusColors[status]
      )}
      role="status"
      aria-label={`Agent status: ${status}`}
      data-testid={`agent-status-${status}`}
    />
  );
}
