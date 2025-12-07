/**
 * Client-Side Fallback Service
 * Mimics backend functionality when server is unavailable
 * This allows the app to work in demo mode even without backend
 */

import { LRUCache, memoizeWithTTL } from '@/lib/performance-utils';

// Cache for health check status - avoids repeated network calls
const healthCheckCache = new LRUCache<string, { healthy: boolean; timestamp: number }>(5);

// Memoized EMI calculation - O(1) for repeated calculations
export const calculateEMI = memoizeWithTTL(
  (principal: number, rate: number, tenure: number): number => {
    const monthlyRate = rate / 12 / 100;
    return Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
      (Math.pow(1 + monthlyRate, tenure) - 1)
    );
  },
  60000 // Cache for 1 minute
);

// Demo Customers - same as backend
export const DEMO_CUSTOMERS = [
  {
    customerId: "CUST001",
    name: "Anita Sharma",
    email: "anita.sharma@email.com",
    phone: "9876543210",
    age: 32,
    city: "Mumbai",
    monthlyNetSalary: 85000,
    creditScore: 780,
    preApprovedLimit: 500000,
    employmentType: "salaried",
    existingLoan: "no",
    scenario: "✅ Ideal Customer - High credit score, good income"
  },
  {
    customerId: "CUST002",
    name: "Rahul Verma",
    email: "rahul.verma@email.com",
    phone: "9876543211",
    age: 28,
    city: "Delhi",
    monthlyNetSalary: 65000,
    creditScore: 680,
    preApprovedLimit: 300000,
    employmentType: "salaried",
    existingLoan: "yes",
    scenario: "⚠️ Moderate Risk - Lower credit score, existing loan"
  },
  {
    customerId: "CUST003",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "9876543212",
    age: 35,
    city: "Bangalore",
    monthlyNetSalary: 120000,
    creditScore: 820,
    preApprovedLimit: 1000000,
    employmentType: "salaried",
    existingLoan: "no",
    scenario: "🌟 Premium Customer - Excellent credit, high income"
  },
  {
    customerId: "CUST004",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "9876543213",
    age: 45,
    city: "Chennai",
    monthlyNetSalary: 45000,
    creditScore: 620,
    preApprovedLimit: 150000,
    employmentType: "self-employed",
    existingLoan: "yes",
    scenario: "❌ High Risk - Low credit score, will likely be rejected"
  },
];

// Agent Types and their actions
export type AgentType = "master" | "sales" | "verification" | "underwriting" | "sanction";

interface AgentState {
  agentType: AgentType;
  status: "idle" | "active" | "completed" | "error";
  lastAction: string;
  progress: number;
}

interface ConversationState {
  loanType?: string;
  loanAmount?: number;
  selectedProduct?: string;
  customerVerified?: boolean;
  creditApproved?: boolean;
  sanctioned?: boolean;
}

// Client-side orchestrator that mimics backend behavior
export class ClientSideOrchestrator {
  private conversationState: ConversationState = {};
  private agentStates: Record<AgentType, AgentState> = {
    master: { agentType: "master", status: "idle", lastAction: "", progress: 0 },
    sales: { agentType: "sales", status: "idle", lastAction: "", progress: 0 },
    verification: { agentType: "verification", status: "idle", lastAction: "", progress: 0 },
    underwriting: { agentType: "underwriting", status: "idle", lastAction: "", progress: 0 },
    sanction: { agentType: "sanction", status: "idle", lastAction: "", progress: 0 },
  };

