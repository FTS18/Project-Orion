import { z } from "zod";

// Customer Schema
export const customerSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  age: z.number(),
  city: z.string(),
  phone: z.string(),
  email: z.string().email(),
  existingLoan: z.enum(["yes", "no"]),
  existingLoanAmount: z.number(),
  creditScore: z.number().min(0).max(900),
  preApprovedLimit: z.number(),
  employmentType: z.enum(["Salaried", "Self-Employed"]),
  monthlyNetSalary: z.number(),
});

export type Customer = z.infer<typeof customerSchema>;

// CRM KYC Record
export const crmRecordSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  pincode: z.string(),
  city: z.string(),
  dob: z.string(),
});

export type CrmRecord = z.infer<typeof crmRecordSchema>;

// Credit Bureau Response
export const creditBureauResponseSchema = z.object({
  customerId: z.string(),
  score: z.number().min(0).max(900),
  preApprovedLimit: z.number(),
});

export type CreditBureauResponse = z.infer<typeof creditBureauResponseSchema>;

// Loan Offer
export const loanOfferSchema = z.object({
  offerId: z.string(),
  customerId: z.string(),
  creditBand: z.enum(["excellent", "good", "fair", "poor"]),
  maxAmount: z.number(),
  interestRate: z.number(),
  tenure: z.number(),
  processingFee: z.number(),
});

export type LoanOffer = z.infer<typeof loanOfferSchema>;

// Loan Request
export const loanRequestSchema = z.object({
  customerId: z.string(),
  amount: z.number().min(10000),
  tenure: z.number().min(6).max(84),
  purpose: z.string(),
  rate: z.number().optional(),
});

export type LoanRequest = z.infer<typeof loanRequestSchema>;

export const insertLoanRequestSchema = loanRequestSchema;
export type InsertLoanRequest = z.infer<typeof insertLoanRequestSchema>;

// KYC Verification Request
export const kycVerificationRequestSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  phone: z.string(),
  address: z.string(),
});

export type KycVerificationRequest = z.infer<typeof kycVerificationRequestSchema>;

// KYC Verification Response
export const kycVerificationResponseSchema = z.object({
  status: z.enum(["VERIFIED", "PENDING", "FAILED"]),
  mismatches: z.array(z.string()),
});

export type KycVerificationResponse = z.infer<typeof kycVerificationResponseSchema>;

// Salary Extraction Response
export const salaryExtractionResponseSchema = z.object({
  grossIncome: z.number(),
  netIncome: z.number(),
  employer: z.string(),
  parsed: z.boolean(),
});

export type SalaryExtractionResponse = z.infer<typeof salaryExtractionResponseSchema>;

// Underwriting Decision
export const underwritingDecisionSchema = z.enum(["APPROVE", "REJECT", "PENDING"]);
export type UnderwritingDecision = z.infer<typeof underwritingDecisionSchema>;

// Underwriting Request
export const underwritingRequestSchema = z.object({
  customerId: z.string(),
  loanRequest: z.object({
    amount: z.number(),
    tenure: z.number(),
    rate: z.number(),
  }),
  creditScore: z.number().optional(),
  preApprovedLimit: z.number().optional(),
});

export type UnderwritingRequest = z.infer<typeof underwritingRequestSchema>;

// Underwriting Result
export const underwritingResultSchema = z.object({
  decision: underwritingDecisionSchema,
  reason: z.string(),
  requiredAction: z.string().optional(),
  emi: z.number().optional(),
  totalAmount: z.number().optional(),
  referenceNumber: z.string().optional(),
});

export type UnderwritingResult = z.infer<typeof underwritingResultSchema>;

// Sanction Letter Request
export const sanctionLetterRequestSchema = z.object({
  customerId: z.string(),
  loanTerms: z.object({
    amount: z.number(),
    tenure: z.number(),
    rate: z.number(),
    emi: z.number(),
    totalAmount: z.number(),
  }),
  signatory: z.string(),
});

export type SanctionLetterRequest = z.infer<typeof sanctionLetterRequestSchema>;

// Sanction Letter Response
export const sanctionLetterResponseSchema = z.object({
  pdfUrl: z.string(),
  referenceNumber: z.string(),
  generatedAt: z.string(),
});

export type SanctionLetterResponse = z.infer<typeof sanctionLetterResponseSchema>;

// Agent Types for Agentic AI Mode
export const agentTypeSchema = z.enum(["master", "sales", "verification", "underwriting", "sanction"]);
export type AgentType = z.infer<typeof agentTypeSchema>;

export const agentStatusSchema = z.enum(["idle", "active", "completed", "error"]);
export type AgentStatus = z.infer<typeof agentStatusSchema>;

// Agent Message
export const agentMessageSchema = z.object({
  id: z.string(),
  agentType: agentTypeSchema,
  role: z.enum(["user", "agent", "system"]),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type AgentMessage = z.infer<typeof agentMessageSchema>;

// Agent State
export const agentStateSchema = z.object({
  agentType: agentTypeSchema,
  status: agentStatusSchema,
  lastAction: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export type AgentState = z.infer<typeof agentStateSchema>;

// Workflow Log Entry
export const workflowLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  agentType: agentTypeSchema,
  action: z.string(),
  details: z.string(),
  level: z.enum(["info", "warning", "error", "success"]),
});

export type WorkflowLogEntry = z.infer<typeof workflowLogEntrySchema>;

// Application State for Standard Mode
export const applicationStateSchema = z.object({
  step: z.number().min(1).max(4),
  customerId: z.string().optional(),
  customerData: customerSchema.optional(),
  loanRequest: loanRequestSchema.optional(),
  kycVerification: kycVerificationResponseSchema.optional(),
  salaryData: salaryExtractionResponseSchema.optional(),
  underwritingResult: underwritingResultSchema.optional(),
  sanctionLetter: sanctionLetterResponseSchema.optional(),
});

export type ApplicationState = z.infer<typeof applicationStateSchema>;

// Audit Log Entry
export const auditLogEntrySchema = z.object({
  id: z.string(),
  customerId: z.string(),
  timestamp: z.string(),
  action: z.string(),
  decision: underwritingDecisionSchema.optional(),
  reason: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;

// API Response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// Users table (keeping existing for auth if needed)
export const users = {
  id: "varchar",
  username: "text",
  password: "text",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { id: string };
