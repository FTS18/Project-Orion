import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Terminal, Trash2 } from "lucide-react";
import type { WorkflowLogEntry } from "@shared/schema";
import { useState } from "react";

interface LogDrawerProps {
  logs: WorkflowLogEntry[];
  onClear?: () => void;
  className?: string;
}

const logLevelColors = {
  info: "text-blue-500 dark:text-blue-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-red-500 dark:text-red-400",
  success: "text-green-500 dark:text-green-400",
};

const logLevelIcons = {
  info: "INFO",
  warning: "WARN",
  error: "ERR ",
  success: "OK  ",
};

export function LogDrawer({ logs, onClear, className }: LogDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-card border-t transition-all duration-300",
        isExpanded ? "h-48" : "h-12",
        className
      )}
      role="complementary"
      aria-label="Workflow logs"
    >
      <div className="flex items-center justify-between px-4 h-12 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-mono font-medium">Workflow Logs</span>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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

  const agentLabels: Record<string, string> = {
    master: "MASTER",
    sales: "SALES ",
    verification: "VERIFY",
    underwriting: "UNDRWR",
    sanction: "SANCTN",
  };

  return (
    <div 
      className="flex items-start gap-2 py-1 hover:bg-muted/50 rounded px-2 -mx-2 transition-colors"
      data-testid={`log-entry-${entry.id}`}
    >
      <span className="text-muted-foreground flex-shrink-0">{timestamp}</span>
      <span className={cn("flex-shrink-0 font-bold", logLevelColors[entry.level])}>
        [{logLevelIcons[entry.level]}]
      </span>
      <span className="text-primary flex-shrink-0 font-medium">
        [{agentLabels[entry.agentType] || entry.agentType.toUpperCase()}]
      </span>
      <span className="text-foreground">
        {entry.action}
        {entry.details && (
          <span className="text-muted-foreground"> - {entry.details}</span>
        )}
      </span>
    </div>
  );
}

export function InlineLogViewer({ logs, maxHeight = "200px" }: { logs: WorkflowLogEntry[]; maxHeight?: string }) {
  return (
    <div 
      className="bg-card border rounded-lg overflow-hidden"
      role="log"
      aria-label="Inline workflow logs"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <Terminal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-xs font-mono font-medium">Logs</span>
      </div>
      <ScrollArea style={{ maxHeight }}>
        <div className="p-3 font-mono text-xs space-y-0.5">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-2">
              No activity yet
            </p>
          ) : (
            logs.map((log) => (
              <LogEntry key={log.id} entry={log} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
