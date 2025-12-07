import { Moon, Sun, LogOut, User, UserPlus, Settings, Shield, Menu, Home, Sparkles, FileText, BookOpen, Lock, CreditCard } from "lucide-react";
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
import { useEffect, useState, useRef } from "react";
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
  { href: "/loans", label: "Loans", icon: FileText },
  { href: "/features", label: "Features", icon: Sparkles },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

export function Header({ mode, onModeChange, showModeToggle = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleThemeToggle = () => {
    if (themeButtonRef.current) {
      const rect = themeButtonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setTheme(theme === "dark" ? "light" : "dark", { x, y });
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-2 lg:gap-6">
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0">
               <SheetHeader className="px-7 text-left">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Project Orion" className="h-8 w-8 object-contain" />
                    <span className="font-bold text-lg">Project Orion</span>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col gap-2 p-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActiveRoute(link.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      <span className="font-medium">{link.label}</span>
                    </a>
                  ))}
                  <div className="border-t my-4" />
                  <a href="/standard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Standard Mode</span>
                  </a>
                  <a href="/agentic" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Agentic Mode</span>
                  </a>
                </nav>
            </SheetContent>
          </Sheet>

          {/* Logo - Icon + Text */}
          <a 
            href="/" 
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-2 py-1"
            data-testid="link-home"
            aria-label="Go to home page"
          >
            <img src="/logo.png" alt="Project Orion" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">Project Orion</span>
            <span className="font-bold text-lg tracking-tight sm:hidden">Orion</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
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

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
           {/* Persistent Mode Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-muted rounded-lg mr-2">
            <Button
              variant={location === "/standard" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/standard")}
              className="text-sm font-medium h-7"
            >
              Standard
            </Button>
            <Button
              variant={location === "/agentic" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/agentic")}
              className="text-sm font-medium h-7"
            >
              AI Agent
            </Button>
          </div>

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
                    <span className="text-xs text-muted-foreground font-normal">{session.user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                </DropdownMenuItem>
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
              <Button size="sm" onClick={() => navigate("/auth/signup")} className="h-8 w-8 p-0 lg:w-auto lg:h-9 lg:px-4 lg:text-sm lg:font-medium rounded-full lg:rounded-md bg-transparent border lg:bg-primary lg:text-primary-foreground lg:border-0 hover:bg-muted lg:hover:bg-primary/90">
                 <UserPlus className="h-5 w-5 lg:hidden text-foreground" />
                 <span className="hidden lg:inline">Sign Up</span>
              </Button>
            </>
          )}

          <Button 
            ref={themeButtonRef}
            variant="ghost" 
            size="icon"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            data-testid="button-theme-toggle"
            className="hover:bg-transparent"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
