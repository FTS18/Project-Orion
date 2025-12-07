import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Login schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Signup schema
const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Determine initial tab from URL
  const getInitialTab = () => {
    if (location.includes("signup")) return "register";
    return "login";
  };
  
  const [activeTab, setActiveTab] = useState<"login" | "register">(getInitialTab());
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Update tab when URL changes
  useEffect(() => {
    if (location.includes("signup")) {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [location]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please verify your email before logging in.");
        }
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("This email is already registered. Try logging in instead.");
        }
        throw error;
      }

      toast({
        title: "Account created! ✨",
        description: "Please check your email to verify your account.",
      });
      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header/Navbar */}
      <Header />
      
      <div className="flex-1 flex">
        {/* Left Side - Branding (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          
          {/* Floating Shapes */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-primary/30 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 7, repeat: Infinity }}
          />
          
          {/* Content - Positioned at Bottom Left */}
          <div className="relative z-10 flex flex-col justify-end h-full px-12 xl:px-16 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Dynamic Title based on tab */}
              <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-4">
                {activeTab === "login" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-sm mb-8">
                {activeTab === "login" 
                  ? "Enter your credentials to continue your journey" 
                  : "Fill in your details to get started with Orion"}
              </p>
              
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">25+</p>
                  <p className="text-xs text-muted-foreground">Bank Partners</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">2 min</p>
                  <p className="text-xs text-muted-foreground">Avg Decision</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">5</p>
                  <p className="text-xs text-muted-foreground">AI Agents</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex flex-col bg-card lg:mt-20 lg:bg-transparent">
          {/* Mobile Header - Back button only on mobile */}
          <header className="p-4 pt-6 lg:hidden">
            <button 
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </header>

          <main className="flex-1 flex flex-col justify-center px-6 pt-2 pb-8 lg:pt-0 lg:pb-0 lg:px-12 xl:px-16">
            <div className="w-full max-w-md mx-auto lg:mx-0">
              {/* Mobile Title Only */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 lg:hidden"
              >
                <h1 className="text-3xl font-bold text-foreground leading-tight">
                  {activeTab === "login" ? "Welcome back" : "Create account"}
                </h1>
                <p className="text-muted-foreground mt-3 text-sm">
                  {activeTab === "login" 
                    ? "Enter your credentials to continue" 
                    : "Fill in your details to get started"}
                </p>
              </motion.div>

              {/* Card Container */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-xl lg:shadow-2xl"
              >
              {/* Tab Switcher */}
              <div className="flex p-1 bg-muted rounded-2xl mb-6">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "register"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                {activeTab === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                  <Input 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    className="pl-12 h-12 rounded-xl bg-muted/50 border-border"
                                    autoComplete="email"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"}
                                    className="pl-12 pr-12 h-12 rounded-xl bg-muted/50 border-border"
                                    autoComplete="current-password"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Remember me & Forgot password */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="remember" 
                              checked={rememberMe} 
                              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
                          </div>
                          <button type="button" className="text-sm text-primary hover:underline font-medium">
                            Forgot Password?
                          </button>
                        </div>

                        {/* Login Button */}
                        <Button 
                          type="submit"
                          disabled={isLoading} 
                          className="w-full h-12 rounded-xl font-semibold"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={signupForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">First Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input 
                                      placeholder="John" 
                                      className="pl-12 h-12 rounded-xl bg-muted/50 border-border"
                                      autoComplete="given-name"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Last Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input 
                                      placeholder="Doe" 
                                      className="pl-12 h-12 rounded-xl bg-muted/50 border-border"
                                      autoComplete="family-name"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                  <Input 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    className="pl-12 h-12 rounded-xl bg-muted/50 border-border"
                                    autoComplete="email"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"}
                                    className="pl-12 pr-12 h-12 rounded-xl bg-muted/50 border-border"
                                    autoComplete="new-password"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground mt-1">
                                Min 8 characters with uppercase, lowercase, and number
                              </p>
                            </FormItem>
                          )}
                        />

                        {/* Register Button */}
                        <Button 
                          type="submit"
                          disabled={isLoading} 
                          className="w-full h-12 rounded-xl font-semibold"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social Login Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-4 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl" 
                disabled={isLoading} 
                onClick={handleGoogleAuth}
              >
                <svg className="mr-3 h-5 w-5" aria-hidden="true" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continue with Google
              </Button>

              {/* Terms */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                By continuing, you agree to our{" "}
                <span className="underline cursor-pointer hover:text-foreground" onClick={() => navigate("/terms")}>Terms</span>
                {" "}and{" "}
                <span className="underline cursor-pointer hover:text-foreground" onClick={() => navigate("/privacy")}>Privacy Policy</span>
              </p>
            </motion.div>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
