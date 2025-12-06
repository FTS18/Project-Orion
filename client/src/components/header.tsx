import { Moon, Sun, Laptop, LogOut, User, Settings, Shield, Menu, Home, Sparkles, FileText, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/lib/theme-provider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  mode?: "standard" | "agentic" | null;
  onModeChange?: (mode: "standard" | "agentic") => void;
  showModeToggle?: boolean;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/features", label: "Features", icon: Sparkles },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/security", label: "Security", icon: Lock },
];

export function Header({ mode, onModeChange, showModeToggle = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta?.first_name || meta?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || "User";
        setUserName(name);
        setIsAdmin(Boolean(meta?.role === 'admin' || session.user.email?.includes('admin')));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta?.first_name || meta?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || "User";
        setUserName(name);
        setIsAdmin(Boolean(meta?.role === 'admin' || session.user.email?.includes('admin')));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <span className="text-xl font-bold text-foreground">
                  Project Orion
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = isActiveRoute(link.href);
                return (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </motion.a>
                );
              })}
              
              <div className="border-t my-4" />
              
              <motion.a
                href="/standard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActiveRoute("/standard") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Standard Mode</span>
              </motion.a>
              
              <motion.a
                href="/agentic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActiveRoute("/agentic") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Agentic Mode</span>
              </motion.a>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo - Text Only */}
        <a 
          href="/" 
          className="hover-elevate active-elevate-2 rounded-lg px-2 py-1 -ml-2"
          data-testid="link-home"
          aria-label="Go to home page"
        >
          <motion.span 
            className="text-xl font-bold text-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Project Orion
          </motion.span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = isActiveRoute(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {showModeToggle && mode && (
          <div 
            className="hidden sm:flex items-center gap-1 p-1 bg-muted rounded-lg"
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
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {session.user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth/login")} className="hidden sm:flex">
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/auth/signup")}>
                Sign Up
              </Button>
            </>
          )}

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

export default Header;
