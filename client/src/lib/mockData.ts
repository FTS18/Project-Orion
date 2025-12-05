import { USE_MOCK_DATA } from "./queryClient";

// Mock data service for showcasing frontend without backend
export const mockApiResponses: Record<string, any> = {
  "/api/customers": {
    status: "ok",
    data: [
      {
        customerId: "CUST001",
        name: "Raj Kumar",
        email: "raj.kumar@email.com",
        phone: "9876543210",
        city: "Mumbai",
        monthlyNetSalary: 75000,
        creditScore: 750,
        preApprovedLimit: 500000,
        existingLoan: false,
        employmentType: "salaried",
      },
      {
        customerId: "CUST002",
        name: "Priya Singh",
        email: "priya.singh@email.com",
        phone: "9876543211",
        city: "Delhi",
        monthlyNetSalary: 85000,
        creditScore: 780,
        preApprovedLimit: 600000,
        existingLoan: false,
        employmentType: "salaried",
      },
      {
        customerId: "CUST003",
        name: "Amit Patel",
        email: "amit.patel@email.com",
        phone: "9876543212",
        city: "Bangalore",
        monthlyNetSalary: 65000,
        creditScore: 720,
        preApprovedLimit: 450000,
        existingLoan: true,
        employmentType: "salaried",
      },
    ],
  },
  "/api/extract-salary": {
    status: "ok",
    data: {
      netIncome: 75000,
      grossIncome: 95000,
      deductions: 20000,
      fileName: "salary_slip.pdf",
    },
  },
  "/api/verify-kyc": {
    status: "ok",
    data: {
      status: "VERIFIED",
      verificationId: "VER-2024-001",
      mismatches: [],
      timestamp: new Date().toISOString(),
    },
  },
  "/api/underwrite": {
    status: "ok",
    data: {
      decision: "APPROVE",
      reason: "Good credit score and income",
      emi: 15234,
      totalAmount: 915000,
      interestAmount: 15000,
      processingFee: 5000,
    },
  },
  "/api/generate-sanction-letter": {
    status: "ok",
    data: {
      letterStatus: "GENERATED",
      pdfUrl: "data:application/pdf;base64,JVBERi0xLjQK",
      fileName: "sanction_letter.pdf",
      generatedAt: new Date().toISOString(),
    },
  },
  "/api/create-offer": {
    status: "ok",
    data: {
      offerId: "OFFER-001",
      interestRate: 11.5,
      tenure: 60,
      emi: 12500,
      totalAmount: 850000,
    },
  },
};

// Mock fetch handler
export async function mockFetch(url: string, options?: RequestInit): Promise<Response> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Extract the API path from URL
  let apiPath = url;
  if (url.includes("?")) {
    apiPath = url.split("?")[0];
  }

  // Find matching mock response
  const mockData = mockApiResponses[apiPath];

  if (mockData) {
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Default mock response for unknown endpoints
  return new Response(JSON.stringify({ status: "ok", data: {} }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Override fetch when using mock data
export function setupMockFetch(): void {
  if (USE_MOCK_DATA && typeof window !== "undefined") {
    const originalFetch = window.fetch;
    
    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      
      // Use mock fetch for API calls
      if (url.includes("/api/")) {
        return mockFetch(url, init);
      }
      
      // Use original fetch for everything else
      return originalFetch(input, init);
    };
  }
}
