import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { SimpleWorkflowGraph } from "@/components/workflow-graph";
import { USE_MOCK_DATA } from "@/lib/queryClient";
import { motion } from "framer-motion";
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
  Award
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

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [hoveredMode, setHoveredMode] = useState<"standard" | "agentic" | null>(null);

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
    { value: "10K+", label: "Happy Users", icon: Users },
    { value: "4.9★", label: "Rating", icon: Award }
  ];

  const trustedBy = [
    "Leading Banks", "FinTech Partners", "NBFCs", "Credit Unions"
  ];

  const team = [
    { name: "Ananay Dubey", role: "System Design & Integration", org: "PEC Chandigarh" },
    { name: "Shikhar Yadav", role: "Agent Architecture", org: "PSIT Kanpur" },
    { name: "Shikhar Dubey", role: "Presentation & Chat UI", org: "PSIT Kanpur" },
    { name: "Ishan Gupta", role: "Code Quality & Deployment", org: "KIET Ghaziabad" },
    { name: "Shaurya Gautam", role: "UI/UX Designer", org: "PSIT Kanpur" }
  ];

  const techStack = [
    { category: "Frontend", tools: "Next.js, TailwindCSS, ShadCN UI" },
    { category: "Backend", tools: "FastAPI, Python" },
    { category: "AI Layer", tools: "Google Gemini 2.5, LangChain" },
    { category: "Database", tools: "Supabase Auth & DB" }
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
      {/* Global Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -50, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -left-[20%] w-[70vw] h-[70vw] bg-purple-500/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 60, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-blue-500/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [0, -40, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-[120px]"
        />
      </div>

      <main className={cn("pt-16 relative z-10", USE_MOCK_DATA && "pt-24")}>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Local Hero Background Elements (Subtler now) */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-0 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div 
                className="space-y-8"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <div className="space-y-6">
                  <motion.div 
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium backdrop-blur-md"
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
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                  >
                    Banking that feels <br />
                    <span className="relative inline-block">
                      <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient-x">
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
                    <span className="text-3xl md:text-5xl lg:text-6xl block mt-2 text-muted-foreground font-medium">
                      powered by AI.
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    variants={fadeInUp}
                    className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed font-light"
                  >
                    Project Orion isn't just a tool. It's your financial partner, orchestrating complex workflows with the simplicity of a conversation.
                  </motion.p>
                </div>

                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-5"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg"
                      onClick={() => navigate("/agentic")}
                      className="h-12 px-8 text-base gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all w-full sm:w-auto"
                    >
                      <Bot className="h-5 w-5" />
                      Try Agentic Mode
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/standard")}
                      className="h-12 px-8 text-base gap-2 rounded-full border-2 hover:bg-muted/50 w-full sm:w-auto"
                    >
                      <FileText className="h-5 w-5" />
                      Standard Mode
                    </Button>
                  </motion.div>
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
                  className="relative p-6 bg-background/60 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden" 
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

        {/* Stats Section */}
        <section className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm">
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

        {/* Problem vs Solution */}
        <section className="py-24 relative overflow-hidden">
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

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Project Orion?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built with cutting-edge technology to deliver the fastest, most secure loan processing experience.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <SpotlightCard
                    className="p-8 text-center h-full"
                    spotlightColor="rgba(var(--primary), 0.15)"
                    hoverScale
                  >
                    <motion.div 
                      className={cn("h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6", feature.color)}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light -z-10" />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Built on Giants</h2>
              <p className="text-muted-foreground">The modern stack powering the next generation of fintech.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {techStack.map((tech, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, rotate: i % 2 === 0 ? 1 : -1 }}
                  className="group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 p-8 backdrop-blur-md shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h4 className="text-xl font-bold text-foreground mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {tech.category}
                  </h4>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {tech.tools.split(', ').map((tool, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-background/40 text-sm font-medium border border-black/5 dark:border-white/5 text-muted-foreground group-hover:text-foreground group-hover:border-primary/20 transition-all">
                        {tool}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
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
                className="text-center mb-24"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">The Creators</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Crafted with passion by a team of innovators.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 xl:gap-6 justify-items-center">
                {team.map((member, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="relative group w-full max-w-[240px]"
                  >
                    {/* Premium Glass Card */}
                    <div className="relative h-80 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col items-center text-center overflow-hidden transition-all duration-500 group-hover:border-primary/30 group-hover:bg-white/10 group-hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]">
                       
                       {/* Subtle Gradient Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                       {/* Avatar */}
                       <div className="relative mb-6 mt-2">
                         <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                           <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                              <span className="text-3xl font-bold text-white/90">{member.name.charAt(0)}</span>
                           </div>
                         </div>
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Dev</span>
                         </div>
                       </div>

                       <div className="relative z-10 w-full">
                          <h4 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">{member.org}</p>
                          
                          <div className="h-px w-12 bg-white/10 mx-auto mb-4 group-hover:w-24 group-hover:bg-primary/50 transition-all duration-500" />
                          
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">{member.role}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
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
                className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Agentic Chat
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </section>
        {/* Trusted By Section */}
        <section className="py-12 border-t border-white/5 bg-white/5 backdrop-blur-sm">
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
      </main>

      <Footer />
    </div>
  );
}