  async processMessage(
    message: string,
    customer: typeof DEMO_CUSTOMERS[0] | null,
    userProfile?: { firstName?: string } | null
  ): Promise<{
    response: string;
    agentStates: AgentState[];
    logs: Array<{ agentType: string; action: string; details: string; level: string; timestamp: string }>;
  }> {
    const userName = customer?.name || userProfile?.firstName || "there";
    const messageLower = message.toLowerCase();
    const logs: Array<{ agentType: string; action: string; details: string; level: string; timestamp: string }> = [];

    const addLog = (agentType: string, action: string, details: string, level: string = "info") => {
      logs.push({ agentType, action, details, level, timestamp: new Date().toISOString() });
    };

    // Greeting
    if (messageLower.match(/^(hi|hello|hey|start|begin)$/)) {
      this.agentStates.master.status = "active";
      this.agentStates.master.lastAction = "Greeting user";
      addLog("master", "Greeting", "User initiated conversation", "info");

      return {
        response: `Hello ${userName}! 👋 I'm your AI Loan Assistant.

I can help you with:
• **Personal Loan** - For personal expenses
• **Home Loan** - For property purchase
• **Business Loan** - For business needs
• **Education Loan** - For studies

What type of loan are you looking for today?`,
        agentStates: Object.values(this.agentStates),
        logs,
      };
    }

    // Loan type selection
    if (messageLower.includes("personal") || messageLower.includes("home") || messageLower.includes("business") || messageLower.includes("education")) {
      let loanType = "Personal";
      if (messageLower.includes("home")) loanType = "Home";
      else if (messageLower.includes("business")) loanType = "Business";
      else if (messageLower.includes("education")) loanType = "Education";

      this.conversationState.loanType = loanType;
      this.agentStates.sales.status = "active";
      this.agentStates.sales.lastAction = `Processing ${loanType} loan inquiry`;
      addLog("sales", "Loan Type Selected", loanType, "success");

      const preApproved = customer?.preApprovedLimit || 300000;

      return {
        response: `Great choice! I'll help you with a **${loanType} Loan**.

Based on your profile:
• **Pre-approved Limit**: ₹${preApproved.toLocaleString('en-IN')}
• **Credit Score**: ${customer?.creditScore || 750}

How much would you like to borrow? (e.g., ₹1,00,000 or 1 Lakh)`,
        agentStates: Object.values(this.agentStates),
        logs,
      };
    }

    // Amount entry
    const amountMatch = messageLower.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lakhs|lac|l|k)?/);
    if (amountMatch) {
      let amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      const suffix = amountMatch[2]?.toLowerCase();
      
      if (suffix && ['lakh', 'lakhs', 'lac', 'l'].includes(suffix)) {
        amount *= 100000;
      } else if (suffix === 'k') {
        amount *= 1000;
      }

      if (amount > 1000) { // Likely a loan amount
        this.conversationState.loanAmount = amount;
        this.agentStates.sales.status = "completed";
        this.agentStates.sales.lastAction = "Amount confirmed";
        addLog("sales", "Amount Set", `₹${amount.toLocaleString('en-IN')}`, "success");

        return {
          response: `Perfect! I've noted your loan requirement:

✅ **Loan Type**: ${this.conversationState.loanType || "Personal"} Loan
✅ **Amount**: ₹${amount.toLocaleString('en-IN')}
✅ **Name**: ${userName}

I'll now initiate the verification process. **Do you confirm these details?**`,
          agentStates: Object.values(this.agentStates),
          logs,
        };
      }
    }

    // Confirmation - only if we have loan amount set
    const isConfirmation = ["yes", "confirm", "proceed", "ok", "okay", "sure", "yeah", "yep"].some(word => 
      messageLower.includes(word)
    );
    
    if (isConfirmation && this.conversationState.loanAmount && !this.conversationState.customerVerified) {
      this.agentStates.verification.status = "active";
      this.agentStates.verification.lastAction = "Verifying KYC documents...";
      addLog("verification", "KYC Check", "Validating customer documents", "info");

      // Simulate verification completion
      this.agentStates.verification.status = "completed";
      this.agentStates.verification.lastAction = "KYC Verified ✓";
      this.agentStates.underwriting.status = "active";
      this.agentStates.underwriting.lastAction = "Analyzing credit profile...";
      addLog("verification", "KYC Complete", "All documents verified", "success");
      addLog("underwriting", "Credit Check", "Running credit score analysis", "info");

      this.conversationState.customerVerified = true;

      return {
        response: `Excellent! ✅ Your details have been verified.

**🔄 Agent Status Updates:**
• ✅ **Sales Agent**: Offer selected
• ✅ **Verification Agent**: KYC documents verified
• 🔄 **Underwriting Agent**: Analyzing credit profile...
• ⏳ **Sanction Agent**: Waiting

Now running credit assessment...
• Checking credit score
• Analyzing financial history
• Calculating risk profile

Your application is progressing well! Type **"Check Status"** to see the result.`,
        agentStates: Object.values(this.agentStates),
        logs,
      };
    }

    // Status check - complete the workflow
    if (messageLower.includes("status") || messageLower.includes("check") || messageLower.includes("continue")) {
      // Check if we're in the underwriting phase (either status is active OR customer was just verified)
      if (this.agentStates.underwriting.status === "active" || 
          (this.conversationState.customerVerified && !this.conversationState.creditApproved)) {
        const creditScore = customer?.creditScore || 750;
        const loanAmount = this.conversationState.loanAmount || 100000;
        const preApproved = customer?.preApprovedLimit || 300000;

        // Decision based on credit score
        if (creditScore < 700) {
          // REJECT
          this.agentStates.underwriting.status = "completed";
          this.agentStates.underwriting.lastAction = "Credit rejected";
          addLog("underwriting", "Decision", "Rejected - Low credit score", "error");

          return {
            response: `❌ **Application Status: REJECTED**

Unfortunately, we cannot approve your application at this time.

**Reason**: Credit score (${creditScore}) is below our minimum threshold of 700.

**What you can do:**
• Improve your credit score
• Clear existing dues
• Try again after 6 months

Would you like to explore other options?`,
            agentStates: Object.values(this.agentStates),
            logs,
          };
        }

        if (loanAmount > preApproved * 2) {
          // REJECT - Amount too high
          this.agentStates.underwriting.status = "completed";
          this.agentStates.underwriting.lastAction = "Amount exceeds limit";
          addLog("underwriting", "Decision", "Rejected - Amount too high", "error");

          return {
            response: `❌ **Application Status: REJECTED**

**Reason**: Requested amount (₹${loanAmount.toLocaleString('en-IN')}) exceeds maximum eligible (₹${(preApproved * 2).toLocaleString('en-IN')}).

**What you can do:**
• Request a lower amount
• Provide additional income proof

Would you like to try with a different amount?`,
            agentStates: Object.values(this.agentStates),
            logs,
          };
        }

        // APPROVED!
        this.agentStates.underwriting.status = "completed";
        this.agentStates.underwriting.lastAction = "Credit approved ✓";
        this.agentStates.sanction.status = "completed";
        this.agentStates.sanction.lastAction = "Letter generated ✓";
        this.conversationState.creditApproved = true;
        this.conversationState.sanctioned = true;

        const refNumber = `SNCT${Date.now()}`;
        const loanType = this.conversationState.loanType || "Personal";
        const tenure = loanType === "Personal" ? 24 : loanType === "Home" ? 120 : 36;
        const rate = 10.5;
        const monthlyRate = rate / 12 / 100;
        const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));

        addLog("underwriting", "Approved", `Credit score ${creditScore} meets threshold`, "success");
        addLog("sanction", "Complete", `Sanction letter ${refNumber} generated`, "success");

        return {
          response: `🎉 **Congratulations, ${userName}!**

Your loan application has been **APPROVED**!

**🔄 Agent Status Updates:**
• ✅ **Sales Agent**: Offer selected
• ✅ **Verification Agent**: KYC verified
• ✅ **Underwriting Agent**: Credit approved (Score: ${creditScore})
• ✅ **Sanction Agent**: Letter generated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**OFFICIAL SANCTION LETTER**
Reference: **${refNumber}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **Loan Details**
• **Type**: ${loanType} Loan
• **Amount**: ₹${loanAmount.toLocaleString('en-IN')}
• **Interest Rate**: ${rate}% p.a.
• **Tenure**: ${tenure} months
• **Monthly EMI**: ₹${emi.toLocaleString('en-IN')}
• **Total Repayment**: ₹${(emi * tenure).toLocaleString('en-IN')}

✅ **Status**: SANCTIONED
📄 Your sanction letter is ready for download.

Thank you for choosing Project Orion! 🙏`,
          agentStates: Object.values(this.agentStates),
          logs,
        };
      }
    }

    // Cancel / Reset
    if (messageLower.includes("cancel") || messageLower.includes("reset") || messageLower.includes("start over") || messageLower.includes("new application")) {
      // Reset all states
      this.conversationState = {};
      Object.keys(this.agentStates).forEach(key => {
        this.agentStates[key as AgentType] = {
          agentType: key as AgentType,
          status: "idle",
          lastAction: "",
          progress: 0,
        };
      });
      addLog("master", "Reset", "Application cancelled by user", "info");

      return {
        response: `✅ Application cancelled and reset, ${userName}.

I've cleared all your previous data. We can start fresh!

What type of loan would you like to explore today?
• **Personal Loan** - For personal expenses
• **Home Loan** - For property purchase
• **Business Loan** - For business needs
• **Education Loan** - For studies`,
        agentStates: Object.values(this.agentStates),
        logs,
      };
    }

    // Default fallback
    return {
      response: `I understand, ${userName}. Let me help you with that.

You can tell me:
• The type of loan you need (Personal/Home/Business)
• The loan amount you're looking for
• Or say "Check Status" to see your application progress

How can I assist you today?`,
      agentStates: Object.values(this.agentStates),
      logs,
    };
  }

  reset() {
    this.conversationState = {};
    Object.keys(this.agentStates).forEach(key => {
      this.agentStates[key as AgentType] = {
        agentType: key as AgentType,
        status: "idle",
        lastAction: "",
        progress: 0,
      };
    });
  }
}

