import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentStatusIndicator, StatusBadge } from "@/components/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentType, AgentStatus, AgentMessage } from "@shared/schema";
import { Users, Shield, Calculator, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AgentPanelProps {
  agentType: AgentType;
  status: AgentStatus;
  lastAction?: string;
  messages?: AgentMessage[];
  progress?: number;
  className?: string;
}

const agentConfig: Record<AgentType, { 
  label: string; 
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  master: {
    label: "Master Agent",
    description: "Orchestrates workflow and coordinates all agents",
    icon: <Users className="h-4 w-4" aria-hidden="true" />,
    color: "text-primary",
  },
  sales: {
    label: "Sales Agent",
    description: "Collects loan requirements and suggests offers",
    icon: <Users className="h-4 w-4" aria-hidden="true" />,
    color: "text-blue-500",
  },
  verification: {
    label: "Verification Agent",
    description: "Validates KYC data against CRM records",
    icon: <Shield className="h-4 w-4" aria-hidden="true" />,
    color: "text-purple-500",
  },
  underwriting: {
    label: "Underwriting Agent",
    description: "Evaluates loan eligibility and risk",
    icon: <Calculator className="h-4 w-4" aria-hidden="true" />,
    color: "text-orange-500",
  },
  sanction: {
    label: "Sanction Letter Agent",
    description: "Generates approval documentation",
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    color: "text-green-500",
  },
};

export function AgentPanel({ 
  agentType, 
  status, 
  lastAction, 
  messages = [],
  progress,
  className 
}: AgentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = agentConfig[agentType];

  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        status === "active" && "ring-2 ring-primary/50",
        className
      )}
      data-testid={`agent-panel-${agentType}`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0",
                status === "active" && "bg-primary/10"
              )}>
                <span className={config.color}>{config.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{config.label}</h3>
                  <AgentStatusIndicator status={status} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {config.description}
                </p>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 flex-shrink-0"
                aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
                data-testid={`button-expand-${agentType}`}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {progress !== undefined && status === "active" && (
            <div className="mb-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}

          {lastAction && (
            <div className="text-sm text-muted-foreground truncate" data-testid={`text-last-action-${agentType}`}>
              {lastAction}
            </div>
          )}

          <CollapsibleContent className="mt-3">
            {messages.length > 0 ? (
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={cn(
                        "text-xs p-2 rounded-lg",
                        message.role === "agent" && "bg-muted",
                        message.role === "system" && "bg-primary/5 text-primary"
                      )}
                    >
                      <p>{message.content}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No activity yet
              </p>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

interface AgentPanelGridProps {
  agents: Array<{
    agentType: AgentType;
    status: AgentStatus;
    lastAction?: string;
    messages?: AgentMessage[];
    progress?: number;
  }>;
  className?: string;
}

export function AgentPanelGrid({ agents, className }: AgentPanelGridProps) {
  const workerAgents = agents.filter(a => a.agentType !== "master");

  return (
    <div 
      className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}
      role="region"
      aria-label="Agent status panels"
    >
      {workerAgents.map((agent) => (
        <AgentPanel
          key={agent.agentType}
          agentType={agent.agentType}
          status={agent.status}
          lastAction={agent.lastAction}
          messages={agent.messages}
          progress={agent.progress}
        />
      ))}
    </div>
  );
}
