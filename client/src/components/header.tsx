import { Moon, Sun, LogOut, User, UserPlus, Settings, Menu, Home, Sparkles, FileText, BookOpen, Mail, Github } from "lucide-react";
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
            <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0 border-r-slate-200 dark:border-r-slate-800 flex flex-col p-6 pt-10">
               <SheetHeader className="text-left border-b border-slate-100 dark:border-slate-800 pb-6 mb-2">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <img src="/logo.png" alt="Project Orion" className="h-6 w-6 object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-lg tracking-tight block">Project Orion</span>
                      <span className="text-xs text-muted-foreground font-medium">Financial Intelligence</span>
                    </div>
                  </div>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    <nav className="flex flex-col gap-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-2 mt-2">Menu</div>
                      {navLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-xl transition-all duration-200 font-medium",
                            isActiveRoute(link.href)
                              ? "bg-emerald-50 text-emerald-900 dark:bg-blue-900/30 dark:text-blue-100 shadow-sm border border-emerald-100 dark:border-blue-800/50"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                          )}
                        >
                          <link.icon className={cn(
                            "h-5 w-5", 
                            isActiveRoute(link.href) ? "text-emerald-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                          )} />
                          <span>{link.label}</span>
                        </a>
                      ))}

                        <a href="/blog" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 p-2 rounded-xl transition-all duration-200 font-medium", isActiveRoute('/blog') ? "bg-emerald-50 text-emerald-900 dark:bg-blue-900/30 dark:text-blue-100 shadow-sm border border-emerald-100 dark:border-blue-800/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200")}>
                           <BookOpen className={cn("h-5 w-5", isActiveRoute('/blog') ? "text-emerald-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
                           <span>Blog</span>
                        </a>
                         <a href="/contact" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 p-2 rounded-xl transition-all duration-200 font-medium", isActiveRoute('/contact') ? "bg-emerald-50 text-emerald-900 dark:bg-blue-900/30 dark:text-blue-100 shadow-sm border border-emerald-100 dark:border-blue-800/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200")}>
                              <Mail className={cn("h-5 w-5", isActiveRoute('/contact') ? "text-emerald-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
                           <span>Contact</span>
                        </a>
                        <a href="https://github.com/FTS18/Project-Orion" target="_blank" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200">
                              <Github className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                           <span>GitHub</span>
                        </a>
                      
                      <div className="my-4 border-t border-slate-100 dark:border-slate-800 mx-2" />
                      
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-2">Applications</div>
                      <a href="/standard" className="flex items-center gap-3 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">
                        <div className="p-1 rounded-md bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                           <FileText className="h-4 w-4" />
                        </div>
                        <span>Standard Mode</span>
                      </a>
                      <a href="/agentic" className="flex items-center gap-3 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">
                         <div className="p-1 rounded-md bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <Sparkles className="h-4 w-4" />
                         </div>
                        <span>Agentic Mode</span>
                      </a>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 -mb-6 -mx-6 pb-8 px-6">
                    {session ? (
                        <div className="flex items-center justify-between gap-2">
                             <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-blue-900/30 flex items-center justify-center text-emerald-700 dark:text-blue-300 font-bold shrink-0">
                                    {userName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium truncate text-sm">{userName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>
                                    <Settings className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => navigate("/auth/login")}>Sign In</Button>
                            <Button onClick={() => navigate("/auth/signup")}>Sign Up</Button>
                        </div>
                    )}
                </div>
            </SheetContent>
          </Sheet>

          {/* Logo - Icon + Text */}
          <a 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
