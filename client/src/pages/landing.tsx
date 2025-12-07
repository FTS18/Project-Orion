import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { SimpleWorkflowGraph } from "@/components/workflow-graph";
import { FeaturedLoans } from "@/components/featured-loans";
import { TextReveal } from "@/components/text-reveal";
import { USE_MOCK_DATA } from "@/lib/queryClient";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { 
  ArrowRight, 
  Bot, 
  Shield, 
  Zap, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Award,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const ScrollRevealWord = ({ children, progress, range }: { children: string; progress: any; range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-3 inline-block font-syne md:font-sans">
      {children}
    </motion.span>
  );
};

export default function LandingPage() {
  const [, navigate] = useLocation();

  const [hoveredMode, setHoveredMode] = useState<"standard" | "agentic" | null>(null);
  
  // Mouse Move Effect
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();
  const springConfig = { stiffness: 100, damping: 30, mass: 0.2 };
  
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const revealContainerRef = useRef(null);
  const { scrollYProgress: revealProgress } = useScroll({
    target: revealContainerRef,
    offset: ["start 0.9", "end 0.5"]
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = clientX / innerWidth;
      const y = clientY / innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const x1 = useTransform(mouseX, [0, 1], [-50, 50]);
  const y1 = useTransform(mouseY, [0, 1], [-50, 50]);
  const x2 = useTransform(mouseX, [0, 1], [30, -30]);
  const y2 = useTransform(mouseY, [0, 1], [30, -30]);
  const x3 = useTransform(mouseX, [0, 1], [-20, 20]);
  const y3 = useTransform(mouseY, [0, 1], [-20, 20]);
  const x4 = useTransform(mouseX, [0, 1], [40, -40]);
  const y4 = useTransform(mouseY, [0, 1], [40, -40]);

  const features = [
    {
      icon: <Shield className="h-6 w-6" aria-hidden="true" />,
      title: "Bank-Grade Security",
      description: "End-to-end encryption with automated KYC verification ensuring your data stays safe.",
      color: "text-green-500"
    },
    {
      icon: <Zap className="h-6 w-6" aria-hidden="true" />,
      title: "Lightning Fast",
      description: "Get approved in under 2 minutes with our real-time underwriting engine.",
      color: "text-yellow-500"
    },
    {
      icon: <Bot className="h-6 w-6" aria-hidden="true" />,
      title: "AI Orchestration",
      description: "5 specialized agents working in harmony to process your application instantly.",
      color: "text-purple-500"
    }
  ];

  const modes = [
    {
      id: "standard" as const,
      title: "Standard Application",
      subtitle: "Self-Guided Flow",
      description: "Traditional step-by-step process. Perfect if you prefer filling forms at your own pace.",
      features: ["Structured wizard", "Manual document upload", "Clear progress tracking"],
      icon: <FileText className="h-8 w-8" aria-hidden="true" />,
      cta: "Start Application",
      gradient: "from-blue-500/20 to-cyan-500/20",
      accentColor: "blue"
    },
    {
      id: "agentic" as const,
      title: "Agentic AI Experience",
      subtitle: "Conversational Interface",
      description: "Chat with our intelligent assistant. It handles the complexity while you just answer simple questions.",
      features: ["Natural language chat", "Auto-negotiation", "Instant feedback"],
      icon: <Sparkles className="h-8 w-8" aria-hidden="true" />,
      cta: "Chat with AI",
      gradient: "from-purple-500/20 to-pink-500/20",
      accentColor: "purple"
    }
  ];

  const stats = [
    { value: "2 min", label: "Decision Time", icon: Clock },
    { value: "99.9%", label: "Uptime", icon: TrendingUp },
    { value: "25+", label: "Bank Products", icon: Users },
    { value: "4.9★", label: "Rating", icon: Award }
  ];

  const trustedBy = [
    "Leading Banks", "FinTech Partners", "NBFCs", "Credit Unions"
  ];

  const team = [
    { name: "Ananay Dubey", role: "System Design & Integration", org: "PEC Chandigarh" },
    { name: "Shikhar Yadav", role: "Agent Architecture", org: "PSIT Kanpur" },
    { name: "Ishan Gupta", role: "Code Quality & Deployment", org: "KIET Ghaziabad" },
    { name: "Shikhar Dubey", role: "Presentation & Chat UI", org: "PSIT Kanpur" },
    { name: "Shaurya Gautam", role: "UI/UX Designer", org: "PSIT Kanpur" }
  ];

  const techStack = [
    { category: "Frontend", tools: "React, Vite, TailwindCSS, ShadCN UI, Framer Motion" },
    { category: "Backend", tools: "FastAPI, Python, Express.js, Node.js" },
    { category: "AI/ML", tools: "Google Gemini 2.5, LangChain, CrewAI" },
    { category: "Database", tools: "Supabase, PostgreSQL, Drizzle ORM" }
  ];

  const faqs = [
    {
      question: "How does the AI agent actually work?",
      answer: "Our AI agents are built on advanced Large Language Models (LLMs) that understand natural language. They act as your personal banker, guiding you through the application, answering your questions, and even negotiating terms in real-time—just like a human would, but instantly."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-grade 256-bit encryption for all data transmission and storage. We are fully compliant with GDPR and financial regulations. Your sensitive data is never used to train our public models without your explicit consent."
    },
    {
      question: "How fast is the approval process?",
      answer: "Lightning fast. Our real-time underwriting engine processes thousands of data points in seconds. Most users receive a decision in under 2 minutes after completing their application, compared to days with traditional banks."
    },
    {
      question: "Can I switch between Standard and Agentic modes?",
      answer: "Yes! We believe in flexibility. You can start chatting with the AI and, if you prefer, switch to the standard form view at any time. Your progress is automatically saved and synced between both modes."
    }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-primary/20 relative">
      <Header />
      
      {USE_MOCK_DATA && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-0 right-0 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-500/10 backdrop-blur-sm z-40"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-center gap-2 text-xs md:text-sm">
            <AlertCircle className="h-3 w-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">Demo Environment Active</span>
          </div>
        </motion.div>
      )}
      
      {/* Global Animated Background */}
      {/* Global Animated Background - Optimized */}
      {/* Global Animated Background - Optimized for Performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* 
           PERFORMANCE NOTE: 
           We replaced the expensive `blur-[100px]` filter with `radial-gradient`.
           CSS Gradients are much cheaper for the GPU to render than real-time gaussian blurs.
           We also use `will-change-transform` to hint the browser to promote these to layers.
        */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        
        {/* Desktop Only Animations - Hidden on mobile/tablet to prevent lag */}
        <div className="hidden md:block">
          <motion.div 
            style={{ x: x1, y: y1 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent will-change-transform transform-gpu"
          />
          <motion.div 
            style={{ x: x2, y: y2 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[20%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-purple-500/5 to-transparent will-change-transform transform-gpu"
          />
          <motion.div 
            style={{ x: x3, y: y3 }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent will-change-transform transform-gpu"
          />
          <motion.div 
            style={{ x: x4, y: y4 }}
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 6 }}
            className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-emerald-500/5 to-transparent will-change-transform transform-gpu"
          />
        </div>

        {/* Mobile Static Fallback - Lightweight */}
        <div className="md:hidden absolute inset-0">
           <div className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-primary/10 blur-3xl" />
           <div className="absolute top-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-purple-500/10 blur-3xl" />
           <div className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 blur-3xl" />
        </div>
      </div>

      <main className={cn("pt-16 relative z-10", USE_MOCK_DATA && "pt-24")}>
        {/* Hero Section */}
        <section className="relative flex flex-col justify-center items-center overflow-hidden py-12 lg:py-0 lg:min-h-[90vh]">
          {/* Mobile Background Pattern - Enhanced visibility */}
          <div className="absolute inset-0 md:hidden opacity-[0.05] z-0 pointer-events-none" 
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
               }} 
          />
          
          {/* Mobile Vibrant Gradient Blob - Fills the visual void */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-full blur-[80px] -z-10 md:hidden animate-pulse" />

          {/* Local Hero Background Elements */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div 
                className="space-y-8 text-center lg:text-left"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <div className="space-y-6">
                  <motion.div 
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-background/50 border border-primary/20 rounded-full text-primary text-xs md:text-sm font-medium backdrop-blur-md mx-auto lg:mx-0 shadow-sm"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </motion.div>
                    <span>Next-Gen Lending Platform</span>
                  </motion.div>
                  
                  <motion.h1 
                    variants={fadeInUp}
                    className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
                  >
                    Banking that feels <br />
                    <span className="relative inline-block">
                      <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient-x font-syne">
                        human
                      </span>
                      <motion.svg
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                        className="absolute -bottom-2 left-0 w-full h-3 text-primary/30 -z-10"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                      >
                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                      </motion.svg>
                    </span>
                    <span className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl block mt-2 text-muted-foreground font-medium">
                      powered by AI.
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    variants={fadeInUp}
                    className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-light"
                  >
                    Project Orion isn't just a tool. It's your financial partner, orchestrating complex workflows with the simplicity of a conversational interface.
                  </motion.p>
                </div>

                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button 
                      size="lg"
                      onClick={() => navigate("/agentic")}
                      className="relative h-14 sm:h-12 px-8 text-lg sm:text-base gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all w-full sm:w-auto overflow-hidden group font-semibold"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                      <Bot className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">Try Agentic Mode</span>
                      <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/standard")}
                      className="h-14 sm:h-12 px-8 text-lg sm:text-base gap-2 rounded-full border-2 hover:bg-muted/50 w-full sm:w-auto bg-background/50 backdrop-blur-sm"
                    >
                      <FileText className="h-5 w-5" />
                      Standard Mode
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Mobile Stats - Instantly Visible & Premium */}
                <motion.div 
                  variants={fadeInUp}
                  className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/50 md:hidden w-full"
                >
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-background/40 backdrop-blur-sm border border-border/50">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="h-4 w-4 text-primary" />
                          <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>

              <motion.div 
                className="relative hidden lg:block"
                initial={{ opacity: 0, x: 50, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/5 rounded-3xl transform rotate-3 scale-105" />
                <SpotlightCard 
                  className="relative p-6 bg-white/40 dark:bg-black/40 backdrop-blur-md border-black/5 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden" 
                  spotlightColor="rgba(var(--primary), 0.15)"
                  hoverScale
                >

                  <div className="mb-8 text-center space-y-2">
                    <h3 className="text-xl font-semibold">Live Orchestration</h3>
                    <p className="text-sm text-muted-foreground">Watch agents collaborate in real-time</p>
                  </div>
                  <SimpleWorkflowGraph />
                </SpotlightCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - Desktop Only (Mobile has it in Hero) */}
        <section className="hidden md:block py-12 border-y border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center justify-center text-center group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                      <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* Large Text Reveal Section */}
        <div ref={revealContainerRef} className="py-24 max-w-7xl mx-auto px-4 md:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Large Text */}
              <div className="text-left">
                  <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
                    {"We're not a bank. We're your intelligent partner connecting you to the best lenders, instantly.".split(" ").map((word, i, arr) => {
                       const start = i / arr.length;
                       const end = start + (1 / arr.length);
                       return (
                         <ScrollRevealWord key={i} progress={revealProgress} range={[start, end]}>
                           {word}
                         </ScrollRevealWord>
                       );
                    })}
                  </h3>
              </div>
              
              {/* Right: Image (Desktop Only) */}
              <div className="hidden lg:block relative h-[500px] w-full">
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-3xl blur-3xl transform rotate-6 scale-90" />
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                    whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/50"
                 >
                   <img 
                     src="/partner-network.png"
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     alt="Intelligent Partner Network"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                 </motion.div>
              </div>
           </div>
        </div>

        {/* Featured Loans Section */}
        <FeaturedLoans />

        {/* Problem vs Solution */}
        <section className="py-24 relative overflow-hidden bg-background z-20">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl -z-20" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light -z-10" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-red-500/5 via-background to-green-500/5 blur-3xl -z-30"
          />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Banking Shouldn't Be Boring</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We replaced the paperwork with intelligence.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 backdrop-blur-sm hover:bg-red-500/10 transition-colors"
              >
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-3 mb-6">
                  <AlertCircle className="h-6 w-6" /> The Old Way
                </h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-red-500" /> <span>Endless forms & confusing jargon</span></li>
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-red-500" /> <span>Days of waiting for a simple "Yes"</span></li>
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-red-500" /> <span>Manual document uploads & errors</span></li>
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-red-500" /> <span>Zero personalization</span></li>
                </ul>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-3xl bg-green-500/5 border border-green-500/10 backdrop-blur-sm hover:bg-green-500/10 transition-colors"
              >
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6" /> The Orion Way
                </h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-green-500" /> <span>Just chat like you're talking to a friend</span></li>
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-green-500" /> <span>Instant approval in minutes, not days</span></li>
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-green-500" /> <span>AI handles the heavy lifting (KYC, Docs)</span></li>
                  <li className="flex gap-3 items-center"><span className="h-2 w-2 rounded-full bg-green-500" /> <span>Tailored offers that fit your life</span></li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section - Why Choose Us - User Benefits */}
        <section className="py-24 relative bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Orion?</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Built for the modern borrower.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1 - No More Paperwork */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative overflow-hidden rounded-3xl p-8 h-[380px] flex flex-col justify-between"
                style={{ background: 'linear-gradient(135deg, #CAFF2B 0%, #E5FF80 100%)' }}
              >
                <div>
                  <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Zero Paperwork</h3>
                  <p className="text-black/70 text-sm leading-relaxed">
                    Just chat naturally. Our AI extracts all your details, fetches documents via DigiLocker, and handles everything digitally.
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-black">100%</p>
                  <p className="text-sm text-black/60 uppercase tracking-wider">Digital Journey</p>
                </div>
              </motion.div>

              {/* Card 2 - Best Rates Guaranteed */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative overflow-hidden rounded-3xl p-8 h-[380px] flex flex-col justify-between"
                style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA8C6 100%)' }}
              >
                <div>
                  <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Best Rates First</h3>
                  <p className="text-black/70 text-sm leading-relaxed">
                    We compare 25+ banks instantly and show you the best rates. No hidden fees, no fine print surprises.
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-black">₹2,400</p>
                  <p className="text-sm text-black/60 uppercase tracking-wider">Avg. Yearly Savings</p>
                </div>
              </motion.div>

              {/* Card 3 - Instant Pre-Approval */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative overflow-hidden rounded-3xl p-8 h-[380px] flex flex-col justify-between"
                style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #7FFFDD 100%)' }}
              >
                <div>
                  <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Know Before You Apply</h3>
                  <p className="text-black/70 text-sm leading-relaxed">
                    Get pre-approved offers without affecting your credit score. Apply with confidence when you're ready.
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-black">Soft Pull</p>
                  <p className="text-sm text-black/60 uppercase tracking-wider">No Score Impact</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tech Stack - CSS Marquee */}
        <section className="py-16 relative overflow-hidden bg-background">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-background via-background/90 to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-background via-background/90 to-transparent z-20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold mb-2"
              >
                Built on Giants
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                The modern stack powering next-gen fintech
              </motion.p>
            </div>
            
            {/* Marquee Rows */}
            <div className="space-y-3">
              {/* Row 1 */}
              <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex gap-3 animate-marquee">
                  {[...Array(3)].flatMap((_, setIdx) => [
                    { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB" },
                    { name: "Vite", icon: "https://cdn.simpleicons.org/vite/646CFF" },
                    { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6" },
                    { name: "TailwindCSS", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
                    { name: "Framer", icon: "https://cdn.simpleicons.org/framer/FF0066" },
                    { name: "ShadCN", icon: "https://cdn.simpleicons.org/shadcnui/ffffff" },
                    { name: "Zod", icon: "https://cdn.simpleicons.org/zod/3E67B1" },
                    { name: "React Query", icon: "https://cdn.simpleicons.org/reactquery/FF4154" },
                  ].map((tech, i) => (
                    <div
                      key={`${setIdx}-${i}-${tech.name}`}
                      className="h-12 rounded-xl bg-muted/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 flex items-center gap-2.5 px-4 shrink-0 hover:border-black/20 dark:hover:border-white/30 hover:bg-muted dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <img src={tech.icon} alt={tech.name} className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">{tech.name}</span>
                    </div>
                  )))}
                </div>
              </div>
              
              {/* Row 2 - Reverse */}
              <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex gap-3 animate-marquee-reverse">
                  {[...Array(3)].flatMap((_, setIdx) => [
                    { name: "Python", icon: "https://cdn.simpleicons.org/python/3776AB" },
                    { name: "FastAPI", icon: "https://cdn.simpleicons.org/fastapi/009688" },
                    { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/339933" },
                    { name: "Express", icon: "https://cdn.simpleicons.org/express/ffffff" },
                    { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/4169E1" },
                    { name: "Supabase", icon: "https://cdn.simpleicons.org/supabase/3FCF8E" },
                    { name: "Drizzle", icon: "https://cdn.simpleicons.org/drizzle/C5F74F" },
                    { name: "Redis", icon: "https://cdn.simpleicons.org/redis/DC382D" },
                  ].map((tech, i) => (
                    <div
                      key={`${setIdx}-${i}-${tech.name}`}
                      className="h-12 rounded-xl bg-muted/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 flex items-center gap-2.5 px-4 shrink-0 hover:border-black/20 dark:hover:border-white/30 hover:bg-muted dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <img src={tech.icon} alt={tech.name} className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">{tech.name}</span>
                    </div>
                  )))}
                </div>
              </div>
              
              {/* Row 3 */}
              <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex gap-3 animate-marquee-slow">
                  {[...Array(4)].flatMap((_, setIdx) => [
                    { name: "Google Gemini", icon: "https://cdn.simpleicons.org/googlegemini/8E75B2" },
                    { name: "LangChain", icon: "https://cdn.simpleicons.org/langchain/1C3C3C" },
                    { name: "OpenAI", icon: "https://cdn.simpleicons.org/openai/00A67E" },
                    { name: "CrewAI", icon: "https://cdn.simpleicons.org/crewai/FF6B35" },
                    { name: "Hugging Face", icon: "https://cdn.simpleicons.org/huggingface/FFD21E" },
                  ].map((tech, i) => (
                    <div
                      key={`${setIdx}-${i}-${tech.name}`}
                      className="h-12 rounded-xl bg-muted/80 dark:bg-zinc-900/80 border border-black/5 dark:border-white/10 flex items-center gap-2.5 px-4 shrink-0 hover:border-black/20 dark:hover:border-white/30 hover:bg-muted dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <img src={tech.icon} alt={tech.name} className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">{tech.name}</span>
                    </div>
                  )))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid - Platform Capabilities */}
        <section className="py-16 relative overflow-hidden bg-background">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Under The Hood</h2>
              <p className="text-sm text-muted-foreground">The technology powering your experience</p>
            </motion.div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {/* Card 1 - Multi-Agent System */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="col-span-4 md:col-span-3 row-span-2 relative rounded-[2rem] overflow-hidden p-6 md:p-8 flex flex-col justify-end min-h-[200px] md:min-h-[280px]"
                style={{ background: 'linear-gradient(145deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)' }}
              >
                {/* Floating Shapes */}
                <div className="absolute top-6 right-6 w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/20 blur-2xl animate-pulse" />
                <div className="absolute top-12 right-16 w-12 h-12 md:w-20 md:h-20 rounded-full bg-white/40 backdrop-blur-sm" />
                <div className="absolute bottom-20 left-1/3 w-8 h-8 rotate-45 bg-white/20" />
                <div className="relative z-10">
                  <p className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight">5 Agents</p>
                  <p className="text-white/70 text-sm md:text-base font-medium">Working In Parallel</p>
                </div>
              </motion.div>
              
              {/* Card 2 - Bank Integrations */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="col-span-2 md:col-span-1 row-span-2 relative rounded-[1.5rem] overflow-hidden p-4 md:p-5 flex flex-col justify-between bg-muted dark:bg-zinc-900/90 border border-black/5 dark:border-white/10 min-h-[160px]"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/10 flex items-center justify-center backdrop-blur">
                  <Building2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-black text-foreground">25+</p>
                  <p className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider">Banks</p>
                </div>
              </motion.div>
              
              {/* Card 3 - Processing Speed */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ rotate: 2, scale: 1.05 }}
                className="col-span-2 row-span-2 relative rounded-[2.5rem] overflow-hidden p-5 flex flex-col justify-center items-center"
                style={{ background: 'linear-gradient(160deg, #F59E0B 0%, #D97706 100%)' }}
              >
                {/* Decorative blob */}
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-black/10" />
                <p className="text-5xl md:text-6xl font-black text-white relative z-10">2s</p>
                <p className="text-white/80 text-xs font-medium relative z-10">Response Time</p>
              </motion.div>

              {/* Row 2 - Mixed sizes */}
              
              {/* Card 4 - DigiLocker Integration */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="col-span-2 md:col-span-2 relative rounded-2xl overflow-hidden p-4 md:p-5 bg-muted dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-black/5 dark:border-white/5 min-h-[120px]"
              >
                {/* Triangle accent */}
                <svg className="absolute top-0 right-0 w-24 h-24 opacity-10" viewBox="0 0 100 100">
                  <polygon points="0,0 100,0 100,100" fill="currentColor" className="text-primary" />
                </svg>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <FileText className="w-7 h-7 text-primary" />
                  <div>
                    <p className="text-base md:text-lg font-bold text-foreground">DigiLocker</p>
                    <p className="text-muted-foreground text-[10px]">Auto Doc Fetch</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Card 5 - Security (pill) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, rotate: -1 }}
                className="col-span-2 relative rounded-[3rem] overflow-hidden p-4 flex flex-col justify-center items-center min-h-[100px]"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              >
                <p className="text-3xl md:text-4xl font-black text-white">256-bit</p>
                <p className="text-white/80 text-[10px]">Encryption</p>
              </motion.div>
              
              {/* Card 6 - API-First */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -4 }}
                className="col-span-2 relative rounded-2xl overflow-hidden p-4 bg-muted dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 min-h-[100px]"
              >
                {/* Dot pattern */}
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                <div className="flex flex-col h-full justify-between relative z-10">
                  <Sparkles className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                  <div>
                    <p className="text-base font-bold text-foreground">AI-Native</p>
                    <p className="text-muted-foreground text-[10px]">Built for LLMs</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mode Selection Section */}
        <section className="py-24 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Experience</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Two powerful ways to apply for your loan. Pick the one that suits your style.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {modes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <SpotlightCard
                    className="p-8 cursor-pointer h-full"
                    spotlightColor={mode.id === "agentic" ? "rgba(168, 85, 247, 0.2)" : "rgba(59, 130, 246, 0.2)"}
                    hoverScale
                    onMouseEnter={() => setHoveredMode(mode.id)}
                    onMouseLeave={() => setHoveredMode(null)}
                    onClick={() => navigate(`/${mode.id}`)}
                  >
                    <motion.div 
                      className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center mb-6",
                        `bg-gradient-to-br ${mode.gradient}`
                      )}
                      animate={hoveredMode === mode.id ? { rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.5, repeat: hoveredMode === mode.id ? Infinity : 0 }}
                    >
                      {mode.icon}
                    </motion.div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">
                      {mode.subtitle}
                    </p>
                    <h3 className="text-2xl font-bold mb-3">{mode.title}</h3>
                    <p className="text-muted-foreground mb-6">{mode.description}</p>
                    <ul className="space-y-3 mb-6">
                      {mode.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          <CheckCircle2 className={cn(
                            "h-4 w-4",
                            mode.accentColor === "purple" ? "text-purple-500" : "text-blue-500"
                          )} />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <Button
                      className="w-full gap-2"
                      variant={mode.id === "agentic" ? "default" : "outline"}
                    >
                      {mode.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-32 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light -z-10" />
           
           <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12 md:mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Creators</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Crafted with passion by innovators.
                </p>
              </motion.div>

              {/* Team Cards - Colorful Gradient Cards */}
              <div className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-3 lg:gap-4">
                {team.map((member, i) => {
                  // More vibrant gradient colors for each card
                  // Dynamic gradients based on Organization
                  const getGradient = (org: string) => {
                    if (org.includes("PEC")) return "linear-gradient(135deg, #FFC107 0%, #FF9800 100%)"; // Gold-Orange-Yellow
                    if (org.includes("PSIT")) return "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)"; // Red
                    if (org.includes("KIET")) return "linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%)"; // Blue-Indigo
                    return "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"; // Default Purple
                  };
                  
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="relative group"
                    >
                      <div 
                        className="relative rounded-2xl p-4 md:p-5 flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-3 overflow-hidden shadow-lg"
                        style={{ background: getGradient(member.org) }}
                      >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 opacity-20">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="80" cy="20" r="30" fill="white" fillOpacity="0.3" />
                            <circle cx="90" cy="40" r="20" fill="white" fillOpacity="0.2" />
                          </svg>
                        </div>
                        
                        {/* Avatar */}
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                          <span className="text-xl md:text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 md:text-center min-w-0">
                          <h4 className="font-bold text-white text-sm md:text-base truncate">{member.name}</h4>
                          <p className="text-white/70 text-[10px] md:text-xs mt-0.5 truncate">{member.role}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                            <span className="text-[10px] text-white/90 font-medium">{member.org}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience the Future?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of users who have switched to our agentic lending platform. Fast, secure, and intelligent.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileHover={{ scale: 1.02 }}
            >
              <Button 
                size="lg"
                onClick={() => navigate("/agentic")}
                className="relative h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                <Sparkles className="h-5 w-5 mr-2 relative z-10" />
                <span className="relative z-10">Start Agentic Chat</span>
                <ArrowRight className="h-5 w-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </section>
        {/* Trusted By Section */}
        <section className="py-12 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
            >
              <span className="text-sm text-muted-foreground font-medium">Trusted by</span>
              {trustedBy.map((name, index) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-lg font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  {name}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about the future of banking.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4 mb-8">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="text-lg font-medium hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/docs?tab=faq")}
                  className="rounded-full px-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  View all FAQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
