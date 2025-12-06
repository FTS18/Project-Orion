import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  kycVerificationRequestSchema, 
  underwritingRequestSchema,
  sanctionLetterRequestSchema 
} from "@shared/schema";
import type { 
  KycVerificationResponse, 
  SalaryExtractionResponse,
  UnderwritingResult,
  SanctionLetterResponse
} from "@shared/schema";
import { z } from "zod";

/**
 * Underwriting Engine - SOLID: Single Responsibility Principle
 * Implements exact underwriting rules as specified
 */
class UnderwritingEngine {
  /**
   * Calculate monthly EMI using standard amortization formula
   */
  private calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;
    
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) 
              / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }

  /**
   * Process underwriting decision based on exact rules
   * Rule 1: creditScore < 700 → REJECT
   * Rule 2: loanAmount ≤ preApprovedLimit → APPROVE
   * Rule 3: loanAmount ≤ 2 × preApprovedLimit → check salary
   *   - EMI ≤ 50% monthly salary → APPROVE
   *   - EMI > 50% monthly salary → REJECT
   * Rule 4: loanAmount > 2 × preApprovedLimit → REJECT
   */
  async evaluate(
    customerId: string,
    loanAmount: number,
    tenure: number,
    rate: number,
    creditScore?: number,
    preApprovedLimit?: number,
    monthlyNetSalary?: number
  ): Promise<UnderwritingResult> {
    const referenceNumber = `LN${Date.now().toString().slice(-8)}`;
    const emi = this.calculateEMI(loanAmount, rate, tenure);
    const totalAmount = emi * tenure;

    // Rule 1: Credit score check
    if (creditScore !== undefined && creditScore < 700) {
      await this.logDecision(customerId, "REJECT", `Credit score (${creditScore}) below minimum threshold of 700`);
      return {
        decision: "REJECT",
        reason: `Credit score (${creditScore}) is below the minimum required threshold of 700.`,
        requiredAction: "Improve credit score before reapplying.",
        emi,
        totalAmount,
        referenceNumber,
      };
    }

    // Rule 2: Within pre-approved limit
    if (preApprovedLimit !== undefined && loanAmount <= preApprovedLimit) {
      await this.logDecision(customerId, "APPROVE", `Loan amount within pre-approved limit`);
      return {
        decision: "APPROVE",
        reason: `Loan amount (₹${loanAmount.toLocaleString('en-IN')}) is within your pre-approved limit of ₹${preApprovedLimit.toLocaleString('en-IN')}. Instant approval granted.`,
        emi,
        totalAmount,
        referenceNumber,
      };
    }

    // Rule 3: Within 2x pre-approved limit - check DTI
    if (preApprovedLimit !== undefined && loanAmount <= preApprovedLimit * 2) {
      if (monthlyNetSalary !== undefined) {
        const dtiRatio = emi / monthlyNetSalary;
        
        if (dtiRatio <= 0.5) {
          await this.logDecision(customerId, "APPROVE", `EMI-to-income ratio (${(dtiRatio * 100).toFixed(1)}%) within limit`);
          return {
            decision: "APPROVE",
            reason: `Your EMI-to-income ratio (${(dtiRatio * 100).toFixed(1)}%) is within the acceptable limit of 50%.`,
            emi,
            totalAmount,
            referenceNumber,
          };
        } else {
          await this.logDecision(customerId, "REJECT", `EMI-to-income ratio (${(dtiRatio * 100).toFixed(1)}%) exceeds 50%`);
          return {
            decision: "REJECT",
            reason: `Your EMI-to-income ratio (${(dtiRatio * 100).toFixed(1)}%) exceeds the maximum allowed limit of 50%.`,
            requiredAction: "Consider a lower loan amount or longer tenure to reduce EMI.",
            emi,
            totalAmount,
            referenceNumber,
          };
        }
      }
      
      // Need salary slip for verification
      return {
        decision: "PENDING",
        reason: "Loan amount exceeds pre-approved limit. Additional income verification required.",
        requiredAction: "Please upload your salary slip for income verification.",
        emi,
        totalAmount,
        referenceNumber,
      };
    }

    // Rule 4: Exceeds 2x pre-approved limit
    await this.logDecision(customerId, "REJECT", `Loan amount exceeds 2x pre-approved limit`);
    return {
      decision: "REJECT",
      reason: `Requested amount (₹${loanAmount.toLocaleString('en-IN')}) exceeds the maximum eligible limit of ₹${((preApprovedLimit || 0) * 2).toLocaleString('en-IN')}.`,
      requiredAction: `Maximum eligible amount: ₹${((preApprovedLimit || 0) * 2).toLocaleString('en-IN')}`,
      emi,
      totalAmount,
      referenceNumber,
    };
  }

  private async logDecision(customerId: string, decision: string, reason: string): Promise<void> {
    await storage.addAuditLog({
      customerId,
      timestamp: new Date().toISOString(),
      action: "UNDERWRITING_DECISION",
      decision: decision as "APPROVE" | "REJECT" | "PENDING",
      reason,
      metadata: { engine: "UnderwritingEngine", version: "1.0" },
    });
  }
}

