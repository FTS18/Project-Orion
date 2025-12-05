import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { SimpleWorkflowGraph } from "@/components/workflow-graph";
import { 
  ArrowRight, 
  Bot, 
  Shield, 
  Zap, 
  FileText,
  Users,
  Calculator,
  CheckCircle2,
  Clock,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [hoveredMode, setHoveredMode] = useState<"standard" | "agentic" | null>(null);

  const features = [
    {
      icon: <Shield className="h-6 w-6" aria-hidden="true" />,
      title: "Secure Processing",
      description: "Bank-grade security with encrypted data handling and verified KYC"
    },
    {
      icon: <Zap className="h-6 w-6" aria-hidden="true" />,
      title: "Instant Decisions",
      description: "Get loan decisions in minutes with our automated underwriting system"
    },
    {
      icon: <Bot className="h-6 w-6" aria-hidden="true" />,
      title: "AI-Powered",
      description: "Multi-agent AI system for intelligent loan processing and recommendations"
    }
  ];

  const modes = [
    {
      id: "standard" as const,
      title: "Standard Mode",
      subtitle: "Traditional Wizard Flow",
      description: "Step-by-step guided process with manual form filling, document upload, and clear progression through each stage.",
      features: ["4-step wizard process", "Manual data entry", "Document upload", "Progress tracking"],
      icon: <FileText className="h-8 w-8" aria-hidden="true" />,
      cta: "Start Application"
    },
    {
      id: "agentic" as const,
      title: "Agentic AI Mode",
      subtitle: "Intelligent Conversation",
      description: "Chat with our AI assistant that coordinates multiple specialized agents to handle your loan application seamlessly.",
      features: ["Natural conversation", "Multi-agent system", "Real-time insights", "Automated processing"],
      icon: <Bot className="h-8 w-8" aria-hidden="true" />,
      cta: "Chat with AI"
    }
  ];

  const stats = [
    { value: "2 min", label: "Average Decision Time" },
    { value: "98%", label: "Approval Rate" },
    { value: "₹50L+", label: "Maximum Loan Amount" },
    { value: "24/7", label: "AI Availability" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <section 
          className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    <span>Powered by Multi-Agent AI</span>
                  </div>
                  
                  <h1 
                    id="hero-heading"
                    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                  >
                    Smart Loan Processing with{" "}
                    <span className="text-primary">AI Agents</span>
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-lg">
                    Experience the future of lending. Choose between our guided wizard 
                    or let AI agents handle your loan application from start to finish.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    onClick={() => navigate("/standard")}
                    className="gap-2 text-base"
                    data-testid="button-start-standard"
                  >
                    <FileText className="h-5 w-5" aria-hidden="true" />
                    Standard Mode
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/agentic")}
                    className="gap-2 text-base"
                    data-testid="button-start-agentic"
                  >
                    <Bot className="h-5 w-5" aria-hidden="true" />
                    Agentic AI Mode
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-6 pt-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center sm:text-left">
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden lg:block animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                <Card className="p-8 bg-card/50 backdrop-blur">
                  <div className="mb-6 text-center">
                    <h3 className="text-lg font-semibold">AI Agent Workflow</h3>
                    <p className="text-sm text-muted-foreground">See how our agents collaborate</p>
                  </div>
                  <SimpleWorkflowGraph />
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section 
          className="py-16 md:py-24 bg-muted/30"
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl font-bold mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Combining cutting-edge AI with robust security for a seamless lending experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="p-6 text-center hover-elevate"
                  data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section 
          className="py-16 md:py-24"
          aria-labelledby="modes-heading"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 id="modes-heading" className="text-3xl font-bold mb-4">
                Choose Your Experience
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Two powerful ways to apply for your loan - pick the one that suits you best
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {modes.map((mode) => (
                <Card 
                  key={mode.id}
                  className={cn(
                    "p-8 transition-all duration-300 cursor-pointer",
                    hoveredMode === mode.id && "ring-2 ring-primary shadow-lg"
                  )}
                  onMouseEnter={() => setHoveredMode(mode.id)}
                  onMouseLeave={() => setHoveredMode(null)}
                  onClick={() => navigate(`/${mode.id}`)}
                  data-testid={`mode-card-${mode.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/${mode.id}`)}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                      "h-16 w-16 rounded-xl flex items-center justify-center transition-colors",
                      hoveredMode === mode.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {mode.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground">{mode.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{mode.description}</p>

                  <ul className="space-y-3 mb-8">
                    {mode.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full gap-2"
                    variant={hoveredMode === mode.id ? "default" : "outline"}
                  >
                    {mode.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section 
          className="py-16 md:py-24 bg-muted/30"
          aria-labelledby="how-it-works-heading"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 id="how-it-works-heading" className="text-3xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered system makes loan processing simple and transparent
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: "Select Customer", description: "Choose from pre-approved customers or enter details", icon: <Users className="h-5 w-5" /> },
                { step: 2, title: "Verification", description: "Automated KYC verification against CRM records", icon: <Shield className="h-5 w-5" /> },
                { step: 3, title: "Underwriting", description: "AI-powered credit assessment and decision", icon: <Calculator className="h-5 w-5" /> },
                { step: 4, title: "Sanction Letter", description: "Instant approval letter generation and download", icon: <FileText className="h-5 w-5" /> },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="relative mb-4">
                    <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-lg font-bold">
                      {item.step}
                    </div>
                    {item.step < 4 && (
                      <div className="hidden md:block absolute top-1/2 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border -translate-y-1/2" />
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-6">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>100% Secure & Private</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers who have streamlined their loan applications with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/standard")}
                className="gap-2"
                data-testid="button-cta-standard"
              >
                <Clock className="h-5 w-5" aria-hidden="true" />
                Apply Now
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/agentic")}
                className="gap-2"
                data-testid="button-cta-agentic"
              >
                <Bot className="h-5 w-5" aria-hidden="true" />
                Try AI Assistant
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>Agentic AI Loan Assistant - Dual Mode Application</p>
          <p className="mt-1">Built with AI-powered multi-agent orchestration</p>
        </div>
      </footer>
    </div>
  );
}
