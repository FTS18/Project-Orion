import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import { ChatInterface } from "@/components/chat-interface";
import { AgentPanelGrid } from "@/components/enhanced-agent-panel";
import { WorkflowGraph, WorkflowGraphHorizontal } from "@/components/workflow-graph";
import { InlineLogViewer } from "@/components/log-drawer";
import { SanctionLetterModal } from "@/components/sanction-letter-modal";
import { CustomDataEntry, type CustomerData, type LoanDetails } from "@/components/custom-data-entry";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { chatWithGemini } from "@/lib/gemini-client";
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
import { supabase } from "@/lib/supabase";
import { getCurrentUser, createWelcomeMessage, type UserProfile } from "@/lib/agent-user-context";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { SuccessConfetti } from "@/components/ui/confetti";
import { isFeatureEnabled } from "@/config/features.config";
import { getAgentWorkflowOrder } from "@/config/agents.config";

type WorkflowMode = "auto" | "step";
type WorkflowState = "idle" | "running" | "paused" | "completed" | "error";

interface AgentStateData {
  agentType: AgentType;
  status: AgentStatus;
  lastAction?: string;
  messages: AgentMessage[];
  progress?: number;
}

// Generate initial agents from config
const INITIAL_AGENTS: AgentStateData[] = getAgentWorkflowOrder().map(agentType => ({
  agentType,
  status: "idle" as AgentStatus,
  messages: [],
}));

// Welcome message will be created dynamically based on user login status