/**
 * KYC Verification Service - SOLID: Single Responsibility Principle
 */
class KycVerificationService {
  /**
   * Verify KYC details with fuzzy matching
   */
  async verify(
    customerId: string,
    providedName: string,
    providedPhone: string,
    providedAddress: string
  ): Promise<KycVerificationResponse> {
    const crmRecord = await storage.getCrmRecord(customerId);
    
    if (!crmRecord) {
      return {
        status: "FAILED",
        mismatches: ["Customer not found in CRM"],
      };
    }

    const mismatches: string[] = [];

    // Name verification (exact or fuzzy match)
    if (!this.fuzzyMatch(providedName, crmRecord.name)) {
      mismatches.push(`Name mismatch: provided "${providedName}", expected "${crmRecord.name}"`);
    }

    // Phone verification (exact match)
    const normalizedProvided = providedPhone.replace(/[\s-]/g, '');
    const normalizedCrm = crmRecord.phone.replace(/[\s-]/g, '');
    if (normalizedProvided !== normalizedCrm) {
      mismatches.push(`Phone mismatch: provided "${providedPhone}"`);
    }

    // Address verification (city/pincode check)
    const addressLower = providedAddress.toLowerCase();
    const cityMatch = addressLower.includes(crmRecord.city.toLowerCase());
    const pincodeMatch = addressLower.includes(crmRecord.pincode);
    
    if (!cityMatch && !pincodeMatch) {
      mismatches.push(`Address must include city (${crmRecord.city}) or pincode (${crmRecord.pincode})`);
    }

    // Log the verification attempt
    await storage.addAuditLog({
      customerId,
      timestamp: new Date().toISOString(),
      action: "KYC_VERIFICATION",
      reason: mismatches.length === 0 ? "All details verified" : `Mismatches found: ${mismatches.length}`,
      metadata: { mismatches, providedName, providedPhone, providedAddress },
    });

    return {
      status: mismatches.length === 0 ? "VERIFIED" : "PENDING",
      mismatches,
    };
  }

  private fuzzyMatch(str1: string, str2: string): boolean {
    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
    const n1 = normalize(str1);
    const n2 = normalize(str2);
    
    // Exact match
    if (n1 === n2) return true;
    
    // Contains match
    if (n1.includes(n2) || n2.includes(n1)) return true;
    
    // Simple Levenshtein-ish threshold (for typos)
    const similarity = this.calculateSimilarity(n1, n2);
    return similarity > 0.8;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    return matches / longer.length;
  }
}

