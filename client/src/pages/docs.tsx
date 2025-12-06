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

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Complete guide to using Project Orion
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="getting-started" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Getting Started</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">API Guide</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">FAQ</span>
              </TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-4 mt-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Getting Started with Project Orion</h2>
                  <CardDescription>Begin your loan application journey in just a few steps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Choose Your Mode</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select between Standard Mode (guided wizard) or Agentic AI Mode (conversational AI)
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. Enter Your Details</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Provide your personal information, or select from pre-approved customers
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Upload Documents</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload salary documents for automatic verification
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">4. Complete Verification</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Our agents verify your KYC and process your application
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">5. Get Decision</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive instant decision and download sanction letter
                    </p>
                  </div>
                </CardContent>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Standard Mode</h2>
                  <CardDescription>Step-by-step guided wizard flow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Traditional form-based approach</p>
                  <p>• Clear progress tracking</p>
                  <p>• Manual control over each step</p>
                  <p>• Perfect for users who prefer guided processes</p>
                </CardContent>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Agentic AI Mode</h2>
                  <CardDescription>Conversational AI-assisted processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Natural conversation with AI agent</p>
                  <p>• Intelligent multi-agent coordination</p>
                  <p>• Real-time agent status tracking</p>
                  <p>• Ideal for seamless automation</p>
                </CardContent>
              </SpotlightCard>
            </TabsContent>

            {/* API Guide */}
            <TabsContent value="api" className="space-y-4 mt-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h2 className="text-xl font-semibold">API Endpoints</h2>
                  <CardDescription>Backend API reference</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div>
                      <p className="font-mono text-sm font-semibold">GET /api/customers</p>
                      <p className="text-xs text-muted-foreground mt-1">Fetch all available customers</p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="font-mono text-sm font-semibold">POST /api/extract-salary</p>
                      <p className="text-xs text-muted-foreground mt-1">Extract salary details from PDF</p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="font-mono text-sm font-semibold">POST /api/verify-kyc</p>
                      <p className="text-xs text-muted-foreground mt-1">Verify KYC details</p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="font-mono text-sm font-semibold">POST /api/underwrite</p>
                      <p className="text-xs text-muted-foreground mt-1">Get underwriting decision</p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="font-mono text-sm font-semibold">POST /api/generate-sanction-letter</p>
                      <p className="text-xs text-muted-foreground mt-1">Generate sanction letter PDF</p>
                    </div>
                  </div>
                </CardContent>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Agent API</h2>
                  <CardDescription>Multi-agent orchestration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Master Agent coordinates workflow</p>
                  <p>• Sales Agent handles loan offers</p>
                  <p>• Verification Agent checks KYC</p>
                  <p>• Underwriting Agent makes decisions</p>
                  <p>• Sanction Agent generates documents</p>
                </CardContent>
              </SpotlightCard>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-4 mt-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">How long does loan approval take?</h3>
                    <p className="text-sm text-muted-foreground">
                      Average decision time is 2 minutes. The AI agents process your application in parallel for speed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">What documents do I need?</h3>
                    <p className="text-sm text-muted-foreground">
                      Salary documents (payslip or bank statement) for verification. Other documents depend on loan purpose.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Is my data secure?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes. We use 256-bit encryption, secure authentication, and comply with data protection regulations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Can I edit my application after submission?</h3>
                    <p className="text-sm text-muted-foreground">
                      You can modify details up to the final verification step. Contact support for further assistance.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">What if my loan is rejected?</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll receive detailed feedback on rejection reasons. You can reapply after addressing the issues.
                    </p>
                  </div>
                </CardContent>
              </SpotlightCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
