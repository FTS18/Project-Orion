import Header from "@/components/header";
import Footer from "@/components/footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  Zap,
  Database,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Navigation (Visual Only for now) */}
            <div className="hidden md:block w-64 shrink-0 space-y-8">
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Getting Started</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="text-primary font-medium">Introduction</li>
                  <li className="hover:text-foreground cursor-pointer">Standard Mode</li>
                  <li className="hover:text-foreground cursor-pointer">Agentic Mode</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-foreground">API Reference</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="hover:text-foreground cursor-pointer">Authentication</li>
                  <li className="hover:text-foreground cursor-pointer">Customers</li>
                  <li className="hover:text-foreground cursor-pointer">Loans</li>
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Documentation</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Everything you need to know about building, integrating, and using Project Orion's advanced loan processing capabilities.
                </p>
              </div>

              <Tabs defaultValue="getting-started" className="w-full space-y-8">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                  <TabsTrigger 
                    value="getting-started" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Guide</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="api" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>API Reference</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="faq" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>FAQ</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                {/* Getting Started Content */}
                <TabsContent value="getting-started" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <SpotlightCard className="h-full" spotlightColor="rgba(var(--primary), 0.1)">
                      <CardHeader>
                        <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                        <h2 className="text-2xl font-bold">Quick Start</h2>
                        <CardDescription>Get up and running in minutes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
                          <div>
                            <h3 className="font-semibold">Select Mode</h3>
                            <p className="text-sm text-muted-foreground">Choose between Standard (Wizard) or Agentic (AI) modes from the dashboard.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</div>
                          <div>
                            <h3 className="font-semibold">Input Data</h3>
                            <p className="text-sm text-muted-foreground">Provide customer details or log in to fetch your profile automatically.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</div>
                          <div>
                            <h3 className="font-semibold">Get Approved</h3>
                            <p className="text-sm text-muted-foreground">Receive an instant decision and download your sanction letter.</p>
                          </div>
                        </div>
                      </CardContent>
                    </SpotlightCard>

                    <div className="space-y-6">
                      <SpotlightCard spotlightColor="rgba(var(--primary), 0.05)">
                        <CardHeader>
                          <h3 className="text-xl font-semibold">Standard Mode</h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            A traditional, step-by-step wizard interface perfect for users who prefer a structured, linear process.
                          </p>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Manual data entry</li>
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Visual progress tracking</li>
                          </ul>
                        </CardContent>
                      </SpotlightCard>

                      <SpotlightCard spotlightColor="rgba(var(--primary), 0.05)">
                        <CardHeader>
                          <h3 className="text-xl font-semibold">Agentic AI Mode</h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            An advanced conversational interface where AI agents collaborate to process your application autonomously.
                          </p>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Natural language interaction</li>
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Real-time multi-agent orchestration</li>
                          </ul>
                        </CardContent>
                      </SpotlightCard>
                    </div>
                  </div>
                </TabsContent>

                {/* API Content */}
                <TabsContent value="api" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SpotlightCard className="overflow-hidden" spotlightColor="rgba(var(--primary), 0.1)">
                    <div className="border-b bg-muted/50 p-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Database className="h-5 w-5" /> Core Endpoints
                      </h2>
                    </div>
                    <div className="divide-y">
                      {[
                        { method: "GET", path: "/api/customers", desc: "List all available customers" },
                        { method: "POST", path: "/api/extract-salary", desc: "Extract salary data from PDF documents" },
                        { method: "POST", path: "/api/verify-kyc", desc: "Perform KYC verification against database" },
                        { method: "POST", path: "/api/underwrite", desc: "Submit application for underwriting decision" },
                        { method: "POST", path: "/api/generate-sanction-letter", desc: "Generate official PDF sanction letter" }
                      ].map((endpoint, i) => (
                        <div key={i} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 font-mono text-sm">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-bold",
                              endpoint.method === "GET" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            )}>
                              {endpoint.method}
                            </span>
                            <span className="text-foreground">{endpoint.path}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{endpoint.desc}</span>
                        </div>
                      ))}
                    </div>
                  </SpotlightCard>
                </TabsContent>

                {/* FAQ Content */}
                <TabsContent value="faq" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                    <CardHeader>
                      <h2 className="text-2xl font-bold mb-2">Common Questions</h2>
                      <CardDescription>Everything you need to know about the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="text-lg">How fast is the approval process?</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Our AI-driven underwriting engine processes applications in real-time. Typically, you can receive a decision within 2-3 minutes of submitting your documents.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="text-lg">Is my financial data secure?</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            Absolutely. We use bank-grade 256-bit encryption for all data transmission and storage. We are fully compliant with data protection regulations and never share your data without consent.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="text-lg">What happens if I get rejected?</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                            If your application is not approved, our AI will provide specific reasons (e.g., low credit score, high debt-to-income ratio). You can address these issues and reapply after 30 days.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </SpotlightCard>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
