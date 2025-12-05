import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat-interface";
import { AgentPanelGrid } from "@/components/agent-panel";
import { WorkflowGraph } from "@/components/workflow-graph";
import { InlineLogViewer } from "@/components/log-drawer";
import { SanctionLetterModal } from "@/components/sanction-letter-modal";
import { CustomDataEntry, type CustomerData, type LoanDetails } from "@/components/custom-data-entry";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { 
  Customer,
  AgentMessage, 
  AgentType, 
  AgentStatus, 
  WorkflowLogEntry,
  UnderwritingResult,
  SanctionLetterResponse
} from "@shared/schema";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  Settings,
  Bot,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowMode = "auto" | "step";
type WorkflowState = "idle" | "running" | "paused" | "completed" | "error";

interface AgentStateData {
  agentType: AgentType;
  status: AgentStatus;
  lastAction?: string;
  messages: AgentMessage[];
  progress?: number;
}

const INITIAL_AGENTS: AgentStateData[] = [
  { agentType: "master", status: "idle", messages: [] },
  { agentType: "sales", status: "idle", messages: [] },
  { agentType: "verification", status: "idle", messages: [] },
  { agentType: "underwriting", status: "idle", messages: [] },
  { agentType: "sanction", status: "idle", messages: [] },
];

const WELCOME_MESSAGE: AgentMessage = {
  id: "welcome",
  agentType: "master",
  role: "agent",
  content: "Hello! I'm your AI Loan Assistant. I'll coordinate with my team of specialized agents to help you through the loan application process.\n\nTo get started, please tell me your Customer ID (e.g., CUST001) or describe what you're looking for.",
  timestamp: new Date().toISOString(),
};

