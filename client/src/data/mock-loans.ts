// Client-side mock loan data - no backend needed
export interface LoanProduct {
  id: string;
  bankName: string;
  loanType: string;
  productName: string;
  interestRate: string;
  processingFee: string;
  maxAmount: number | string;
  tenureRange: string;
  features: string[];
  logo: string;
  category: string;
}

export const MOCK_LOANS: LoanProduct[] = [
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
    id: "icici-bl-003", bankName: "ICICI Bank", loanType: "Business Loan", productName: "InstaBIZ",
    interestRate: "14.00% onwards", processingFee: "1.50%", maxAmount: 5000000, tenureRange: "12 - 36 months",
    features: ["End-to-end digital", "No collateral", "Flexi EMI"],
    logo: "https://logo.clearbit.com/icicibank.com", category: "Business"
  },
  {
    id: "icici-al-004", bankName: "ICICI Bank", loanType: "Auto Loan", productName: "Wheels",
    interestRate: "9.10% onwards", processingFee: "0.50%", maxAmount: "Up to ₹1 Cr", tenureRange: "12 - 84 months",
    features: ["Luxury car specialists", "Balance transfer", "Top-up loan"],
    logo: "https://logo.clearbit.com/icicibank.com", category: "Vehicle"
  },
  {
    id: "icici-gl-005", bankName: "ICICI Bank", loanType: "Gold Loan", productName: "ICICI Gold Loan",
    interestRate: "10.00% onwards", processingFee: "1.00%", maxAmount: 2500000, tenureRange: "3 - 24 months",
    features: ["Same day disbursal", "Doorstep service", "Flexible repayment"],
    logo: "https://logo.clearbit.com/icicibank.com", category: "Gold"
  },
  // SBI
  {
    id: "sbi-pl-001", bankName: "State Bank of India", loanType: "Personal Loan", productName: "SBI Xpress Credit",
    interestRate: "11.00% - 14.00%", processingFee: "Up to 1.50%", maxAmount: 3500000, tenureRange: "6 - 72 months",
    features: ["Salary account benefits", "No guarantor", "Pre-approved offers"],
    logo: "https://logo.clearbit.com/sbi.co.in", category: "Personal"
  },
  {
    id: "sbi-hl-002", bankName: "State Bank of India", loanType: "Home Loan", productName: "SBI Regular Home Loan",
    interestRate: "8.40% onwards", processingFee: "0.35%", maxAmount: "No upper limit", tenureRange: "Up to 30 years",
    features: ["Lowest in market", "Zero prepayment charges", "Balance transfer"],
    logo: "https://logo.clearbit.com/sbi.co.in", category: "Home"
  },
  {
    id: "sbi-el-003", bankName: "State Bank of India", loanType: "Education Loan", productName: "SBI Student Loan",
    interestRate: "8.15% onwards", processingFee: "Nil", maxAmount: 15000000, tenureRange: "Up to 15 years",
    features: ["For India & abroad", "Moratorium period", "No margin for ₹4L"],
    logo: "https://logo.clearbit.com/sbi.co.in", category: "Education"
  },
  {
    id: "sbi-bl-004", bankName: "State Bank of India", loanType: "Business Loan", productName: "e-Mudra",
    interestRate: "9.25% onwards", processingFee: "Zero", maxAmount: 100000, tenureRange: "Up to 5 years",
    features: ["Under Mudra scheme", "Digital journey", "No collateral"],
    logo: "https://logo.clearbit.com/sbi.co.in", category: "Business"
  },
  {
    id: "sbi-al-005", bankName: "State Bank of India", loanType: "Auto Loan", productName: "SBI Car Loan",
    interestRate: "8.65% onwards", processingFee: "Nil", maxAmount: "90% of car cost", tenureRange: "Up to 7 years",
    features: ["Lowest EMI", "No foreclosure charges", "Quick sanction"],
    logo: "https://logo.clearbit.com/sbi.co.in", category: "Vehicle"
  },
  // Axis Bank
  {
    id: "axis-pl-001", bankName: "Axis Bank", loanType: "Personal Loan", productName: "Axis Express Loan",
    interestRate: "10.49% onwards", processingFee: "Up to 2%", maxAmount: 4000000, tenureRange: "12 - 60 months",
    features: ["2 minute approval", "No income proof for existing customers", "Flexible EMI"],
    logo: "https://logo.clearbit.com/axisbank.com", category: "Personal"
  },
  {
    id: "axis-hl-002", bankName: "Axis Bank", loanType: "Home Loan", productName: "Axis Shubh Aarambh",
    interestRate: "8.60% onwards", processingFee: "0.50%", maxAmount: 5000000, tenureRange: "Up to 30 years",
    features: ["Affordable housing", "Lower interest rate", "Longer tenure"],
    logo: "https://logo.clearbit.com/axisbank.com", category: "Home"
  },
  {
    id: "axis-bl-003", bankName: "Axis Bank", loanType: "Business Loan", productName: "Axis Power Loan",
    interestRate: "15.95% onwards", processingFee: "1.50%", maxAmount: 5000000, tenureRange: "12 - 60 months",
    features: ["OD facility", "Collateral free", "No pre-closure fee"],
    logo: "https://logo.clearbit.com/axisbank.com", category: "Business"
  },
  {
    id: "axis-al-004", bankName: "Axis Bank", loanType: "Auto Loan", productName: "Axis Drive Easy",
    interestRate: "8.99% onwards", processingFee: "0.50%", maxAmount: "100% On-Road Price", tenureRange: "12 - 84 months",
    features: ["Pre-approved offers", "Instant sanction", "Low EMI"],
    logo: "https://logo.clearbit.com/axisbank.com", category: "Vehicle"
  },
  {
    id: "axis-el-005", bankName: "Axis Bank", loanType: "Education Loan", productName: "Axis Skill Loan",
    interestRate: "13.30% onwards", processingFee: "Nil", maxAmount: 150000, tenureRange: "3 - 7 years",
    features: ["Skill development courses", "No collateral", "Govt scheme"],
    logo: "https://logo.clearbit.com/axisbank.com", category: "Education"
  },
  // Kotak Mahindra Bank
  {
    id: "kotak-pl-001", bankName: "Kotak Mahindra Bank", loanType: "Personal Loan", productName: "Kotak Flexi PL",
    interestRate: "10.99% onwards", processingFee: "Up to 2.50%", maxAmount: 4000000, tenureRange: "12 - 60 months",
    features: ["Flexi repayment", "Part-payment facility", "Instant approval"],
    logo: "https://logo.clearbit.com/kotak.com", category: "Personal"
  },
  {
    id: "kotak-hl-002", bankName: "Kotak Mahindra Bank", loanType: "Home Loan", productName: "Kotak Dream House",
    interestRate: "8.70% onwards", processingFee: "0.50%", maxAmount: 10000000, tenureRange: "Up to 20 years",
    features: ["Doorstep service", "Quick processing", "Top-up available"],
    logo: "https://logo.clearbit.com/kotak.com", category: "Home"
  },
  {
    id: "kotak-bl-003", bankName: "Kotak Mahindra Bank", loanType: "Business Loan", productName: "Kotak Business Loan",
    interestRate: "16.00% onwards", processingFee: "2.00%", maxAmount: 7500000, tenureRange: "12 - 48 months",
    features: ["Unsecured loan", "Minimal documentation", "Dedicated RM"],
    logo: "https://logo.clearbit.com/kotak.com", category: "Business"
  },
  {
    id: "kotak-al-004", bankName: "Kotak Mahindra Bank", loanType: "Auto Loan", productName: "Kotak Car Loan",
    interestRate: "9.00% onwards", processingFee: "Nil", maxAmount: "100% funding", tenureRange: "12 - 84 months",
    features: ["Hassle-free process", "Attractive rates", "Quick disbursal"],
    logo: "https://logo.clearbit.com/kotak.com", category: "Vehicle"
  },
  {
    id: "kotak-gl-005", bankName: "Kotak Mahindra Bank", loanType: "Gold Loan", productName: "Kotak Gold Loan",
    interestRate: "9.00% onwards", processingFee: "0.50%", maxAmount: 2000000, tenureRange: "6 - 36 months",
    features: ["Overdraft facility", "Locker storage", "Low interest"],
    logo: "https://logo.clearbit.com/kotak.com", category: "Gold"
  }
];

// Shuffle array helper
export function shuffleLoans(loans: LoanProduct[]): LoanProduct[] {
  const shuffled = [...loans];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
