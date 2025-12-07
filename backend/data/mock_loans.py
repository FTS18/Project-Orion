"""
Mock Loan Data for Project Orion
Contains varied loan products from major Indian banks.
Includes Personal, Home, Education, Business, Gold, Vehicle, and Micro loans.
"""

MOCK_LOANS = [
    # HDFC Bank (5 Loans)
    {
        "id": "hdfc-pl-001",
        "bankName": "HDFC Bank",
        "loanType": "Personal Loan",
        "productName": "HDFC Xpress Personal Loan",
        "interestRate": "10.50% - 15.75%",
        "processingFee": "Up to 2.50%",
        "maxAmount": 4000000,
        "tenureRange": "12 - 60 months",
        "features": ["Disbursal in 10 seconds", "No documentation for pre-approved", "Flexible tenure"],
        "logo": "https://logo.clearbit.com/hdfcbank.com",
        "category": "Personal"
    },
    {
        "id": "hdfc-hl-002",
        "bankName": "HDFC Bank",
        "loanType": "Home Loan",
        "productName": "HDFC Reach Home Loan",
        "interestRate": "8.50% - 9.40%",
        "processingFee": "0.50%",
        "maxAmount": 10000000,
        "tenureRange": "Up to 30 years",
        "features": ["For micro-entrepreneurs", "Minimal income docs", "Quick processing"],
        "logo": "https://logo.clearbit.com/hdfcbank.com",
        "category": "Home"
    },
    {
        "id": "hdfc-cd-003",
        "bankName": "HDFC Bank",
        "loanType": "Consumer Durable",
        "productName": "EasyEMI Consumer Loan",
        "interestRate": "12.00% - 16.00%",
        "processingFee": "Nil",
        "maxAmount": 500000,
        "tenureRange": "3 - 24 months",
        "features": ["No Cost EMI options", "Instant approval at store", "Minimal paperwork"],
        "logo": "https://logo.clearbit.com/hdfcbank.com",
        "category": "Consumer Durable"
    },
    {
        "id": "hdfc-bl-004",
        "bankName": "HDFC Bank",
        "loanType": "Business Loan",
        "productName": "Business Growth Loan",
        "interestRate": "11.90% - 16.25%",
        "processingFee": "2.00%",
        "maxAmount": 7500000,
        "tenureRange": "12 - 48 months",
        "features": ["Collateral free", "Dropline Overdraft facility", "Quick disbursal"],
        "logo": "https://logo.clearbit.com/hdfcbank.com",
        "category": "Business"
    },
    {
        "id": "hdfc-al-005",
        "bankName": "HDFC Bank",
        "loanType": "Auto Loan",
        "productName": "New Car Loan",
        "interestRate": "8.90% - 10.50%",
        "processingFee": "0.50%",
        "maxAmount": "100% On-Road Price",
        "tenureRange": "12 - 84 months",
        "features": ["100% funding", "30 minute approval", "Fixed interest rate"],
        "logo": "https://logo.clearbit.com/hdfcbank.com",
        "category": "Vehicle"
    },

    # ICICI Bank (5 Loans)
    {
        "id": "icici-pl-001",
        "bankName": "ICICI Bank",
        "loanType": "Personal Loan",
        "productName": "ICICI Instant PL",
        "interestRate": "10.75% onwards",
        "processingFee": "Up to 2.25%",
        "maxAmount": 5000000,
        "tenureRange": "12 - 72 months",
        "features": ["3 second disbursal", "No physical docs", "Fixed rate"],
        "logo": "https://logo.clearbit.com/icicibank.com",
        "category": "Personal"
    },
    {
        "id": "icici-hl-002",
        "bankName": "ICICI Bank",
        "loanType": "Home Loan",
        "productName": "ICICI Pratham",
        "interestRate": "8.75% - 9.60%",
        "processingFee": "0.50% - 1.00%",
        "maxAmount": 5000000,
        "tenureRange": "Up to 20 years",
        "features": ["Affordable housing", "Subsidized rates", "Easy eligibility"],
        "logo": "https://logo.clearbit.com/icicibank.com",
        "category": "Home"
    },
    {
        "id": "icici-gl-003",
        "bankName": "ICICI Bank",
        "loanType": "Gold Loan",
        "productName": "Insta Gold Loan",
        "interestRate": "9.50% - 16.00%",
        "processingFee": "1.00%",
        "maxAmount": 2000000,
        "tenureRange": "6 - 12 months",
        "features": ["30 min disbursal", "High per gram rate", "Safety locker"],
        "logo": "https://logo.clearbit.com/icicibank.com",
        "category": "Gold"
    },
    {
        "id": "icici-el-004",
        "bankName": "ICICI Bank",
        "loanType": "Education Loan",
        "productName": "iSmart Education Loan",
        "interestRate": "9.50% - 13.00%",
        "processingFee": "1.00%",
        "maxAmount": 10000000,
        "tenureRange": "Up to 15 years",
        "features": ["Cover tuition + living", "Pre-visa disbursal", "Tax benefit"],
        "logo": "https://logo.clearbit.com/icicibank.com",
        "category": "Education"
    },
    {
        "id": "icici-ml-005",
        "bankName": "ICICI Bank",
        "loanType": "Micro Loan",
        "productName": "PayLater",
        "interestRate": "0% for 30 days",
        "processingFee": "Nil",
        "maxAmount": 50000,
        "tenureRange": "30 - 45 days",
        "features": ["Instant digital credit", "Shop now pay later", "One click payment"],
        "logo": "https://logo.clearbit.com/icicibank.com",
        "category": "Micro"
    },

    # SBI (5 Loans)
    {
        "id": "sbi-pl-001",
        "bankName": "SBI",
        "loanType": "Personal Loan",
        "productName": "Xpress Credit",
        "interestRate": "11.00% - 14.00%",
        "processingFee": "Nil to 1.00%",
        "maxAmount": 2000000,
        "tenureRange": "6 - 72 months",
        "features": ["Low interest rates", "Daily reducing balance", "Zero prepayment penalty"],
        "logo": "https://logo.clearbit.com/sbi.co.in",
        "category": "Personal"
    },
    {
        "id": "sbi-hl-002",
        "bankName": "SBI",
        "loanType": "Home Loan",
        "productName": "SBI Regular Home Loan",
        "interestRate": "8.40% onwards",
        "processingFee": "0.35%",
        "maxAmount": 100000000,
        "tenureRange": "Up to 30 years",
        "features": ["Lowest interest rates", "No hidden charges", "Overdraft facility"],
        "logo": "https://logo.clearbit.com/sbi.co.in",
        "category": "Home"
    },
    {
        "id": "sbi-el-003",
        "bankName": "SBI",
        "loanType": "Education Loan",
        "productName": "Scholar Loan",
        "interestRate": "8.15% - 9.50%",
        "processingFee": "Nil",
        "maxAmount": 4000000,
        "tenureRange": "Up to 15 years",
        "features": ["For premier institutions", "100% financing", "Quick sanction"],
        "logo": "https://logo.clearbit.com/sbi.co.in",
        "category": "Education"
    },
    {
        "id": "sbi-vl-004",
        "bankName": "SBI",
        "loanType": "Vehicle Loan",
        "productName": "SBI Car Loan",
        "interestRate": "8.65% - 9.50%",
        "processingFee": "Nil",
        "maxAmount": "90% On-Road Price",
        "tenureRange": "Up to 7 years",
        "features": ["Financing on-road price", "Longest tenure", "Lowest EMI"],
        "logo": "https://logo.clearbit.com/sbi.co.in",
        "category": "Vehicle"
    },
    {
        "id": "sbi-mudra-005",
        "bankName": "SBI",
        "loanType": "Business Loan",
        "productName": "e-Mudra Loan",
        "interestRate": "9.75% onwards",
        "processingFee": "Nil",
        "maxAmount": 50000,
        "tenureRange": "Up to 5 years",
        "features": ["Instant micro loan", "For small business", "No collateral"],
        "logo": "https://logo.clearbit.com/sbi.co.in",
        "category": "Micro"
    },

    # Axis Bank (5 Loans)
    {
        "id": "axis-pl-001",
        "bankName": "Axis Bank",
        "loanType": "Personal Loan",
        "productName": "24x7 Personal Loan",
        "interestRate": "10.49% onwards",
        "processingFee": "Up to 2%",
        "maxAmount": 4000000,
        "tenureRange": "12 - 60 months",
        "features": ["Instant credit", "Choose your EMI", "No foreclosure charges"],
        "logo": "https://logo.clearbit.com/axisbank.com",
        "category": "Personal"
    },
    {
        "id": "axis-hl-002",
        "bankName": "Axis Bank",
        "loanType": "Home Loan",
        "productName": "Asha Home Loan",
        "interestRate": "9.00% - 10.50%",
        "processingFee": "1.00%",
        "maxAmount": 3500000,
        "tenureRange": "Up to 30 years",
        "features": ["For mixed income", "12 EMI waiver", "Small ticket size"],
        "logo": "https://logo.clearbit.com/axisbank.com",
        "category": "Home"
    },
    {
        "id": "axis-bl-003",
        "bankName": "Axis Bank",
        "loanType": "Business Loan",
        "productName": "Growth Business Loan",
        "interestRate": "14.25% - 18.00%",
        "processingFee": "2.00%",
        "maxAmount": 5000000,
        "tenureRange": "12 - 36 months",
        "features": ["Collateral free", "Minimal documentation", "Quick approval"],
        "logo": "https://logo.clearbit.com/axisbank.com",
        "category": "Business"
    },
    {
        "id": "axis-lap-004",
        "bankName": "Axis Bank",
        "loanType": "Loan Against Property",
        "productName": "Loan Against Property",
        "interestRate": "9.50% - 11.00%",
        "processingFee": "1.00%",
        "maxAmount": 50000000,
        "tenureRange": "Up to 15 years",
        "features": ["Unlock property value", "High loan amount", "Flexible usage"],
        "logo": "https://logo.clearbit.com/axisbank.com",
        "category": "Mortgage"
    },
    {
        "id": "axis-sl-005",
        "bankName": "Axis Bank",
        "loanType": "Small Loan",
        "productName": "Small Ticket PL",
        "interestRate": "13.00% onwards",
        "processingFee": "500",
        "maxAmount": 100000,
        "tenureRange": "3 - 12 months",
        "features": ["Instant small cash", "Paperless", "Emergency funds"],
        "logo": "https://logo.clearbit.com/axisbank.com",
        "category": "Micro"
    },

    # Kotak Mahindra Bank (5 Loans)
    {
        "id": "kotak-pl-001",
        "bankName": "Kotak Mahindra Bank",
        "loanType": "Personal Loan",
        "productName": "Kotak Personal Loan",
        "interestRate": "10.99% onwards",
        "processingFee": "Up to 3%",
        "maxAmount": 2500000,
        "tenureRange": "12 - 60 months",
        "features": ["Part prepayment allowed", "Instant approval", "Doorstep service"],
        "logo": "https://logo.clearbit.com/kotak.com",
        "category": "Personal"
    },
    {
        "id": "kotak-hl-002",
        "bankName": "Kotak Mahindra Bank",
        "loanType": "Home Loan",
        "productName": "Kotak Home Loan",
        "interestRate": "8.70% onwards",
        "processingFee": "Nil",
        "maxAmount": 100000000,
        "tenureRange": "Up to 20 years",
        "features": ["Digital sanction", "Balance transfer special", "Nil processing fee"],
        "logo": "https://logo.clearbit.com/kotak.com",
        "category": "Home"
    },
    {
        "id": "kotak-bl-003",
        "bankName": "Kotak Mahindra Bank",
        "loanType": "Business Loan",
        "productName": "Business Loan",
        "interestRate": "15.00% onwards",
        "processingFee": "2.00%",
        "maxAmount": 7500000,
        "tenureRange": "12 - 48 months",
        "features": ["No collateral", "Flexible repayment", "Quick disbursal"],
        "logo": "https://logo.clearbit.com/kotak.com",
        "category": "Business"
    },
    {
        "id": "kotak-wc-004",
        "bankName": "Kotak Mahindra Bank",
        "loanType": "Working Capital",
        "productName": "Working Capital Loan",
        "interestRate": "10.00% - 14.00%",
        "processingFee": "Custom",
        "maxAmount": 20000000,
        "tenureRange": "12 months renewable",
        "features": ["Cash credit", "Overdraft", "Export credit"],
        "logo": "https://logo.clearbit.com/kotak.com",
        "category": "Business"
    },
    {
        "id": "kotak-cd-005",
        "bankName": "Kotak Mahindra Bank",
        "loanType": "Consumer Durable",
        "productName": "Smart EMI",
        "interestRate": "14.00% - 18.00%",
        "processingFee": "199",
        "maxAmount": 300000,
        "tenureRange": "3 - 18 months",
        "features": ["Debit card EMI", "No documentation", "Instant convert"],
        "logo": "https://logo.clearbit.com/kotak.com",
        "category": "Consumer Durable"
    }
]
