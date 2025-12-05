import { Moon, Sun, Laptop, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme-provider";

interface HeaderProps {
  mode?: "standard" | "agentic" | null;
  onModeChange?: (mode: "standard" | "agentic") => void;
  showModeToggle?: boolean;
}

export function Header({ mode, onModeChange, showModeToggle = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
        <a 
          href="/" 
          className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-2 py-1 -ml-2"
          data-testid="link-home"
          aria-label="Go to home page"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline">Project Orion</span>
        </a>

        {showModeToggle && mode && (
          <div 
            className="flex items-center gap-1 p-1 bg-muted rounded-lg"
            role="tablist"
            aria-label="Application mode"
          >
            <Button
              variant={mode === "standard" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange?.("standard")}
              className="text-sm font-medium"
              role="tab"
              aria-selected={mode === "standard"}
              data-testid="button-mode-standard"
            >
              Standard Mode
            </Button>
            <Button
              variant={mode === "agentic" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange?.("agentic")}
              className="text-sm font-medium"
              role="tab"
              aria-selected={mode === "agentic"}
              data-testid="button-mode-agentic"
            >
              Agentic AI Mode
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Toggle theme"
                data-testid="button-theme-toggle"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                data-testid="menu-item-light"
              >
                <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                data-testid="menu-item-dark"
              >
                <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                data-testid="menu-item-system"
              >
                <Laptop className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
