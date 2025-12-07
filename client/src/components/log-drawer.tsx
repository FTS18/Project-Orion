import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Terminal, Trash2, Activity } from "lucide-react";
import type { WorkflowLogEntry } from "@shared/schema";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogDrawerProps {
  logs: WorkflowLogEntry[];
  onClear?: () => void;
  className?: string;
}

const logLevelConfig = {
  info: { color: "text-blue-400", bg: "bg-blue-500/10", label: "INFO" },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10", label: "WARN" },
  error: { color: "text-rose-400", bg: "bg-rose-500/10", label: "ERR" },
  success: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "OK" },
};

const agentColors: Record<string, string> = {
  master: "text-violet-400",
  sales: "text-blue-400",
  verification: "text-emerald-400",
  underwriting: "text-orange-400",
  sanction: "text-pink-400",
};

export function LogDrawer({ logs, onClear, className }: LogDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-white/5 transition-all duration-300",
        isExpanded ? "h-48" : "h-12",
        className
      )}
      role="complementary"
      aria-label="Workflow logs"
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-violet-400" aria-hidden="true" />
          <span className="text-sm font-mono font-medium">Workflow Logs</span>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
              {logs.length} entries
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && onClear && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClear}
              aria-label="Clear logs"
              data-testid="button-clear-logs"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse logs" : "Expand logs"}
            data-testid="button-toggle-logs"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <ScrollArea className="h-[calc(100%-48px)]">
          <div className="p-4 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No logs yet. Start a workflow to see activity.
              </p>
            ) : (
              logs.map((log) => (
                <LogEntry key={log.id} entry={log} />
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface LogEntryProps {
  entry: WorkflowLogEntry;
}

function LogEntry({ entry }: LogEntryProps) {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const levelConfig = logLevelConfig[entry.level];
  const agentColor = agentColors[entry.agentType] || "text-primary";

  const agentLabels: Record<string, string> = {
    master: "MASTER",
    sales: "SALES",
    verification: "VERIFY",
    underwriting: "UNDRWR",
    sanction: "SANCTN",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-white/5 transition-colors group"
      data-testid={`log-entry-${entry.id}`}
    >
      <span className="text-muted-foreground flex-shrink-0 opacity-60">{timestamp}</span>
      <span className={cn(
        "flex-shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px]",
        levelConfig.bg,
        levelConfig.color
      )}>
        {levelConfig.label}
      </span>
      <span className={cn("flex-shrink-0 font-medium", agentColor)}>
        [{agentLabels[entry.agentType] || entry.agentType.toUpperCase()}]
      </span>
      <span className="text-foreground/80 group-hover:text-foreground transition-colors">
        {entry.action}
        {entry.details && (
          <span className="text-muted-foreground"> - {entry.details}</span>
        )}
      </span>
    </motion.div>
  );
}

export function InlineLogViewer({ 
  logs, 
  maxHeight,
  className 
}: { 
  logs: WorkflowLogEntry[]; 
  maxHeight?: string;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-white/5 rounded-xl flex flex-col overflow-hidden",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
      role="log"
      aria-label="Inline workflow logs"
    >
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-white/5 bg-gradient-to-r from-violet-500/5 to-transparent">
        <div className="relative">
          <Terminal className="h-4 w-4 text-violet-400" aria-hidden="true" />
          {logs.length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full"
            />
          )}
        </div>
        <span className="text-xs font-mono font-medium text-foreground/80">Logs</span>
        {logs.length > 0 && (
          <span className="text-[10px] text-violet-400 ml-auto">{logs.length}</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 font-mono text-xs space-y-0.5">
          <AnimatePresence mode="popLayout">
            {logs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <Activity className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground/60 text-xs">
                  No activity yet
                </p>
              </motion.div>
            ) : (
              logs.map((log) => (
                <LogEntry key={log.id} entry={log} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

