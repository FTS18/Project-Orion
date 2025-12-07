import { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  Shield,
  Zap,
  Cpu,
  FileText,
  Users,
  Terminal,
  Layers,
  GitBranch,
  Database,
  Globe,
  AlertCircle,
  Check,
  ChevronRight,
  Menu,
  Brain,
  Lock,
  Search,
  MessageSquare,
  Bell
} from "lucide-react";

// --- Components for Docs ---

const CodeBlock = ({ language, code }: { language: string; code: string }) => (
  <div className="relative rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden my-6 group shadow-2xl max-w-[85vw] md:max-w-full">
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
      <span className="text-xs text-zinc-400 font-mono flex items-center gap-2">
        <Terminal className="h-3 w-3" />
        {language}
      </span>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
      </div>
    </div>
    <div className="p-4 overflow-x-auto w-full">
      <pre className="text-sm font-mono text-zinc-300 leading-relaxed custom-scrollbar whitespace-pre">
        {code}
      </pre>
    </div>
  </div>
);

const DocSection = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => (
  <section id={id} className="mb-20 scroll-mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <h2 className="text-3xl font-bold mb-6 tracking-tight text-foreground group flex items-center gap-2">
      {title}
    </h2>
    {children}
  </section>
);

const StepCard = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
  <div className="flex gap-6 mb-10 last:mb-0 group">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-blue-900/20 text-emerald-600 dark:text-blue-400 flex items-center justify-center font-bold text-base border border-emerald-100 dark:border-blue-800 group-hover:scale-110 transition-transform duration-300">
      {number}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-xl mb-3">{title}</h3>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  </div>
);