// Service instances
const underwritingEngine = new UnderwritingEngine();
const kycService = new KycVerificationService();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  /**
   * GET /api/customers - List all customers
   */
  app.get("/api/customers", async (_req: Request, res: Response) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  /**
   * GET /api/crm/:customerId - Get CRM/KYC record
   */
  app.get("/api/crm/:customerId", async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const record = await storage.getCrmRecord(customerId);
      
      if (!record) {
        return res.status(404).json({ error: "Customer not found in CRM" });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CRM record" });
    }
  });

  /**
   * GET /api/credit/:customerId - Get credit bureau data
   */
  app.get("/api/credit/:customerId", async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const creditData = await storage.getCreditData(customerId);
      
      if (!creditData) {
        return res.status(404).json({ error: "Credit data not found" });
      }
      
      res.json(creditData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credit data" });
    }
  });

  /**
   * GET /api/offers - Get all pre-approved offers
   */
  app.get("/api/offers", async (_req: Request, res: Response) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  /**
   * POST /api/verify-kyc - Verify KYC details
   */
  app.post("/api/verify-kyc", async (req: Request, res: Response) => {
    try {
      const validation = kycVerificationRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request body",
          details: validation.error.errors 
        });
      }

      const { customerId, name, phone, address } = validation.data;
      const result = await kycService.verify(customerId, name, phone, address);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "KYC verification failed" });
    }
  });

  /**
   * POST /api/extract-salary - Extract salary from uploaded document
   * Simulates OCR extraction from salary slip
   */
  app.post("/api/extract-salary", async (req: Request, res: Response) => {
    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get customer data to generate realistic salary info
      const customerId = req.body?.customerId || req.query?.customerId;
      let customer = null;
      
      if (customerId) {
        customer = await storage.getCustomer(customerId as string);
      }

      // Generate simulated extraction result
      const netSalary = customer?.monthlyNetSalary || 50000;
      const result: SalaryExtractionResponse = {
        grossIncome: Math.round(netSalary * 1.3),
        netIncome: netSalary,
        employer: customer?.employmentType === "Self-Employed" 
          ? "Self-Employed" 
          : "Agentic Technologies Pvt. Ltd.",
        parsed: true,
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Salary extraction failed" });
    }
  });

  /**
   * POST /api/underwrite - Process underwriting decision
   */
  app.post("/api/underwrite", async (req: Request, res: Response) => {
    try {
      const validation = underwritingRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request body",
          details: validation.error.errors 
        });
      }

      const { customerId, loanRequest, creditScore, preApprovedLimit } = validation.data;
      
      // Get customer data for salary info
      const customer = await storage.getCustomer(customerId);
      
      const result = await underwritingEngine.evaluate(
        customerId,
        loanRequest.amount,
        loanRequest.tenure,
        loanRequest.rate,
        creditScore,
        preApprovedLimit,
        customer?.monthlyNetSalary
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Underwriting process failed" });
    }
  });

  /**
   * POST /api/generate-sanction-letter - Generate sanction letter PDF
   */
  app.post("/api/generate-sanction-letter", async (req: Request, res: Response) => {
    try {
      const validation = sanctionLetterRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request body",
          details: validation.error.errors 
        });
      }

      const { customerId, loanTerms, signatory } = validation.data;
      
      // Generate unique reference number
      const referenceNumber = `SNCT${Date.now().toString().slice(-10)}`;
      const generatedAt = new Date().toISOString();
      
      // Save sanction letter record
      await storage.saveSanctionLetter(customerId, referenceNumber);
      
      // Log the sanction letter generation
      await storage.addAuditLog({
        customerId,
        timestamp: generatedAt,
        action: "SANCTION_LETTER_GENERATED",
        reason: `Sanction letter generated with reference ${referenceNumber}`,
        metadata: { loanTerms, signatory, referenceNumber },
      });

      const result: SanctionLetterResponse = {
        pdfUrl: `/api/sanction/${referenceNumber}.pdf`,
        referenceNumber,
        generatedAt,
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Sanction letter generation failed" });
    }
  });

  /**
   * GET /api/audit/:customerId - Get audit trail for customer
   */
  app.get("/api/audit/:customerId", async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const logs = await storage.getAuditLogs(customerId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  /**
   * GET /api/sanction/:referenceNumber.pdf - Download sanction letter
   * In a real implementation, this would generate/serve an actual PDF
   */
  app.get("/api/sanction/:referenceNumber.pdf", async (req: Request, res: Response) => {
    try {
      const referenceNumber = req.params.referenceNumber.replace('.pdf', '');
      const letter = await storage.getSanctionLetter(referenceNumber);
      
      if (!letter) {
        return res.status(404).json({ error: "Sanction letter not found" });
      }

      // In production, this would generate and serve an actual PDF
      // For now, return a simple text response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sanction_${referenceNumber}.pdf`);
      
      // Placeholder PDF content (in production, use a PDF library)
      res.send(`Sanction Letter\nReference: ${referenceNumber}\nGenerated: ${letter.generatedAt}`);
    } catch (error) {
      res.status(500).json({ error: "Failed to download sanction letter" });
    }
  });

  /**
   * Business Rules API
   */
  
  // In-memory rules storage (in production, use database)
  let businessRules: Array<{
    name: string;
    rule_type: string;
    operator: string;
    threshold: any;
    action: string;
    priority: number;
    enabled: boolean;
    description: string;
  }> = [
    {
      name: "credit_score_minimum",
      rule_type: "credit_score",
      operator: "greater_than",
      threshold: 700,
      action: "reject",
      priority: 1,
      enabled: true,
      description: "Reject applications with credit score below 700"
    },
    {
      name: "max_loan_amount",
      rule_type: "loan_amount",
      operator: "less_than",
      threshold: 5000000,
      action: "approve",
      priority: 2,
      enabled: true,
      description: "Maximum loan amount of 50 lakhs"
    },
    {
      name: "dti_ratio_check",
      rule_type: "dti_ratio",
      operator: "less_than",
      threshold: 0.5,
      action: "approve",
      priority: 3,
      enabled: true,
      description: "EMI should not exceed 50% of monthly income"
    }
  ];

  /**
   * GET /api/rules - Get all business rules
   */
  app.get("/api/rules", async (_req: Request, res: Response) => {
    try {
      res.json({ rules: businessRules });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rules" });
    }
  });

  /**
   * POST /api/rules - Add a new business rule
   */
  app.post("/api/rules", async (req: Request, res: Response) => {
    try {
      const newRule = req.body;
      businessRules.push(newRule);
      res.json({ success: true, rule: newRule });
    } catch (error) {
      res.status(500).json({ error: "Failed to add rule" });
    }
  });

  /**
   * PUT /api/rules/:name - Update a business rule
   */
  app.put("/api/rules/:name", async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const updates = req.body;
      const index = businessRules.findIndex(r => r.name === name);
      
      if (index === -1) {
        return res.status(404).json({ error: "Rule not found" });
      }
      
      businessRules[index] = { ...businessRules[index], ...updates };
      res.json({ success: true, rule: businessRules[index] });
    } catch (error) {
      res.status(500).json({ error: "Failed to update rule" });
    }
  });

  /**
   * DELETE /api/rules/:name - Delete a business rule
   */
  app.delete("/api/rules/:name", async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const index = businessRules.findIndex(r => r.name === name);
      
      if (index === -1) {
        return res.status(404).json({ error: "Rule not found" });
      }
      
      businessRules.splice(index, 1);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rule" });
    }
  });

  /**
   * User Profile API
   */
  
  // In-memory user profiles (in production, use Supabase)
  const userProfiles: Map<string, {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    onboardingComplete: boolean;
    preferences: {
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
      language: string;
    };
    createdAt: string;
    updatedAt: string;
  }> = new Map();

  /**
   * GET /api/user/profile - Get user profile
   */
  app.get("/api/user/profile", async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const profile = userProfiles.get(userId);
      
      if (!profile) {
        return res.json({ 
          exists: false,
          onboardingRequired: true 
        });
      }
      
      res.json({ exists: true, profile });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  /**
   * POST /api/user/profile - Create or update user profile
   */
  app.post("/api/user/profile", async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const email = req.headers['x-user-email'] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { firstName, lastName, phone, preferences } = req.body;
      const now = new Date().toISOString();
      
      const existingProfile = userProfiles.get(userId);
      
      const profile = {
        userId,
        email: email || existingProfile?.email || '',
        firstName: firstName || existingProfile?.firstName,
        lastName: lastName || existingProfile?.lastName,
        phone: phone || existingProfile?.phone,
        onboardingComplete: true,
        preferences: preferences || existingProfile?.preferences || {
          theme: 'system',
          notifications: true,
          language: 'en'
        },
        createdAt: existingProfile?.createdAt || now,
        updatedAt: now
      };
      
      userProfiles.set(userId, profile);
      res.json({ success: true, profile });
    } catch (error) {
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  return httpServer;
}
