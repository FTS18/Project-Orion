import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
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
  BarChart3
} from "lucide-react";

export default function FeaturesPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Bank-grade encryption, KYC verification, and comprehensive data protection",
      highlights: ["256-bit encryption", "Verified KYC", "Audit logs"]
    },
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Multi-agent AI system with specialized agents for different loan processing stages",
      highlights: ["5 specialized agents", "Real-time coordination", "Smart routing"]
    },
    {
      icon: Zap,
      title: "Instant Decisions",
      description: "Get loan approvals in minutes with automated underwriting",
      highlights: ["2-min average", "98% uptime", "24/7 availability"]
    },
    {
      icon: FileText,
      title: "Document Processing",
      description: "Automatic salary extraction and document verification from PDFs",
      highlights: ["Auto extraction", "Format agnostic", "Verification included"]
    },
    {
      icon: Users,
      title: "Multi-Agent Orchestration",
      description: "Seamless coordination between specialized loan processing agents",
      highlights: ["Master controller", "Worker agents", "Workflow automation"]
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Real-time performance tracking and comprehensive loan analytics",
      highlights: ["Live metrics", "Decision tracking", "Trend analysis"]
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "Built with regulatory compliance and security best practices",
      highlights: ["Data isolation", "Audit trails", "GDPR compliant"]
    },
    {
      icon: CheckCircle,
      title: "Dual Mode Processing",
      description: "Choose between guided wizard or AI-assisted conversational flow",
      highlights: ["Standard mode", "Agentic mode", "Flexible workflow"]
    }
  ];

  const capabilities = [
    { icon: Gauge, label: "Pre-approval Checks", value: "Instant" },
    { icon: Cpu, label: "Agent Processing", value: "Parallel" },
    { icon: Target, label: "Accuracy Rate", value: "98.5%" },
    { icon: BarChart3, label: "Analytics", value: "Real-time" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Powerful Features for{" "}
              <span className="text-primary">Intelligent Lending</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience cutting-edge AI technology designed specifically for loan processing
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {capabilities.map((cap) => (
              <Card key={cap.label} className="p-6 text-center">
                <cap.icon className="h-8 w-8 text-primary mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-muted-foreground mb-1">{cap.label}</p>
                <p className="text-2xl font-bold text-foreground">{cap.value}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-colors overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <feature.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12 rounded-xl max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Choose between guided wizard mode or conversational AI-assisted processing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => navigate("/standard")} className="gap-2" size="lg">
                <FileText className="h-4 w-4" />
                Standard Mode
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate("/agentic")} variant="outline" className="gap-2" size="lg">
                <Brain className="h-4 w-4" />
                Agentic AI Mode
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