// Singleton instance
export const clientOrchestrator = new ClientSideOrchestrator();

// Generate PDF-like sanction letter (client-side)
export function generateSanctionLetter(params: {
  refNumber: string;
  customerName: string;
  loanType: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
}): string {
  const { refNumber, customerName, loanType, loanAmount, interestRate, tenure } = params;
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
  const totalRepayment = emi * tenure;
  const processingFee = Math.round(loanAmount * 0.01);
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return `
╔══════════════════════════════════════════════════════════════╗
║                   PROJECT ORION                              ║
║            Agentic AI Loan Processing System                 ║
╚══════════════════════════════════════════════════════════════╝

                    OFFICIAL SANCTION LETTER

Reference Number: ${refNumber}
Date: ${date}

Dear ${customerName},

We are pleased to inform you that your loan application has been APPROVED.

┌──────────────────────────────────────────────────────────────┐
│                        LOAN DETAILS                          │
├──────────────────────────────────────────────────────────────┤
│ Loan Type:           ${loanType.padEnd(40)}│
│ Sanctioned Amount:   ₹${loanAmount.toLocaleString('en-IN').padEnd(38)}│
│ Interest Rate:       ${interestRate}% per annum${' '.repeat(27)}│
│ Tenure:              ${tenure} months${' '.repeat(34)}│
│ Monthly EMI:         ₹${emi.toLocaleString('en-IN').padEnd(38)}│
│ Total Repayment:     ₹${totalRepayment.toLocaleString('en-IN').padEnd(38)}│
│ Processing Fee:      ₹${processingFee.toLocaleString('en-IN')} (1%)${' '.repeat(31)}│
└──────────────────────────────────────────────────────────────┘

TERMS & CONDITIONS:
───────────────────
1. This sanction is valid for 30 days from the date of issue.
2. Disbursement is subject to completion of all documentation.
3. Pre-closure is allowed after 6 months with nominal charges.
4. EMI should be paid by the 5th of every month.
5. Delay in EMI payment will attract penalty charges.

Thank you for choosing Project Orion!

Authorized Signatory
Project Orion Financial Services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  This is a system-generated document
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// Check if backend is available - with caching to avoid repeated calls
export async function checkBackendHealth(): Promise<boolean> {
  const cacheKey = 'backend-health';
  const cached = healthCheckCache.get(cacheKey);
  const now = Date.now();
  
  // Return cached result if less than 10 seconds old
  if (cached && (now - cached.timestamp) < 10000) {
    return cached.healthy;
  }
  
  try {
    const response = await fetch('/api/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    const healthy = response.ok;
    healthCheckCache.put(cacheKey, { healthy, timestamp: now });
    return healthy;
  } catch {
    healthCheckCache.put(cacheKey, { healthy: false, timestamp: now });
    return false;
  }
}