// --- Main Page Component ---

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, [activeSection]);

  const sections = {
    "getting-started": [
      { id: "introduction", label: "Introduction", icon: BookOpen },
      { id: "quickstart", label: "Quickstart", icon: Zap },
      { id: "architecture", label: "Architecture", icon: Layers },
    ],
    "core-concepts": [
      { id: "agents", label: "Agents & Swarms", icon: Users },
      { id: "workflows", label: "Workflows", icon: GitBranch },
      { id: "security", label: "Security", icon: Shield },
    ],
    "api-reference": [
      { id: "authentication", label: "Authentication", icon: Lock },
      { id: "loans-api", label: "Loans API", icon: FileText },
      { id: "webhooks", label: "Webhooks", icon: Globe },
    ]
  };

  // Mock content renderer based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case "introduction":
        return (
          <>
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-blue-900/20 text-emerald-600 dark:text-blue-400 text-sm font-medium mb-6 border border-emerald-100 dark:border-blue-800">
                 <BookOpen className="h-4 w-4" />
                 Documentation v2.0
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Introduction</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                Project Orion is the operating system for modern lending. We combine traditional RESTful financial primitives with an autonomous Agentic AI swarm to automate the entire loan lifecycle.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="hover:border-emerald-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer bg-gradient-to-br from-background to-emerald-50/50 dark:to-blue-900/10 group h-full">
                <CardHeader>
                  <RocketIcon className="h-8 w-8 text-emerald-600 dark:text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <CardTitle>Standard Mode</CardTitle>
                  <CardDescription>
                    Traditional REST API integration for existing loan flows. Perfect for integrating into existing LOS.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:border-emerald-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer bg-gradient-to-br from-background to-emerald-50/50 dark:to-blue-900/10 group h-full">
                <CardHeader>
                  <BrainIcon className="h-8 w-8 text-emerald-600 dark:text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <CardTitle>Agentic Mode</CardTitle>
                  <CardDescription>
                    Full AI swarm orchestration for autonomous decision making. Let the swarm handle KYC and Underwriting.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        );

      case "quickstart":
        return (
          <DocSection title="Running Locally" id="quickstart">
            <p className="text-lg text-muted-foreground mb-8">
              Follow these steps to run the Project Orion stack on your local machine for development.
            </p>
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6 rounded-xl border border-border bg-card/50">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-bold text-xl">
                    01
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-2">Clone the Repository</h3>
                  <CodeBlock language="bash" code="git clone https://github.com/FTS18/Project-Orion.git
cd Project-Orion" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6 rounded-xl border border-border bg-card/50">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-bold text-xl">
                    02
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-2">Environment Setup</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Create a <code className="bg-muted px-1 py-0.5 rounded border">.env</code> file in the root directory.</p>
                  <CodeBlock language="bash" code={`DATABASE_URL="postgresql://user:password@localhost:5432/orion_db"
OPENAI_API_KEY="sk-..."
PORT=5000`} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6 rounded-xl border border-border bg-card/50">
                <div className="flex-shrink-0">
                   <span className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-bold text-xl">
                    03
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-2">Install & Run</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Install dependencies and start the development server.</p>
                  <CodeBlock language="bash" code="npm install
npm run dev" />
                </div>
              </div>
            </div>
          </DocSection>
        );
        
      case "architecture":
        return (
          <DocSection title="Architecture Deep Dive" id="architecture">
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-3xl">
               Project Orion operates on a specialized <strong>Controller-Swarm</strong> architecture. The backend acts as a high-throughput state manager, while the AI layer operates asynchronously to prevent blocking the main thread.
            </p>
            
            <div className="space-y-8">
                <div className="border border-border/50 rounded-xl p-8 bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        Backend Layer (Express + PG)
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Handles reliable state management, loan lifecycle transitions, and immediate API responses. It queues complex tasks (like document OCR or risk scoring) for the Swarm.
                    </p>
                    <div className="flex gap-2">
                       <Badge variant="outline" className="bg-background">REST API</Badge>
                       <Badge variant="outline" className="bg-background">PostgreSQL</Badge>
                       <Badge variant="outline" className="bg-background">Redis Queue</Badge>
                    </div>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                    <div className="bg-background border px-3 py-1 rounded-full text-xs text-muted-foreground shadow-sm">
                        Async Event Bus
                    </div>
                </div>

                <div className="border border-emerald-500/30 rounded-xl p-8 bg-emerald-50/50 dark:bg-blue-900/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-emerald-500 dark:text-blue-400" />
                        Swarm Controller
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        The "Swarm" is a collection of 5 specialized Agents running on a shared context bus.
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4">
                        <li className="bg-background/80 p-3 rounded-lg border text-sm">
                           <strong className="block text-emerald-700 dark:text-blue-300 mb-1">Sales Agent</strong> 
                           Engages initial leads and qualifies intent.
                        </li>
                        <li className="bg-background/80 p-3 rounded-lg border text-sm">
                           <strong className="block text-emerald-700 dark:text-blue-300 mb-1">Verification Agent</strong> 
                           Connects to KYC providers and analyzes docs.
                        </li>
                        <li className="bg-background/80 p-3 rounded-lg border text-sm">
                           <strong className="block text-emerald-700 dark:text-blue-300 mb-1">Underwriter Agent</strong> 
                           Calculates risk ratios (DTI, LTV).
                        </li>
                        <li className="bg-background/80 p-3 rounded-lg border text-sm">
                           <strong className="block text-emerald-700 dark:text-blue-300 mb-1">Compliance Agent</strong> 
                           Checks against AML and regulatory blacklists.
                        </li>
                        <li className="bg-background/80 p-3 rounded-lg border text-sm md:col-span-2">
                           <strong className="block text-emerald-700 dark:text-blue-300 mb-1">Manager Agent</strong> 
                           Orchestrator that aggregates results and makes the final decision.
                        </li>
                    </ul>
                </div>
            </div>
          </DocSection>
        );

      case "agents":
        return (
          <DocSection title="Agents & Swarms" id="agents">
            <p className="text-lg text-muted-foreground mb-8">
              Orion utilizes a swarm of 5 specialized autonomous agents. Each agent acts as an expert in its domain.
            </p>
            <div className="grid gap-6">
               <AgentCard 
                 icon={Users} 
                 title="Sales Agent" 
                 desc="Handles initial customer interaction, product explanation, and intent qualification."
                 tags={["Chat Interface", "Lead Gen"]}
                 color="text-blue-600 dark:text-blue-400"
                 bg="bg-blue-100 dark:bg-blue-900/30"
               />
               <AgentCard 
                 icon={Shield} 
                 title="Verification Agent" 
                 desc="Performs OCR on uploaded documents and verifies identity against government databases."
                 tags={["OCR", "KYC", "Fraud"]}
                 color="text-indigo-600 dark:text-indigo-400"
                 bg="bg-indigo-100 dark:bg-indigo-900/30"
               />
               <AgentCard 
                 icon={Zap} 
                 title="Underwriter Agent" 
                 desc="Analyzes financial health including bank statements, credit score, and cash flow."
                 tags={["Risk Scoring", "Financial Analysis"]}
                 color="text-emerald-600 dark:text-emerald-400"
                 bg="bg-emerald-100 dark:bg-emerald-900/30"
               />
               <AgentCard 
                 icon={AlertCircle} 
                 title="Compliance Agent" 
                 desc="Ensures all loans meet regulatory standards (GDPR, SOC2) and internal policies."
                 tags={["Audit", "Regulations"]}
                 color="text-rose-600 dark:text-rose-400"
                 bg="bg-rose-100 dark:bg-rose-900/30"
               />
               <AgentCard 
                 icon={Brain} 
                 title="Manager Agent" 
                 desc="The orchestrator. Aggregates insights from all other agents to make the final lending decision."
                 tags={["Orchestration", "Decision Making"]}
                 color="text-amber-600 dark:text-amber-400"
                 bg="bg-amber-100 dark:bg-amber-900/30"
               />
            </div>
          </DocSection>
        );
      
      case "workflows":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <DocSection title="Loan Application Workflow" id="framework-overview">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Project Orion follows a multi-stage workflow to process loan applications, ensuring data integrity and risk assessment at every step.
              </p>
              
              <div className="grid gap-6">
                 <div className="relative pl-8 border-l-2 border-muted space-y-8">
                    {/* Step 1 */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-background bg-emerald-500 ring-2 ring-emerald-500/20" />
                       <h3 className="text-lg font-bold mb-2">1. Application Submission</h3>
                       <p className="text-muted-foreground text-sm">User submits structured JSON data via the <code className="bg-muted px-1 rounded text-xs">/apply</code> endpoint or the Agentic Interface.</p>
                       <CodeBlock language="json" code={`{
  "applicant": {
    "name": "John Doe",
    "income": 85000,
    "credit_score": 720
  },
  "loan_amount": 25000
}`} />
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-background bg-blue-500 ring-2 ring-blue-500/20" />
                       <h3 className="text-lg font-bold mb-2">2. Identity & Fraud Check</h3>
                       <p className="text-muted-foreground text-sm">The <strong>Verification Agent</strong> runs passive checks against global watchlists and validates document metadata.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-background bg-purple-500 ring-2 ring-purple-500/20" />
                       <h3 className="text-lg font-bold mb-2">3. Underwriting Analysis</h3>
                       <p className="text-muted-foreground text-sm">The <strong>Underwriter Agent</strong> calculates DTI (Debt-to-Income), queries credit bureaus (simulated), and assigns a risk score.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                       <span className="absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-background bg-green-500 ring-2 ring-green-500/20" />
                       <h3 className="text-lg font-bold mb-2">4. Final Decision</h3>
                       <p className="text-muted-foreground text-sm">The <strong>Manager Agent</strong> aggregates all insights and issues a final <code className="text-green-600 font-mono">APPROVED</code> or <code className="text-red-500 font-mono">REJECTED</code> status.</p>
                    </div>
                 </div>
              </div>
            </DocSection>
            
            <DocSection title="Human-in-the-Loop" id="human-loop">
                <p className="text-muted-foreground leading-relaxed">
                   While 90% of decisions are automated, low-confidence scores trigger a "Manual Review" state. Orion provides a dedicated dashboard for loan officers to review agent reasoning before final sign-off.
                </p>
            </DocSection>
          </div>
        );

      case "security":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <DocSection title="Security Architecture" id="security-model">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Trust is our currency. Project Orion implements a <strong>Zero-Trust</strong> architecture, assuming no component is trusted by default.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="p-6 rounded-xl bg-card border border-border">
                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                       <Shield className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold mb-2">Data Encryption</h3>
                    <p className="text-sm text-muted-foreground">All sensitive data (PII) is encrypted at rest using <strong>AES-256-GCM</strong>. API communication is strictly over TLS 1.3.</p>
                 </div>
                 
                 <div className="p-6 rounded-xl bg-card border border-border">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                       <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold mb-2">Role-Based Access (RBAC)</h3>
                    <p className="text-sm text-muted-foreground">Strict permission scopes (e.g., <code className="bg-muted px-1 rounded text-xs">read:loan</code>, <code className="bg-muted px-1 rounded text-xs">write:decision</code>) enforced via JWT middleware.</p>
                 </div>
              </div>
            </DocSection>

            <DocSection title="Compliance Standards" id="compliance">
               <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                     <span className="mt-1 h-5 w-5 bg-green-500/10 text-green-600 flex items-center justify-center rounded-full text-xs">✓</span>
                     <div>
                        <strong className="block text-foreground">SOC 2 Type II</strong>
                        <span className="text-sm text-muted-foreground">infrastructure controls are audited annually.</span>
                     </div>
                  </li>
                  <li className="flex gap-3 items-start">
                     <span className="mt-1 h-5 w-5 bg-green-500/10 text-green-600 flex items-center justify-center rounded-full text-xs">✓</span>
                     <div>
                        <strong className="block text-foreground">GDPR & CCPA</strong>
                        <span className="text-sm text-muted-foreground">Built-in "Right to Erasure" APIs and strict data data residency handling.</span>
                     </div>
                  </li>
               </ul>
            </DocSection>
          </div>
        );

      default:
        return (
           <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
              <div className="bg-muted rounded-full p-4 mb-4">
                 <Terminal className="h-8 w-8 text-muted-foreground" />
              </div> 
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                 We are currently updating the documentation for this section. Check back shortly.
              </p>
           </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-12 relative">
            
            {/* Mobile Navigation Toggle */}
            <div className="md:hidden mb-6 sticky top-20 z-30 bg-background/80 backdrop-blur-md p-4 border rounded-xl shadow-lg">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center justify-between w-full font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Menu className="h-5 w-5" />
                    {Object.values(sections).flat().find(i => i.id === activeSection)?.label || "Menu"}
                  </span>
                  <ChevronRight className={cn("h-5 w-5 transition-transform", isMobileMenuOpen ? "rotate-90" : "")} />
                </button>
                {isMobileMenuOpen && (
                   <div className="mt-4 pt-4 border-t max-h-[60vh] overflow-y-auto space-y-6">
                      {Object.entries(sections).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
                            {category.split("-").join(" ")}
                          </h4>
                          <ul className="space-y-1">
                            {items.map((item) => (
                              <li key={item.id}>
                                <button
                                  onClick={() => {
                                    setActiveSection(item.id);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors border-l-2",
                                    activeSection === item.id
                                      ? "border-emerald-500 bg-emerald-50 dark:bg-blue-900/20 text-emerald-700 dark:text-blue-400"
                                      : "border-transparent text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {item.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                   </div>
                )}
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden md:block w-72 shrink-0 sticky top-28 self-start h-[calc(100vh-8rem)] overflow-y-auto pr-6 custom-scrollbar">
              <div className="mb-8">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <input 
                       type="text" 
                       placeholder="Search docs..." 
                       className="w-full bg-muted/50 border border-input rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                     />
                  </div>
              </div>

              <div className="space-y-10">
                {Object.entries(sections).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4 px-2">
                       <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">
                         {category.split("-").join(" ")}
                       </h4>
                    </div>
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                              activeSection === item.id
                                ? "bg-emerald-50 dark:bg-blue-900/20 text-emerald-700 dark:text-blue-400"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            )}
                          >
                            <item.icon className={cn(
                              "h-4 w-4 transition-colors",
                              activeSection === item.id ? "text-emerald-600 dark:text-blue-400" : "text-muted-foreground/60 group-hover:text-foreground"
                            )} />
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area - Full Width (No Right TOC) */}
            <div className="flex-1 min-w-0 pb-20">
               {renderContent()}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// --- Helpers ---

function AgentCard({ icon: Icon, title, desc, tags, color, bg }: any) {
    return (
        <div className="flex gap-4 items-start p-6 rounded-xl border bg-card hover:border-emerald-500/30 transition-all cursor-default group">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", bg)}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                    {desc}
                </p>
                <div className="flex gap-2 flex-wrap">
                    {tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="bg-muted hover:bg-muted text-muted-foreground font-normal">
                            {t}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    )
}

function RocketIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

function BrainIcon(props: any) {
    return <Brain {...props} />;
}