export default function AgenticModePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // User state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  const [showDataEntry, setShowDataEntry] = useState(true);
  const [customCustomerData, setCustomCustomerData] = useState<CustomerData | null>(null);
  const [customLoanData, setCustomLoanData] = useState<LoanDetails | null>(null);
  
  const [messages, setMessages] = useState<AgentMessage[]>([]);
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
  const [mobileView, setMobileView] = useState<"chat" | "agents">("chat");

  const stepQueueRef = useRef<(() => Promise<void>)[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Load user on mount and create welcome message
  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const user = await getCurrentUser();
        setUserProfile(user);
        
        // Create personalized welcome message
        const welcomeMsg = createWelcomeMessage(user);
        setMessages([welcomeMsg]);
        
        // If user is logged in, skip data entry form - AI will ask for details
        if (user) {
          setShowDataEntry(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Still show welcome message for non-logged-in users
        const welcomeMsg = createWelcomeMessage(null);
        setMessages([welcomeMsg]);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    loadUser();
  }, []);

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

  // Ref to track latest user profile to avoid stale closures
  const userProfileRef = useRef(userProfile);
  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  const handleSendMessage = useCallback(async (content: string) => {
    const currentUserProfile = userProfileRef.current;
    // If custom data was entered, use it directly
    if (customCustomerData) {
      addMessage("master", "user", content);
      // Custom data already set, proceed with chat
    }

    console.log("Sending message:", content, "User:", currentUserProfile?.firstName);

    // Extract customer ID if provided
    const customerIdMatch = content.match(/CUST\d{3}/i);
    let customerId = customerIdMatch ? customerIdMatch[0].toUpperCase() : (currentCustomer?.customerId || customCustomerData?.customerId);

    // If user is logged in, use their profile as customer ID
    if (currentUserProfile && !customerId) {
      customerId = `USER_${currentUserProfile.id}`;
    }

    // Fallback if still no customer ID
    if (!customerId) {
       console.log("No customer ID found, using GUEST fallback");
       customerId = "GUEST_" + Math.random().toString(36).substr(2, 9);
    }

    /* 
    if (!customerId && !userProfile) {
      addMessage("master", "agent", "Please provide a valid Customer ID (e.g., CUST001) or log in to continue.");
      return;
    }
    */

    // Add user message
    if (!customCustomerData) {
      addMessage("master", "user", content);
    }
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
          userProfile: currentUserProfile ? {
            ...currentUserProfile,
            // Add derived fields for backend
            monthlyNetSalary: currentUserProfile.monthlySalary,
            preApprovedLimit: (currentUserProfile.monthlySalary || 0) * 10,
            creditScore: 750, // Mocked for demo
          } : undefined,
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
      console.error("Backend Error:", error);
      
      // Client-Side Fallback
      console.log("Attempting Client-Side Gemini Fallback...");
      toast({
        title: "Backend Unavailable",
        description: "Switching to client-side AI mode.",
        variant: "default",
      });

      try {
        const history = messages.map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }));
        
        const responseText = await chatWithGemini(content, history as any, currentUserProfile);
        addMessage("master", "agent", responseText);
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        addMessage("master", "agent", "I apologize, but I'm unable to process your request at the moment. Please check your internet connection or API configuration.");
      }
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
    // Recreate welcome message with current user
    const welcomeMsg = createWelcomeMessage(userProfile);
    setMessages([welcomeMsg]);
    setAgents(INITIAL_AGENTS);
    setLogs([]);
    setWorkflowState("idle");
    setActiveAgent(null);
    setCurrentCustomer(null);
    setUnderwritingResult(null);
    setSanctionLetter(null);
    setIsProcessing(false);
    addLog("master", "Workflow Reset", "User initiated", "info");
  }, [addLog, userProfile]);

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

  const getSuggestedActions = () => {
    if (messages.length === 0) return ["Personal Loan", "Home Loan", "Business Loan"];
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "agent" || lastMsg.role === "system") {
        const text = lastMsg.content.toLowerCase();
        
        // Loan Types - Check multiple patterns
        if (text.includes("type of loan") || text.includes("looking for today") || text.includes("what type")) {
          return ["Personal Loan", "Home Loan", "Business Loan"];
        }
        
        // After loan type selected - ask for amount
        if (text.includes("pre-approved offer") || text.includes("specific amount") || text.includes("how much")) {
          return ["₹1,00,000", "₹3,00,000", "₹5,00,000", "₹10,00,000"];
        }
        
        // Confirmation dialogs
        if (text.includes("confirm these details") || text.includes("do you confirm") || text.includes("would you like to proceed")) {
          return ["Yes, proceed", "No, change details"];
        }
        
        // Verification/underwriting stage
        if (text.includes("credit assessment") || text.includes("verifying") || text.includes("checking")) {
          return ["Check Status", "Continue"];
        }
        
        // Application status
        if (text.includes("status") || text.includes("in progress")) {
          return ["View Details", "Cancel Application"];
        }
        
        // Tenure
        if (text.includes("tenure") || text.includes("period") || text.includes("how long")) {
          return ["12 Months", "24 Months", "36 Months", "60 Months"];
        }
        
        // Purpose
        if (text.includes("purpose")) {
          return ["Education", "Medical", "Home Renovation", "Business"];
        }

        // Completion
        if (text.includes("approved") || text.includes("sanction")) {
          return ["View Sanction Letter", "Start New Application"];
        }

        // Business Specific
        if (text.includes("nature") || text.includes("industry")) return ["Retail", "Manufacturing", "Services", "Trading"];
        if (text.includes("operational") || text.includes("years")) return ["< 1 Year", "1-3 Years", "> 3 Years"];
        if (text.includes("turnover")) return ["< ₹10L", "₹10L - ₹50L", "> ₹50L"];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating Particles Background */}
      <ParticlesBackground 
        className="opacity-40" 
        particleCount={35}
        speed={0.3}
        connectDistance={100}
      />
      
      {/* Success Confetti for Loan Approval */}
      <SuccessConfetti show={underwritingResult?.decision === "APPROVE" && workflowState === "completed"} />
      
      <Header 
        mode="agentic" 
        onModeChange={(mode) => navigate(`/${mode}`)}
        showModeToggle 
      />

      <main className="pt-16 h-screen flex flex-col relative z-10">
        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex border-b bg-background">
          <button 
            onClick={() => setMobileView("chat")} 
            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", mobileView === "chat" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            Chat
          </button>
          <button 
            onClick={() => setMobileView("agents")} 
            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", mobileView === "agents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            Agents & Workflow
          </button>
        </div>


        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel 
              defaultSize={60} 
              minSize={30} 
              className={cn(
                "flex flex-col min-w-0",
                "md:flex",
                mobileView === "chat" ? "flex" : "hidden"
              )}
            >
              <div className="border-b bg-card/50">
                <div className="px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
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
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isProcessing}
                disabled={isProcessing && workflowMode === "auto"}
                placeholder={isProcessing ? "Processing..." : userProfile ? "Tell me about your loan requirements..." : "Type your message or Customer ID..."}
                className="flex-1 border-0 rounded-none min-h-0"
                suggestedActions={getSuggestedActions()}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="hidden md:flex" />

            <ResizablePanel 
              defaultSize={40} 
              minSize={20} 
              collapsible={true} 
              maxSize={60} 
              className={cn(
                "bg-muted/5",
                "md:flex",
                mobileView === "agents" ? "flex" : "hidden"
              )}
            >
              <div className="h-full overflow-hidden flex flex-col border-l min-h-0">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                >
                  <div className="border-b px-4 bg-background">
                    <TabsList className="h-12 w-full justify-start bg-transparent p-0">
                      <TabsTrigger 
                        value="agents" 
                        className="gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4" 
                        data-testid="tab-agents"
                      >
                        <Bot className="h-4 w-4" />
                        Agents
                      </TabsTrigger>
                      <TabsTrigger 
                        value="workflow" 
                        className="gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4" 
                        data-testid="tab-workflow"
                      >
                        <Settings className="h-4 w-4" />
                        Workflow
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="agents" className="data-[state=inactive]:hidden flex-1 flex flex-col m-0 p-4 overflow-y-auto">
                    {isLoadingUser ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <SkeletonCard key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1">
                        {userProfile && (
                          <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm text-muted-foreground">
                              Logged in as <span className="font-medium text-foreground">{userProfile.firstName} {userProfile.lastName}</span> ({userProfile.email})
                            </p>
                          </div>
                        )}
                        <AgentPanelGrid agents={agents} />
                      </div>
                    )}
                    
                    {underwritingResult && (
                      <SpotlightCard 
                        className={cn(
                          "mt-4 p-4 animate-fade-in",
                          underwritingResult.decision === "APPROVE" && "bg-green-500/5 border-green-500/20",
                          underwritingResult.decision === "REJECT" && "bg-red-500/5 border-red-500/20"
                        )}
                        spotlightColor={underwritingResult.decision === "APPROVE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                      >
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
                      </SpotlightCard>
                    )}
                  </TabsContent>

                  <TabsContent value="workflow" className="data-[state=inactive]:hidden flex-1 flex flex-col m-0 p-4 min-h-0 overflow-auto">
                    <div className="flex flex-col gap-6">
                      <SpotlightCard className="p-4" spotlightColor="rgba(var(--primary), 0.05)">
                        <h3 className="font-semibold mb-4">Agent Workflow</h3>
                        {/* Desktop: Horizontal Flowchart */}
                        <div className="hidden md:block">
                          <WorkflowGraphHorizontal 
                            nodes={workflowNodes}
                            activeAgent={activeAgent}
                          />
                        </div>
                        {/* Mobile: Vertical Flowchart */}
                        <div className="md:hidden">
                          <WorkflowGraph 
                            nodes={workflowNodes}
                            activeAgent={activeAgent}
                          />
                        </div>
                      </SpotlightCard>

                      {/* Logs Section - Always visible */}
                      <div className="min-h-[200px] max-h-[400px]">
                        <InlineLogViewer logs={logs} className="h-full" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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
