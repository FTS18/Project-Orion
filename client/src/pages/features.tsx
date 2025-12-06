import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Shield,
  Zap,
  Brain,
  FileText,
  Users,
  TrendingUp,
  Lock,
  CheckCircle,
  ArrowRight,
  Gauge,
  Cpu,
  Target,
  BarChart3,
  Sparkles
} from "lucide-react";

export default function FeaturesPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Multi-agent AI system with specialized agents for different loan processing stages. Our agents work in parallel to analyze data, verify documents, and assess risk.",
      className: "md:col-span-2 md:row-span-2 bg-indigo-500/10 border-indigo-500/20",
      iconClass: "text-indigo-500 h-12 w-12",
      delay: 0.1
    },
    {
      icon: Zap,
      title: "Instant Decisions",
      description: "Get loan approvals in minutes with automated underwriting.",
      className: "md:col-span-1 bg-amber-500/10 border-amber-500/20",
      iconClass: "text-amber-500 h-8 w-8",
      delay: 0.2
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "256-bit encryption and strict data isolation protocols.",
      className: "md:col-span-1 bg-emerald-500/10 border-emerald-500/20",
      iconClass: "text-emerald-500 h-8 w-8",
      delay: 0.3
    },
    {
      icon: FileText,
      title: "Smart Document Processing",
      description: "Automatic salary extraction and document verification from PDFs using advanced OCR.",
      className: "md:col-span-2 bg-blue-500/10 border-blue-500/20",
      iconClass: "text-blue-500 h-8 w-8",
      delay: 0.4
    },
    {
      icon: Users,
      title: "Multi-Agent Orchestration",
      description: "Seamless coordination between Sales, Verification, and Underwriting agents.",
      className: "md:col-span-1 md:row-span-2 bg-purple-500/10 border-purple-500/20",
      iconClass: "text-purple-500 h-10 w-10",
      delay: 0.5
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Live performance tracking and comprehensive loan analytics.",
      className: "md:col-span-1 bg-rose-500/10 border-rose-500/20",
      iconClass: "text-rose-500 h-8 w-8",
      delay: 0.6
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "Built with regulatory compliance and security best practices.",
      className: "md:col-span-1 bg-cyan-500/10 border-cyan-500/20",
      iconClass: "text-cyan-500 h-8 w-8",
      delay: 0.7
    },
    {
      icon: CheckCircle,
      title: "Dual Mode Processing",
      description: "Choose between guided wizard or AI-assisted conversational flow.",
      className: "md:col-span-3 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20",
      iconClass: "text-primary h-8 w-8",
      delay: 0.8
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Lending</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Powerful Features for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Intelligent Lending
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience cutting-edge AI technology designed specifically for loan processing, 
              combining speed, security, and smart automation.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 auto-rows-[minmax(180px,auto)]">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className={cn(feature.className, "rounded-xl overflow-hidden")}
              >
                <SpotlightCard 
                  className="h-full border-0 bg-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  spotlightColor="rgba(var(--primary), 0.15)"
                >
                  <CardHeader>
                    <feature.icon className={cn("mb-2", feature.iconClass)} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2 text-foreground/80">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-16 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold">Ready to Transform Your Lending Process?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Join thousands of users who have streamlined their loan applications with Project Orion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={() => navigate("/standard")} className="gap-2 h-12 px-8 text-lg shadow-lg shadow-primary/20">
                  <FileText className="h-5 w-5" />
                  Standard Mode
                </Button>
                <Button onClick={() => navigate("/agentic")} variant="outline" className="gap-2 h-12 px-8 text-lg bg-background/50 backdrop-blur-sm">
                  <Brain className="h-5 w-5" />
                  Agentic AI Mode
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
