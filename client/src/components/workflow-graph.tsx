import { cn } from "@/lib/utils";
import type { AgentType, AgentStatus } from "@shared/schema";
import { Users, Shield, Calculator, FileText, Brain } from "lucide-react";
import { useState, useEffect } from "react";

interface WorkflowNode {
  id: AgentType;
  label: string;
  icon: React.ReactNode;
  status: AgentStatus;
}

interface WorkflowGraphProps {
  nodes: WorkflowNode[];
  activeAgent: AgentType | null;
  className?: string;
}

const agentIcons: Record<AgentType, React.ReactNode> = {
  master: <Brain className="h-5 w-5" aria-hidden="true" />,
  sales: <Users className="h-5 w-5" aria-hidden="true" />,
  verification: <Shield className="h-5 w-5" aria-hidden="true" />,
  underwriting: <Calculator className="h-5 w-5" aria-hidden="true" />,
  sanction: <FileText className="h-5 w-5" aria-hidden="true" />,
};

const agentLabels: Record<AgentType, string> = {
  master: "Master Agent",
  sales: "Sales Agent",
  verification: "Verification",
  underwriting: "Underwriting",
  sanction: "Sanction Letter",
};

export function WorkflowGraph({ nodes, activeAgent, className }: WorkflowGraphProps) {
  const statusColors = {
    idle: "border-muted-foreground/30 bg-background text-muted-foreground",
    active: "border-primary bg-primary/10 text-primary animate-pulse-glow",
    completed: "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400",
    error: "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const masterNode = nodes.find(n => n.id === "master");
  const workerNodes = nodes.filter(n => n.id !== "master");

  return (
    <div 
      className={cn("relative w-full p-4", className)}
      role="img"
      aria-label="Agent workflow diagram showing master agent connected to worker agents"
    >
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid meet"
      >
        {workerNodes.map((node, index) => {
          const isActive = node.id === activeAgent;
          const startX = 200;
          const startY = 40;
          const endX = 50 + (index * 100);
          const endY = 160;
          const controlY = 100;
          
          return (
            <path
              key={node.id}
              d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}`}
              fill="none"
              stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={isActive ? 2 : 1}
              strokeDasharray={isActive ? "none" : "4 4"}
              className={cn(
                "transition-all duration-300",
                isActive && "animate-flow-path"
              )}
              style={{
                strokeDasharray: isActive ? "100" : undefined,
                strokeDashoffset: isActive ? "100" : undefined,
              }}
            />
          );
        })}
      </svg>

      <div className="relative flex flex-col items-center gap-12">
        {masterNode && (
          <div
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 z-10 bg-background",
              statusColors[masterNode.status]
            )}
            data-testid={`workflow-node-${masterNode.id}`}
          >
            <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center">
              {agentIcons[masterNode.id]}
            </div>
            <span className="text-sm font-medium">{agentLabels[masterNode.id]}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {workerNodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 z-10 bg-background min-w-[80px]",
                statusColors[node.status]
              )}
              data-testid={`workflow-node-${node.id}`}
            >
              <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center">
                {agentIcons[node.id]}
              </div>
              <span className="text-xs font-medium text-center">{agentLabels[node.id]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimpleWorkflowGraph({ className }: { className?: string }) {
  const [activeAgent, setActiveAgent] = useState<AgentType>("master");
  const agentSequence: AgentType[] = ["master", "sales", "verification", "underwriting", "sanction"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => {
        const currentIndex = agentSequence.indexOf(prev);
        const nextIndex = (currentIndex + 1) % agentSequence.length;
        return agentSequence[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const defaultNodes: WorkflowNode[] = [
    { id: "master", label: "Master Agent", icon: agentIcons.master, status: activeAgent === "master" ? "active" : "idle" },
    { id: "sales", label: "Sales Agent", icon: agentIcons.sales, status: activeAgent === "sales" ? "active" : "idle" },
    { id: "verification", label: "Verification", icon: agentIcons.verification, status: activeAgent === "verification" ? "active" : "idle" },
    { id: "underwriting", label: "Underwriting", icon: agentIcons.underwriting, status: activeAgent === "underwriting" ? "active" : "idle" },
    { id: "sanction", label: "Sanction Letter", icon: agentIcons.sanction, status: activeAgent === "sanction" ? "active" : "idle" },
  ];

  return <WorkflowGraph nodes={defaultNodes} activeAgent={activeAgent} className={className} />;
}
