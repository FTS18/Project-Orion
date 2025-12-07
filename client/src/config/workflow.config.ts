/**
 * Workflow Configuration
 * Controls workflow steps, order, conditions, and transitions
 * Modify this file to customize the loan workflow without changing component code
 */

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentId: string;
  // Step order (1-based)
  order: number;
  // Required data from previous steps
  requiredInputs: string[];
  // Data this step produces
  outputs: string[];
  // Conditions to skip this step
  skipConditions?: SkipCondition[];
  // Retry configuration
  maxRetries: number;
  retryDelayMs: number;
  // Timeout in milliseconds
  timeoutMs: number;
  // Whether this step can be parallelized
  canParallelize: boolean;
  // Success/failure messages
  messages: {
    start: string;
    success: string;
    failure: string;
    timeout: string;
  };
}

export interface SkipCondition {
  field: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains";
  value: any;
}

export const WORKFLOW_STEPS: Record<string, WorkflowStep> = {
  initiate: {
    id: "initiate",
    name: "Initiate Application",
    description: "Start the loan application process",
    agentId: "master",
    order: 1,
    requiredInputs: [],
    outputs: ["applicationId", "customerId"],
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    canParallelize: false,
    messages: {
      start: "Initiating loan application...",
      success: "Application initiated successfully",
      failure: "Failed to initiate application",
      timeout: "Application initiation timed out",
    },
  },
  collectInfo: {
    id: "collectInfo",
    name: "Collect Customer Information",
    description: "Gather customer details and loan requirements",
    agentId: "sales",
    order: 2,
    requiredInputs: ["customerId"],
    outputs: ["customerData", "loanRequest"],
    maxRetries: 2,
    retryDelayMs: 2000,
    timeoutMs: 120000,
    canParallelize: false,
    messages: {
      start: "Collecting customer information...",
      success: "Customer information collected",
      failure: "Failed to collect customer information",
      timeout: "Information collection timed out",
    },
  },
  verifyKYC: {
    id: "verifyKYC",
    name: "KYC Verification",
    description: "Verify customer identity and documents",
    agentId: "verification",
    order: 3,
    requiredInputs: ["customerData"],
    outputs: ["kycStatus", "verificationDetails"],
    maxRetries: 3,
    retryDelayMs: 3000,
    timeoutMs: 60000,
    canParallelize: true,
    messages: {
      start: "Verifying KYC documents...",
      success: "KYC verification completed",
      failure: "KYC verification failed",
      timeout: "KYC verification timed out",
    },
  },
  creditCheck: {
    id: "creditCheck",
    name: "Credit Bureau Check",
    description: "Check credit score and history",
    agentId: "verification",
    order: 4,
    requiredInputs: ["customerId"],
    outputs: ["creditScore", "creditHistory", "preApprovedLimit"],
    maxRetries: 3,
    retryDelayMs: 2000,
    timeoutMs: 45000,
    canParallelize: true,
    messages: {
      start: "Checking credit bureau...",
      success: "Credit check completed",
      failure: "Credit check failed",
      timeout: "Credit check timed out",
    },
  },
  underwrite: {
    id: "underwrite",
    name: "Underwriting",
    description: "Evaluate loan eligibility and risk",
    agentId: "underwriting",
    order: 5,
    requiredInputs: ["customerData", "loanRequest", "kycStatus", "creditScore"],
    outputs: ["underwritingDecision", "approvedAmount", "interestRate", "emi"],
    maxRetries: 2,
    retryDelayMs: 5000,
    timeoutMs: 90000,
    canParallelize: false,
    messages: {
      start: "Processing underwriting...",
      success: "Underwriting decision made",
      failure: "Underwriting process failed",
      timeout: "Underwriting timed out",
    },
  },
  generateSanction: {
    id: "generateSanction",
    name: "Generate Sanction Letter",
    description: "Create loan approval documentation",
    agentId: "sanction",
    order: 6,
    requiredInputs: ["underwritingDecision", "approvedAmount", "interestRate"],
    outputs: ["sanctionLetter", "referenceNumber"],
    skipConditions: [
      { field: "underwritingDecision", operator: "notEquals", value: "APPROVE" }
    ],
    maxRetries: 3,
    retryDelayMs: 2000,
    timeoutMs: 60000,
    canParallelize: false,
    messages: {
      start: "Generating sanction letter...",
      success: "Sanction letter generated",
      failure: "Failed to generate sanction letter",
      timeout: "Sanction letter generation timed out",
    },
  },
};

// Get steps in order
export const getOrderedSteps = (): WorkflowStep[] => {
  return Object.values(WORKFLOW_STEPS).sort((a, b) => a.order - b.order);
};

// Get step by ID
export const getStep = (stepId: string): WorkflowStep | undefined => {
  return WORKFLOW_STEPS[stepId];
};

// Check if step should be skipped
export const shouldSkipStep = (step: WorkflowStep, context: Record<string, any>): boolean => {
  if (!step.skipConditions || step.skipConditions.length === 0) {
    return false;
  }

  return step.skipConditions.some(condition => {
    const value = context[condition.field];
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "notEquals":
        return value !== condition.value;
      case "greaterThan":
        return value > condition.value;
      case "lessThan":
        return value < condition.value;
      case "contains":
        return Array.isArray(value) ? value.includes(condition.value) : String(value).includes(condition.value);
      default:
        return false;
    }
  });
};

// Workflow status
export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface WorkflowState {
  currentStep: string | null;
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];
  context: Record<string, any>;
  startTime: Date | null;
  endTime: Date | null;
  status: WorkflowStatus;
}

// Create initial workflow state
export const createInitialWorkflowState = (): WorkflowState => ({
  currentStep: null,
  completedSteps: [],
  failedSteps: [],
  skippedSteps: [],
  context: {},
  startTime: null,
  endTime: null,
  status: "pending",
});
