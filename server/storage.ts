import { randomUUID } from "crypto";
import type { 
  Customer, 
  CrmRecord, 
  LoanOffer,
  AuditLogEntry,
  UnderwritingResult
} from "@shared/schema";

// Synthetic customer dataset as specified
const CUSTOMERS_DATA: Customer[] = [
  { customerId: "CUST001", name: "Anita Verma", age: 29, city: "Delhi", phone: "+91-9810000001", email: "anita.verma@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 720, preApprovedLimit: 150000, employmentType: "Salaried", monthlyNetSalary: 65000 },
  { customerId: "CUST002", name: "Rahul Mehra", age: 35, city: "Mumbai", phone: "+91-9810000002", email: "rahul.mehra@example.com", existingLoan: "yes", existingLoanAmount: 250000, creditScore: 680, preApprovedLimit: 100000, employmentType: "Salaried", monthlyNetSalary: 85000 },
  { customerId: "CUST003", name: "Sneha Kapoor", age: 42, city: "Bengaluru", phone: "+91-9810000003", email: "sneha.kapoor@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 790, preApprovedLimit: 200000, employmentType: "Self-Employed", monthlyNetSalary: 120000 },
  { customerId: "CUST004", name: "Prakash Singh", age: 31, city: "Chandigarh", phone: "+91-9810000004", email: "prakash.singh@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 695, preApprovedLimit: 90000, employmentType: "Salaried", monthlyNetSalary: 40000 },
  { customerId: "CUST005", name: "Meera Nair", age: 27, city: "Hyderabad", phone: "+91-9810000005", email: "meera.nair@example.com", existingLoan: "yes", existingLoanAmount: 120000, creditScore: 710, preApprovedLimit: 110000, employmentType: "Salaried", monthlyNetSalary: 50000 },
  { customerId: "CUST006", name: "Aditya Rao", age: 38, city: "Pune", phone: "+91-9810000006", email: "aditya.rao@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 650, preApprovedLimit: 80000, employmentType: "Self-Employed", monthlyNetSalary: 95000 },
  { customerId: "CUST007", name: "Sunita Ghosh", age: 45, city: "Kolkata", phone: "+91-9810000007", email: "sunita.ghosh@example.com", existingLoan: "yes", existingLoanAmount: 500000, creditScore: 730, preApprovedLimit: 250000, employmentType: "Salaried", monthlyNetSalary: 180000 },
  { customerId: "CUST008", name: "Dev Patel", age: 30, city: "Ahmedabad", phone: "+91-9810000008", email: "dev.patel@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 770, preApprovedLimit: 160000, employmentType: "Salaried", monthlyNetSalary: 70000 },
  { customerId: "CUST009", name: "Ritika Sharma", age: 33, city: "Jaipur", phone: "+91-9810000009", email: "ritika.sharma@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 640, preApprovedLimit: 60000, employmentType: "Self-Employed", monthlyNetSalary: 55000 },
  { customerId: "CUST010", name: "Karan Verma", age: 28, city: "Noida", phone: "+91-9810000010", email: "karan.verma@example.com", existingLoan: "no", existingLoanAmount: 0, creditScore: 705, preApprovedLimit: 95000, employmentType: "Salaried", monthlyNetSalary: 48000 },
];

// CRM records for KYC verification
const CRM_DATA: CrmRecord[] = [
  { customerId: "CUST001", name: "Anita Verma", phone: "+91-9810000001", address: "123 Green Park, South Delhi", pincode: "110016", city: "Delhi", dob: "1995-03-15" },
  { customerId: "CUST002", name: "Rahul Mehra", phone: "+91-9810000002", address: "456 Bandra West, Mumbai", pincode: "400050", city: "Mumbai", dob: "1989-07-22" },
  { customerId: "CUST003", name: "Sneha Kapoor", phone: "+91-9810000003", address: "789 Indiranagar, Bangalore", pincode: "560038", city: "Bengaluru", dob: "1982-11-08" },
  { customerId: "CUST004", name: "Prakash Singh", phone: "+91-9810000004", address: "101 Sector 17, Chandigarh", pincode: "160017", city: "Chandigarh", dob: "1993-05-30" },
  { customerId: "CUST005", name: "Meera Nair", phone: "+91-9810000005", address: "202 Banjara Hills, Hyderabad", pincode: "500034", city: "Hyderabad", dob: "1997-09-12" },
  { customerId: "CUST006", name: "Aditya Rao", phone: "+91-9810000006", address: "303 Koregaon Park, Pune", pincode: "411001", city: "Pune", dob: "1986-01-25" },
  { customerId: "CUST007", name: "Sunita Ghosh", phone: "+91-9810000007", address: "404 Salt Lake, Kolkata", pincode: "700091", city: "Kolkata", dob: "1979-04-18" },
  { customerId: "CUST008", name: "Dev Patel", phone: "+91-9810000008", address: "505 SG Highway, Ahmedabad", pincode: "380054", city: "Ahmedabad", dob: "1994-12-03" },
  { customerId: "CUST009", name: "Ritika Sharma", phone: "+91-9810000009", address: "606 C-Scheme, Jaipur", pincode: "302001", city: "Jaipur", dob: "1991-08-20" },
  { customerId: "CUST010", name: "Karan Verma", phone: "+91-9810000010", address: "707 Sector 62, Noida", pincode: "201301", city: "Noida", dob: "1996-06-14" },
];

// Pre-approved loan offers
const OFFERS_DATA: LoanOffer[] = [
  { offerId: "OFF001", customerId: "CUST001", creditBand: "good", maxAmount: 300000, interestRate: 10.5, tenure: 36, processingFee: 1000 },
  { offerId: "OFF002", customerId: "CUST002", creditBand: "fair", maxAmount: 200000, interestRate: 12.5, tenure: 24, processingFee: 1500 },
  { offerId: "OFF003", customerId: "CUST003", creditBand: "excellent", maxAmount: 500000, interestRate: 9.5, tenure: 48, processingFee: 500 },
  { offerId: "OFF004", customerId: "CUST004", creditBand: "fair", maxAmount: 180000, interestRate: 13.0, tenure: 24, processingFee: 1500 },
  { offerId: "OFF005", customerId: "CUST005", creditBand: "good", maxAmount: 220000, interestRate: 11.0, tenure: 36, processingFee: 1000 },
  { offerId: "OFF006", customerId: "CUST006", creditBand: "poor", maxAmount: 160000, interestRate: 14.0, tenure: 24, processingFee: 2000 },
  { offerId: "OFF007", customerId: "CUST007", creditBand: "good", maxAmount: 500000, interestRate: 10.0, tenure: 48, processingFee: 1000 },
  { offerId: "OFF008", customerId: "CUST008", creditBand: "excellent", maxAmount: 320000, interestRate: 9.75, tenure: 36, processingFee: 500 },
  { offerId: "OFF009", customerId: "CUST009", creditBand: "poor", maxAmount: 120000, interestRate: 14.5, tenure: 24, processingFee: 2000 },
  { offerId: "OFF010", customerId: "CUST010", creditBand: "good", maxAmount: 190000, interestRate: 11.5, tenure: 36, processingFee: 1000 },
];

/**
 * Storage Interface - SOLID: Interface Segregation Principle
 * Defines clear contracts for data access operations
 */
export interface IStorage {
  // Customer operations
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(customerId: string): Promise<Customer | undefined>;
  
  // CRM operations
  getCrmRecord(customerId: string): Promise<CrmRecord | undefined>;
  
  // Credit Bureau operations
  getCreditData(customerId: string): Promise<{ score: number; preApprovedLimit: number } | undefined>;
  
  // Offer operations
  getOffers(): Promise<LoanOffer[]>;
  getOffersByCustomer(customerId: string): Promise<LoanOffer[]>;
  
  // Audit operations
  addAuditLog(entry: Omit<AuditLogEntry, "id">): Promise<AuditLogEntry>;
  getAuditLogs(customerId: string): Promise<AuditLogEntry[]>;
  
  // Sanction letter tracking
  saveSanctionLetter(customerId: string, referenceNumber: string): Promise<void>;
  getSanctionLetter(referenceNumber: string): Promise<{ customerId: string; generatedAt: string } | undefined>;
}

/**
 * In-Memory Storage Implementation - SOLID: Single Responsibility Principle
 * Handles all data persistence operations with mock data
 */
export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private crmRecords: Map<string, CrmRecord>;
  private offers: LoanOffer[];
  private auditLogs: AuditLogEntry[];
  private sanctionLetters: Map<string, { customerId: string; generatedAt: string }>;

  constructor() {
    // Initialize with synthetic data
    this.customers = new Map(CUSTOMERS_DATA.map(c => [c.customerId, c]));
    this.crmRecords = new Map(CRM_DATA.map(r => [r.customerId, r]));
    this.offers = [...OFFERS_DATA];
    this.auditLogs = [];
    this.sanctionLetters = new Map();
  }

  async getAllCustomers(): Promise<Customer[]> {
    // Simulate API latency (80-300ms)
    await this.simulateLatency();
    return Array.from(this.customers.values());
  }

  async getCustomer(customerId: string): Promise<Customer | undefined> {
    await this.simulateLatency();
    return this.customers.get(customerId);
  }

  async getCrmRecord(customerId: string): Promise<CrmRecord | undefined> {
    await this.simulateLatency();
    return this.crmRecords.get(customerId);
  }

  async getCreditData(customerId: string): Promise<{ score: number; preApprovedLimit: number } | undefined> {
    await this.simulateLatency();
    const customer = this.customers.get(customerId);
    if (!customer) return undefined;
    return {
      score: customer.creditScore,
      preApprovedLimit: customer.preApprovedLimit,
    };
  }

  async getOffers(): Promise<LoanOffer[]> {
    await this.simulateLatency();
    return [...this.offers];
  }

  async getOffersByCustomer(customerId: string): Promise<LoanOffer[]> {
    await this.simulateLatency();
    return this.offers.filter(o => o.customerId === customerId);
  }

  async addAuditLog(entry: Omit<AuditLogEntry, "id">): Promise<AuditLogEntry> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: randomUUID(),
    };
    this.auditLogs.push(auditEntry);
    return auditEntry;
  }

  async getAuditLogs(customerId: string): Promise<AuditLogEntry[]> {
    await this.simulateLatency();
    return this.auditLogs.filter(log => log.customerId === customerId);
  }

  async saveSanctionLetter(customerId: string, referenceNumber: string): Promise<void> {
    this.sanctionLetters.set(referenceNumber, {
      customerId,
      generatedAt: new Date().toISOString(),
    });
  }

  async getSanctionLetter(referenceNumber: string): Promise<{ customerId: string; generatedAt: string } | undefined> {
    await this.simulateLatency();
    return this.sanctionLetters.get(referenceNumber);
  }

  /**
   * Simulates realistic API latency (80-300ms)
   */
  private async simulateLatency(): Promise<void> {
    const delay = 80 + Math.random() * 220;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Singleton storage instance
export const storage = new MemStorage();
