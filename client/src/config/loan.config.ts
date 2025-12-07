/**
 * Loan Configuration
 * Controls loan products, interest rates, limits, tenure options, and eligibility rules
 * Modify this file to customize loan parameters without changing component code
 */

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  // Amount limits
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  amountStep: number;
  // Tenure limits (in months)
  minTenure: number;
  maxTenure: number;
  defaultTenure: number;
  tenureOptions: number[];
  // Interest rates
  baseInterestRate: number;
  // Rate adjustments based on credit score
  rateAdjustments: {
    excellent: number;  // 750+
    good: number;       // 650-749
    fair: number;       // 550-649
    poor: number;       // below 550
  };
  // Processing fee
  processingFeeRate: number;
  minProcessingFee: number;
  // Eligibility
  minCreditScore: number;
  minAge: number;
  maxAge: number;
  minIncome: number;
  // Feature flags
  isActive: boolean;
  requiresCollateral: boolean;
}

export const LOAN_PRODUCTS: Record<string, LoanProduct> = {
  personal: {
    id: "personal",
    name: "Personal Loan",
    description: "Unsecured personal loan for various needs",
    minAmount: 50000,
    maxAmount: 2500000,
    defaultAmount: 200000,
    amountStep: 10000,
    minTenure: 6,
    maxTenure: 60,
    defaultTenure: 24,
    tenureOptions: [6, 12, 18, 24, 36, 48, 60],
    baseInterestRate: 12.5,
    rateAdjustments: {
      excellent: -2.0,
      good: -1.0,
      fair: 0,
      poor: 2.0,
    },
    processingFeeRate: 2.0,
    minProcessingFee: 1000,
    minCreditScore: 550,
    minAge: 21,
    maxAge: 60,
    minIncome: 25000,
    isActive: true,
    requiresCollateral: false,
  },
  home: {
    id: "home",
    name: "Home Loan",
    description: "Secured loan for property purchase",
    minAmount: 500000,
    maxAmount: 50000000,
    defaultAmount: 3000000,
    amountStep: 100000,
    minTenure: 12,
    maxTenure: 360,
    defaultTenure: 240,
    tenureOptions: [60, 120, 180, 240, 300, 360],
    baseInterestRate: 8.5,
    rateAdjustments: {
      excellent: -0.5,
      good: 0,
      fair: 0.5,
      poor: 1.5,
    },
    processingFeeRate: 0.5,
    minProcessingFee: 5000,
    minCreditScore: 650,
    minAge: 21,
    maxAge: 65,
    minIncome: 50000,
    isActive: true,
    requiresCollateral: true,
  },
  business: {
    id: "business",
    name: "Business Loan",
    description: "Loan for business expansion and working capital",
    minAmount: 100000,
    maxAmount: 10000000,
    defaultAmount: 500000,
    amountStep: 50000,
    minTenure: 6,
    maxTenure: 84,
    defaultTenure: 36,
    tenureOptions: [6, 12, 24, 36, 48, 60, 72, 84],
    baseInterestRate: 14.0,
    rateAdjustments: {
      excellent: -2.5,
      good: -1.5,
      fair: 0,
      poor: 3.0,
    },
    processingFeeRate: 2.5,
    minProcessingFee: 2500,
    minCreditScore: 600,
    minAge: 21,
    maxAge: 65,
    minIncome: 40000,
    isActive: true,
    requiresCollateral: false,
  },
};

// Credit score bands
export const CREDIT_BANDS = {
  excellent: { min: 750, max: 900, label: "Excellent", color: "text-emerald-500" },
  good: { min: 650, max: 749, label: "Good", color: "text-blue-500" },
  fair: { min: 550, max: 649, label: "Fair", color: "text-amber-500" },
  poor: { min: 0, max: 549, label: "Poor", color: "text-red-500" },
};

export const getCreditBand = (score: number): keyof typeof CREDIT_BANDS => {
  if (score >= 750) return "excellent";
  if (score >= 650) return "good";
  if (score >= 550) return "fair";
  return "poor";
};

// Calculate interest rate based on credit score
export const calculateInterestRate = (productId: string, creditScore: number): number => {
  const product = LOAN_PRODUCTS[productId];
  if (!product) return 15; // Default rate
  
  const band = getCreditBand(creditScore);
  return product.baseInterestRate + product.rateAdjustments[band];
};

// Calculate EMI
export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get active loan products
export const getActiveLoanProducts = (): LoanProduct[] => {
  return Object.values(LOAN_PRODUCTS).filter(p => p.isActive);
};

// Eligibility check result
export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  maxEligibleAmount?: number;
}

// Check eligibility
export const checkEligibility = (
  productId: string,
  creditScore: number,
  age: number,
  monthlyIncome: number
): EligibilityResult => {
  const product = LOAN_PRODUCTS[productId];
  if (!product) {
    return { eligible: false, reasons: ["Invalid product"] };
  }

  const reasons: string[] = [];

  if (creditScore < product.minCreditScore) {
    reasons.push(`Credit score below minimum (${product.minCreditScore})`);
  }
  if (age < product.minAge) {
    reasons.push(`Age below minimum (${product.minAge})`);
  }
  if (age > product.maxAge) {
    reasons.push(`Age above maximum (${product.maxAge})`);
  }
  if (monthlyIncome < product.minIncome) {
    reasons.push(`Monthly income below minimum (${formatCurrency(product.minIncome)})`);
  }

  if (reasons.length > 0) {
    return { eligible: false, reasons };
  }

  // Calculate max eligible amount (simple FOIR rule: 50% of income for EMI)
  const maxEMI = monthlyIncome * 0.5;
  const rate = calculateInterestRate(productId, creditScore);
  const maxAmount = Math.min(
    maxEMI * product.maxTenure / (1 + (rate / 100) * (product.maxTenure / 12)),
    product.maxAmount
  );

  return {
    eligible: true,
    reasons: [],
    maxEligibleAmount: Math.floor(maxAmount / 10000) * 10000, // Round down to nearest 10k
  };
};