export default function AgenticModePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [showDataEntry, setShowDataEntry] = useState(true);
  const [customCustomerData, setCustomCustomerData] = useState<CustomerData | null>(null);
  const [customLoanData, setCustomLoanData] = useState<LoanDetails | null>(null);
  
  const [messages, setMessages] = useState<AgentMessage[]>([WELCOME_MESSAGE]);
  const [agents, setAgents] = useState<AgentStateData[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<WorkflowLogEntry[]>([]);
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>("auto");
  const [workflowState, setWorkflowState] = useState<WorkflowState>("idle");
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [underwritingResult, setUnderwritingResult] = useState<UnderwritingResult | null>(null);
  const [sanctionLetter, setSanctionLetter] = useState<SanctionLetterResponse | null>(null);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("agents");

  const stepQueueRef = useRef<(() => Promise<void>)[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const addLog = useCallback((
    agentType: AgentType, 
    action: string, 
    details: string = "",
    level: WorkflowLogEntry["level"] = "info"
  ) => {
    const entry: WorkflowLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      agentType,
      action,
      details,
      level,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  const addMessage = useCallback((
    agentType: AgentType,
    role: AgentMessage["role"],
    content: string,
    metadata?: Record<string, unknown>
  ) => {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentType,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const updateAgentStatus = useCallback((agentType: AgentType, updates: Partial<AgentStateData>) => {
    setAgents(prev => prev.map(agent => 
      agent.agentType === agentType 
        ? { ...agent, ...updates }
        : agent
    ));
  }, []);

  const simulateAgentWork = useCallback(async (
    agentType: AgentType,
    action: string,
    duration: number = 1500
  ) => {
    setActiveAgent(agentType);
    updateAgentStatus(agentType, { status: "active", lastAction: action });
    addLog(agentType, action, "Processing...", "info");
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    updateAgentStatus(agentType, { status: "completed" });
    addLog(agentType, action, "Completed", "success");
    setActiveAgent(null);
  }, [updateAgentStatus, addLog]);

  const processCustomerLookup = useCallback(async (customerId: string) => {
    const customer = customers?.find(c => 
      c.customerId.toLowerCase() === customerId.toLowerCase()
    );

    if (!customer) {
      addMessage("master", "agent", `I couldn't find a customer with ID "${customerId}". Please check the ID and try again, or tell me you'd like to see the list of available customers.`);
      addLog("master", "Customer Lookup", "Customer not found", "warning");
      return null;
    }

    setCurrentCustomer(customer);
    addMessage("master", "agent", `Found customer: ${customer.name} from ${customer.city}. Credit Score: ${customer.creditScore}, Pre-approved limit: ₹${customer.preApprovedLimit.toLocaleString('en-IN')}.\n\nNow, let me connect you with our Sales Agent to discuss your loan requirements.`);
    addLog("master", "Customer Found", `${customer.name} (${customer.customerId})`, "success");
    
    return customer;
  }, [customers, addMessage, addLog]);

  const runSalesAgent = useCallback(async (customer: Customer) => {
    await simulateAgentWork("sales", "Collecting loan requirements", 2000);
    
    addMessage("sales", "agent", `Hello ${customer.name}! I'm the Sales Agent. Based on your profile:\n\n• Pre-approved limit: ₹${customer.preApprovedLimit.toLocaleString('en-IN')}\n• Employment: ${customer.employmentType}\n• Monthly income: ₹${customer.monthlyNetSalary.toLocaleString('en-IN')}\n\nI can offer you competitive rates starting at 10.5% p.a. How much would you like to borrow, and for how long?`);
    
    await simulateAgentWork("sales", "Fetching best offers", 1500);
    
    const loanAmount = Math.min(customer.preApprovedLimit * 1.5, 500000);
    addMessage("sales", "agent", `Great! I've prepared a loan offer for you:\n\n• Amount: ₹${loanAmount.toLocaleString('en-IN')}\n• Tenure: 24 months\n• Interest Rate: 11% p.a.\n• Estimated EMI: ₹${Math.round(loanAmount * 1.11 / 24).toLocaleString('en-IN')}\n\nShall I proceed with the verification?`);
    
    return { amount: loanAmount, tenure: 24, rate: 11 };
  }, [simulateAgentWork, addMessage]);

  const runVerificationAgent = useCallback(async (customer: Customer) => {
    await simulateAgentWork("verification", "Verifying KYC details", 2500);
    
    const verified = customer.creditScore >= 650;
    
    if (verified) {
      addMessage("verification", "agent", `KYC verification completed successfully!\n\n✓ Name verified\n✓ Phone verified\n✓ Address verified (${customer.city})\n\nAll details match our CRM records. Proceeding to underwriting.`);
      addLog("verification", "KYC Verified", "All details match", "success");
    } else {
      addMessage("verification", "agent", `KYC verification has some concerns:\n\n✓ Name verified\n⚠ Additional verification may be required\n\nWe'll proceed with caution to underwriting.`);
      addLog("verification", "KYC Partial", "Some concerns noted", "warning");
    }
    
    return verified;
  }, [simulateAgentWork, addMessage, addLog]);

  const runUnderwritingAgent = useCallback(async (
    customer: Customer, 
    loanDetails: { amount: number; tenure: number; rate: number }
  ) => {
    await simulateAgentWork("underwriting", "Evaluating credit risk", 3000);
    
    let decision: UnderwritingResult["decision"] = "PENDING";
    let reason = "";
    let requiredAction = "";
    
    if (customer.creditScore < 700) {
      decision = "REJECT";
      reason = `Credit score (${customer.creditScore}) is below our minimum threshold of 700.`;
      addLog("underwriting", "Decision", "Rejected - Low credit score", "error");
    } else if (loanDetails.amount <= customer.preApprovedLimit) {
      decision = "APPROVE";
      reason = "Loan amount is within pre-approved limit. Instant approval granted.";
      addLog("underwriting", "Decision", "Approved - Within limit", "success");
    } else if (loanDetails.amount <= customer.preApprovedLimit * 2) {
      const monthlyEmi = (loanDetails.amount * (1 + loanDetails.rate / 100)) / loanDetails.tenure;
      const dti = monthlyEmi / customer.monthlyNetSalary;
      
      if (dti <= 0.5) {
        decision = "APPROVE";
        reason = `EMI-to-income ratio (${(dti * 100).toFixed(1)}%) is within acceptable limits.`;
        addLog("underwriting", "Decision", "Approved - Good DTI", "success");
      } else {
        decision = "REJECT";
        reason = `EMI-to-income ratio (${(dti * 100).toFixed(1)}%) exceeds 50% threshold.`;
        requiredAction = "Consider a lower loan amount or longer tenure.";
        addLog("underwriting", "Decision", "Rejected - High DTI", "error");
      }
    } else {
      decision = "REJECT";
      reason = `Requested amount (₹${loanDetails.amount.toLocaleString('en-IN')}) exceeds 2x pre-approved limit.`;
      requiredAction = `Maximum eligible amount: ₹${(customer.preApprovedLimit * 2).toLocaleString('en-IN')}`;
      addLog("underwriting", "Decision", "Rejected - Over limit", "error");
    }

    const emi = Math.round((loanDetails.amount * (1 + loanDetails.rate / 100 * loanDetails.tenure / 12)) / loanDetails.tenure);
    const totalAmount = emi * loanDetails.tenure;

    const result: UnderwritingResult = {
      decision,
      reason,
      requiredAction: requiredAction || undefined,
      emi,
      totalAmount,
      referenceNumber: `LN${Date.now().toString().slice(-8)}`,
    };

    setUnderwritingResult(result);

    const statusEmoji = decision === "APPROVE" ? "✅" : decision === "REJECT" ? "❌" : "⏳";
    addMessage("underwriting", "agent", `${statusEmoji} Underwriting Decision: ${decision}\n\n${reason}${requiredAction ? `\n\nRequired Action: ${requiredAction}` : ""}\n\n${decision === "APPROVE" ? `• Monthly EMI: ₹${emi.toLocaleString('en-IN')}\n• Total Repayment: ₹${totalAmount.toLocaleString('en-IN')}\n• Reference: ${result.referenceNumber}` : ""}`);

    return result;
  }, [simulateAgentWork, addMessage, addLog]);

  const runSanctionAgent = useCallback(async (
    customer: Customer,
    loanDetails: { amount: number; tenure: number; rate: number },
    result: UnderwritingResult
  ) => {
    if (result.decision !== "APPROVE") {
      addMessage("sanction", "agent", "Sanction letter generation is only available for approved loans.");
      return null;
    }

    await simulateAgentWork("sanction", "Generating sanction letter", 2000);
    
    const sanctionResponse: SanctionLetterResponse = {
      pdfUrl: `/api/sanction/${result.referenceNumber}.pdf`,
      referenceNumber: result.referenceNumber || `LN${Date.now()}`,
      generatedAt: new Date().toISOString(),
    };

    setSanctionLetter(sanctionResponse);
    
    addMessage("sanction", "agent", `📄 Sanction Letter Generated!\n\nReference Number: ${sanctionResponse.referenceNumber}\nGenerated: ${new Date(sanctionResponse.generatedAt).toLocaleString('en-IN')}\n\nYour loan has been officially sanctioned. Click the button below to view and download your sanction letter.`);
    addLog("sanction", "Letter Generated", sanctionResponse.referenceNumber, "success");

    return sanctionResponse;
  }, [simulateAgentWork, addMessage, addLog]);

  const runFullWorkflow = useCallback(async (customerId: string) => {
    if (workflowState === "running") return;
    
    setWorkflowState("running");
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    try {
      addMessage("master", "system", "Starting automated workflow...");
      addLog("master", "Workflow Started", "Auto mode", "info");

      await simulateAgentWork("master", "Initializing workflow", 1000);
      
      const customer = await processCustomerLookup(customerId);
      if (!customer) {
        setWorkflowState("error");
        setIsProcessing(false);
        return;
      }

      const loanDetails = await runSalesAgent(customer);
      
      await runVerificationAgent(customer);
      
      const result = await runUnderwritingAgent(customer, loanDetails);
      
      if (result.decision === "APPROVE") {
        await runSanctionAgent(customer, loanDetails, result);
        addMessage("master", "agent", "🎉 Congratulations! Your loan application has been approved and the sanction letter is ready. Would you like to view it now?");
      } else {
        addMessage("master", "agent", `I'm sorry, but your loan application was ${result.decision.toLowerCase()}ed. ${result.reason}\n\n${result.requiredAction || "Please contact our support team for more options."}`);
      }

      setWorkflowState("completed");
      addLog("master", "Workflow Completed", result.decision, result.decision === "APPROVE" ? "success" : "warning");
      
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        addLog("master", "Workflow Aborted", "User cancelled", "warning");
      } else {
        addLog("master", "Workflow Error", (error as Error).message, "error");
        toast({
          title: "Workflow Error",
          description: "An error occurred during processing",
          variant: "destructive",
        });
      }
      setWorkflowState("error");
    } finally {
      setIsProcessing(false);
    }
  }, [
    workflowState,
    simulateAgentWork,
    processCustomerLookup,
    runSalesAgent,
    runVerificationAgent,
    runUnderwritingAgent,
    runSanctionAgent,
    addMessage,
    addLog,
    toast,
  ]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentCustomer && !content.match(/CUST\d{3}/i)) {
      addMessage("master", "agent", "Please provide your Customer ID (e.g., CUST001) to begin.");
      return;
    }

    // Extract customer ID if provided
    const customerIdMatch = content.match(/CUST\d{3}/i);
    const customerId = customerIdMatch ? customerIdMatch[0].toUpperCase() : currentCustomer?.customerId;

    if (!customerId) {
      addMessage("master", "agent", "Please provide a valid Customer ID (e.g., CUST001).");
      return;
    }

    // Add user message
    addMessage("master", "user", content);
    setIsProcessing(true);
    updateAgentStatus("master", { status: "active", lastAction: "Processing request" });

    try {
      // Call backend API
      const response = await fetch("http://127.0.0.1:8000/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          message: content,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      // Add agent response
      addMessage("master", "agent", data.message);

      // Update agent states
      if (data.agentStates) {
        data.agentStates.forEach((state: any) => {
          updateAgentStatus(state.agentType, {
            status: state.status,
            lastAction: state.lastAction,
            progress: state.progress,
          });
        });
      }

      // Add workflow logs
      if (data.workflowLogs) {
        data.workflowLogs.forEach((log: any) => {
          addLog(log.agentType, log.action, log.details, log.level);
        });
      }

      // Set customer if found
      if (!currentCustomer && customers) {
        const customer = customers.find(c => c.customerId === customerId);
        if (customer) {
          setCurrentCustomer(customer);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addMessage("master", "agent", "Sorry, I encountered an error processing your request. Please try again.");
      addLog("master", "Error", errorMessage, "error");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      updateAgentStatus("master", { status: "completed" });
    }
  }, [
    addMessage,
    addLog,
    updateAgentStatus,
    currentCustomer,
    customers,
  ]);

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([WELCOME_MESSAGE]);
    setAgents(INITIAL_AGENTS);
    setLogs([]);
    setWorkflowState("idle");
    setActiveAgent(null);
    setCurrentCustomer(null);
    setUnderwritingResult(null);
    setSanctionLetter(null);
    setIsProcessing(false);
    addLog("master", "Workflow Reset", "User initiated", "info");
  }, [addLog]);

  const workflowNodes = agents.map(a => ({
    id: a.agentType,
    label: a.agentType,
    icon: null,
    status: a.status,
  }));

  // Show data entry modal if no custom data selected yet
  if (showDataEntry) {
    return (
      <div className="min-h-screen bg-background">
        <Header mode="agentic" onModeChange={(mode) => navigate(`/${mode}`)} showModeToggle />
        <main className="pt-16 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2">Agentic AI Loan Assistant</h1>
              <p className="text-muted-foreground text-lg">
                Let's get your information first, then I'll help you through the entire loan process
              </p>
            </div>
            <CustomDataEntry
              onCustomerSelected={(data) => {
                setCustomCustomerData(data);
              }}
              onLoanDetailsEntered={(data) => {
                setCustomLoanData(data);
              }}
              onClose={() => {
                setShowDataEntry(false);
                // Update welcome message with custom data
                if (customCustomerData && customLoanData) {
                  const newWelcome: AgentMessage = {
                    id: "welcome-updated",
                    agentType: "master",
                    role: "agent",
                    content: `Great! I've got your details, ${customCustomerData.name}. Now let me coordinate with my team of specialized agents to process your loan application.\n\nLoan Amount: ₹${customLoanData.loanAmount.toLocaleString('en-IN')}\nTenure: ${customLoanData.tenure} months\nRate: ${customLoanData.rate}% p.a.\n\nLet me start by verifying your information with our sales team.`,
                    timestamp: new Date().toISOString(),
                  };
                  setMessages([newWelcome]);
                  addLog("master", "Application Initiated", `Customer: ${customCustomerData.name}, Loan: ₹${customLoanData.loanAmount}`, "success");
                }
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        mode="agentic" 
        onModeChange={(mode) => navigate(`/${mode}`)}
        showModeToggle 
      />

      <main className="pt-16 h-screen flex flex-col">
        <div className="border-b bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                <h1 className="text-lg font-semibold">Agentic AI Mode</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn(
                  workflowState === "running" && "bg-blue-500/10 text-blue-500",
                  workflowState === "completed" && "bg-green-500/10 text-green-500",
                  workflowState === "error" && "bg-red-500/10 text-red-500"
                )}
              >
                {workflowState === "idle" && "Ready"}
                {workflowState === "running" && "Processing"}
                {workflowState === "paused" && "Paused"}
                {workflowState === "completed" && "Completed"}
                {workflowState === "error" && "Error"}
              </Badge>

              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={workflowMode === "auto" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWorkflowMode("auto")}
                  data-testid="button-mode-auto"
                >
                  Auto
                </Button>
                <Button
                  variant={workflowMode === "step" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWorkflowMode("step")}
                  data-testid="button-mode-step"
                >
                  Step
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1"
                data-testid="button-reset-workflow"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full grid lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3 h-full border-r flex flex-col min-h-0">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isProcessing}
                disabled={isProcessing && workflowMode === "auto"}
                placeholder={isProcessing ? "Processing..." : "Type your message or Customer ID..."}
                className="flex-1 border-0 rounded-none min-h-0"
              />
            </div>

            <div className="lg:col-span-2 h-full overflow-hidden flex flex-col">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col"
              >
                <div className="border-b px-4">
                  <TabsList className="h-12">
                    <TabsTrigger value="agents" className="gap-2" data-testid="tab-agents">
                      <Bot className="h-4 w-4" />
                      Agents
                    </TabsTrigger>
                    <TabsTrigger value="workflow" className="gap-2" data-testid="tab-workflow">
                      <Settings className="h-4 w-4" />
                      Workflow
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="agents" className="flex-1 overflow-auto m-0 p-4">
                  <AgentPanelGrid agents={agents} />
                  
                  {underwritingResult && (
                    <Card className={cn(
                      "mt-4 p-4 animate-fade-in",
                      underwritingResult.decision === "APPROVE" && "bg-green-500/5 border-green-500/20",
                      underwritingResult.decision === "REJECT" && "bg-red-500/5 border-red-500/20"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {underwritingResult.decision === "APPROVE" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-semibold">{underwritingResult.decision}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{underwritingResult.reason}</p>
                      
                      {sanctionLetter && underwritingResult.decision === "APPROVE" && (
                        <Button
                          onClick={() => setShowSanctionModal(true)}
                          className="mt-3 w-full gap-2"
                          data-testid="button-view-sanction"
                        >
                          View Sanction Letter
                        </Button>
                      )}
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="workflow" className="flex-1 overflow-auto m-0 p-4">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-4">Agent Workflow</h3>
                      <WorkflowGraph 
                        nodes={workflowNodes}
                        activeAgent={activeAgent}
                      />
                    </Card>

                    <InlineLogViewer logs={logs} maxHeight="300px" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <SanctionLetterModal
        isOpen={showSanctionModal}
        onClose={() => setShowSanctionModal(false)}
        sanctionLetter={sanctionLetter}
        customer={currentCustomer}
        loanTerms={underwritingResult?.emi ? {
          amount: currentCustomer?.preApprovedLimit ? Math.min(currentCustomer.preApprovedLimit * 1.5, 500000) : 100000,
          tenure: 24,
          rate: 11,
          emi: underwritingResult.emi,
          totalAmount: underwritingResult.totalAmount || 0,
        } : undefined}
        onDownload={() => {
          toast({
            title: "Download Started",
            description: "Your sanction letter is being downloaded",
          });
        }}
      />
    </div>
  );
}
