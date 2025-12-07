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
   * GET /api/loans/products - Get all available loan products
   */
  app.get("/api/loans/products", async (_req: Request, res: Response) => {
    try {
      const loans = [
        // HDFC Bank
        {
          id: "hdfc-pl-001", bankName: "HDFC Bank", loanType: "Personal Loan", productName: "HDFC Xpress Personal Loan",
          interestRate: "10.50% - 15.75%", processingFee: "Up to 2.50%", maxAmount: 4000000, tenureRange: "12 - 60 months",
          features: ["Disbursal in 10 seconds", "No documentation for pre-approved", "Flexible tenure"],
          logo: "https://logo.clearbit.com/hdfcbank.com", category: "Personal"
        },
        {
          id: "hdfc-hl-002", bankName: "HDFC Bank", loanType: "Home Loan", productName: "HDFC Reach Home Loan",
          interestRate: "8.50% - 9.40%", processingFee: "0.50%", maxAmount: 10000000, tenureRange: "Up to 30 years",
          features: ["For micro-entrepreneurs", "Minimal income docs", "Quick processing"],
          logo: "https://logo.clearbit.com/hdfcbank.com", category: "Home"
        },
        {
          id: "hdfc-cd-003", bankName: "HDFC Bank", loanType: "Consumer Durable", productName: "EasyEMI Consumer Loan",
          interestRate: "12.00% - 16.00%", processingFee: "Nil", maxAmount: 500000, tenureRange: "3 - 24 months",
          features: ["No Cost EMI options", "Instant approval at store", "Minimal paperwork"],
          logo: "https://logo.clearbit.com/hdfcbank.com", category: "Consumer Durable"
        },
        {
          id: "hdfc-bl-004", bankName: "HDFC Bank", loanType: "Business Loan", productName: "Business Growth Loan",
          interestRate: "11.90% - 16.25%", processingFee: "2.00%", maxAmount: 7500000, tenureRange: "12 - 48 months",
          features: ["Collateral free", "Dropline Overdraft facility", "Quick disbursal"],
          logo: "https://logo.clearbit.com/hdfcbank.com", category: "Business"
        },
        {
          id: "hdfc-al-005", bankName: "HDFC Bank", loanType: "Auto Loan", productName: "New Car Loan",
          interestRate: "8.90% - 10.50%", processingFee: "0.50%", maxAmount: "100% On-Road Price", tenureRange: "12 - 84 months",
          features: ["100% funding", "30 minute approval", "Fixed interest rate"],
          logo: "https://logo.clearbit.com/hdfcbank.com", category: "Vehicle"
        },
        // ICICI Bank
        {
          id: "icici-pl-001", bankName: "ICICI Bank", loanType: "Personal Loan", productName: "ICICI Instant PL",
          interestRate: "10.75% onwards", processingFee: "Up to 2.25%", maxAmount: 5000000, tenureRange: "12 - 72 months",
          features: ["3 second disbursal", "No physical docs", "Fixed rate"],
          logo: "https://logo.clearbit.com/icicibank.com", category: "Personal"
        },
        {
          id: "icici-hl-002", bankName: "ICICI Bank", loanType: "Home Loan", productName: "ICICI Pratham",
          interestRate: "8.75% - 9.60%", processingFee: "0.50% - 1.00%", maxAmount: 5000000, tenureRange: "Up to 20 years",
          features: ["Affordable housing", "Subsidized rates", "Easy eligibility"],
          logo: "https://logo.clearbit.com/icicibank.com", category: "Home"
        },
        {
          id: "icici-gl-003", bankName: "ICICI Bank", loanType: "Gold Loan", productName: "Insta Gold Loan",
          interestRate: "9.50% - 16.00%", processingFee: "1.00%", maxAmount: 2000000, tenureRange: "6 - 12 months",
          features: ["30 min disbursal", "High per gram rate", "Safety locker"],
          logo: "https://logo.clearbit.com/icicibank.com", category: "Gold"
        },
        {
          id: "icici-el-004", bankName: "ICICI Bank", loanType: "Education Loan", productName: "iSmart Education Loan",
          interestRate: "9.50% - 13.00%", processingFee: "1.00%", maxAmount: 10000000, tenureRange: "Up to 15 years",
          features: ["Cover tuition + living", "Pre-visa disbursal", "Tax benefit"],
          logo: "https://logo.clearbit.com/icicibank.com", category: "Education"
        },
        {
          id: "icici-ml-005", bankName: "ICICI Bank", loanType: "Micro Loan", productName: "PayLater",
          interestRate: "0% for 30 days", processingFee: "Nil", maxAmount: 50000, tenureRange: "30 - 45 days",
          features: ["Instant digital credit", "Shop now pay later", "One click payment"],
          logo: "https://logo.clearbit.com/icicibank.com", category: "Micro"
        },
        // SBI
        {
          id: "sbi-pl-001", bankName: "SBI", loanType: "Personal Loan", productName: "Xpress Credit",
          interestRate: "11.00% - 14.00%", processingFee: "Nil to 1.00%", maxAmount: 2000000, tenureRange: "6 - 72 months",
          features: ["Low interest rates", "Daily reducing balance", "Zero prepayment penalty"],
          logo: "https://logo.clearbit.com/sbi.co.in", category: "Personal"
        },
        {
          id: "sbi-hl-002", bankName: "SBI", loanType: "Home Loan", productName: "SBI Regular Home Loan",
          interestRate: "8.40% onwards", processingFee: "0.35%", maxAmount: 100000000, tenureRange: "Up to 30 years",
          features: ["Lowest interest rates", "No hidden charges", "Overdraft facility"],
          logo: "https://logo.clearbit.com/sbi.co.in", category: "Home"
        },
        {
          id: "sbi-el-003", bankName: "SBI", loanType: "Education Loan", productName: "Scholar Loan",
          interestRate: "8.15% - 9.50%", processingFee: "Nil", maxAmount: 4000000, tenureRange: "Up to 15 years",
          features: ["For premier institutions", "100% financing", "Quick sanction"],
          logo: "https://logo.clearbit.com/sbi.co.in", category: "Education"
        },
        {
          id: "sbi-vl-004", bankName: "SBI", loanType: "Vehicle Loan", productName: "SBI Car Loan",
          interestRate: "8.65% - 9.50%", processingFee: "Nil", maxAmount: "90% On-Road Price", tenureRange: "Up to 7 years",
          features: ["Financing on-road price", "Longest tenure", "Lowest EMI"],
          logo: "https://logo.clearbit.com/sbi.co.in", category: "Vehicle"
        },
        {
          id: "sbi-mudra-005", bankName: "SBI", loanType: "Business Loan", productName: "e-Mudra Loan",
          interestRate: "9.75% onwards", processingFee: "Nil", maxAmount: 50000, tenureRange: "Up to 5 years",
          features: ["Instant micro loan", "For small business", "No collateral"],
          logo: "https://logo.clearbit.com/sbi.co.in", category: "Micro"
        },
        // Axis Bank
        {
          id: "axis-pl-001", bankName: "Axis Bank", loanType: "Personal Loan", productName: "24x7 Personal Loan",
          interestRate: "10.49% onwards", processingFee: "Up to 2%", maxAmount: 4000000, tenureRange: "12 - 60 months",
          features: ["Instant credit", "Choose your EMI", "No foreclosure charges"],
          logo: "https://logo.clearbit.com/axisbank.com", category: "Personal"
        },
        {
          id: "axis-hl-002", bankName: "Axis Bank", loanType: "Home Loan", productName: "Asha Home Loan",
          interestRate: "9.00% - 10.50%", processingFee: "1.00%", maxAmount: 3500000, tenureRange: "Up to 30 years",
          features: ["For mixed income", "12 EMI waiver", "Small ticket size"],
          logo: "https://logo.clearbit.com/axisbank.com", category: "Home"
        },
        {
          id: "axis-bl-003", bankName: "Axis Bank", loanType: "Business Loan", productName: "Growth Business Loan",
          interestRate: "14.25% - 18.00%", processingFee: "2.00%", maxAmount: 5000000, tenureRange: "12 - 36 months",
          features: ["Collateral free", "Minimal documentation", "Quick approval"],
          logo: "https://logo.clearbit.com/axisbank.com", category: "Business"
        },
        {
          id: "axis-lap-004", bankName: "Axis Bank", loanType: "Loan Against Property", productName: "Loan Against Property",
          interestRate: "9.50% - 11.00%", processingFee: "1.00%", maxAmount: 50000000, tenureRange: "Up to 15 years",
          features: ["Unlock property value", "High loan amount", "Flexible usage"],
          logo: "https://logo.clearbit.com/axisbank.com", category: "Mortgage"
        },
        {
          id: "axis-sl-005", bankName: "Axis Bank", loanType: "Small Loan", productName: "Small Ticket PL",
          interestRate: "13.00% onwards", processingFee: "500", maxAmount: 100000, tenureRange: "3 - 12 months",
          features: ["Instant small cash", "Paperless", "Emergency funds"],
          logo: "https://logo.clearbit.com/axisbank.com", category: "Micro"
        },
        // Kotak Mahindra Bank
        {
          id: "kotak-pl-001", bankName: "Kotak Mahindra Bank", loanType: "Personal Loan", productName: "Kotak Personal Loan",
          interestRate: "10.99% onwards", processingFee: "Up to 3%", maxAmount: 2500000, tenureRange: "12 - 60 months",
          features: ["Part prepayment allowed", "Instant approval", "Doorstep service"],
          logo: "https://logo.clearbit.com/kotak.com", category: "Personal"
        },
        {
          id: "kotak-hl-002", bankName: "Kotak Mahindra Bank", loanType: "Home Loan", productName: "Kotak Home Loan",
          interestRate: "8.70% onwards", processingFee: "Nil", maxAmount: 100000000, tenureRange: "Up to 20 years",
          features: ["Digital sanction", "Balance transfer special", "Nil processing fee"],
          logo: "https://logo.clearbit.com/kotak.com", category: "Home"
        },
        {
          id: "kotak-bl-003", bankName: "Kotak Mahindra Bank", loanType: "Business Loan", productName: "Business Loan",
          interestRate: "15.00% onwards", processingFee: "2.00%", maxAmount: 7500000, tenureRange: "12 - 48 months",
          features: ["No collateral", "Flexible repayment", "Quick disbursal"],
          logo: "https://logo.clearbit.com/kotak.com", category: "Business"
        },
        {
          id: "kotak-wc-004", bankName: "Kotak Mahindra Bank", loanType: "Working Capital", productName: "Working Capital Loan",
          interestRate: "10.00% - 14.00%", processingFee: "Custom", maxAmount: 20000000, tenureRange: "12 months renewable",
          features: ["Cash credit", "Overdraft", "Export credit"],
          logo: "https://logo.clearbit.com/kotak.com", category: "Business"
        },
        {
          id: "kotak-cd-005", bankName: "Kotak Mahindra Bank", loanType: "Consumer Durable", productName: "Smart EMI",
          interestRate: "14.00% - 18.00%", processingFee: "199", maxAmount: 300000, tenureRange: "3 - 18 months",
          features: ["Debit card EMI", "No documentation", "Instant convert"],
          logo: "https://logo.clearbit.com/kotak.com", category: "Consumer Durable"
        }
      ];
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loan products" });
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
