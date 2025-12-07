
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, Plus, UserCircle, Wallet, CreditCard, Briefcase, IndianRupee, Calendar, Percent, ArrowRight, ArrowLeft } from 'lucide-react';
import { SpotlightCard } from './ui/spotlight-card';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/agent-user-context';
import { LOAN_PRODUCTS, CREDIT_BANDS, getCreditBand, calculateEMI as calcEMIFromConfig, formatCurrency } from '@/config/loan.config';

export interface CustomerData {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  monthlyNetSalary: number;
  creditScore: number;
  preApprovedLimit: number;
  existingLoan: boolean;
  employmentType: string;
}

export interface LoanDetails {
  loanAmount: number;
  tenure: number;
  rate: number;
}

interface CustomDataEntryProps {
  onCustomerSelected?: (data: CustomerData) => void;
  onLoanDetailsEntered?: (data: LoanDetails) => void;
  onClose?: () => void;
  userProfile?: UserProfile | null;
}

const DEFAULT_CUSTOMERS: CustomerData[] = [
  {
    customerId: 'CUST001',
    name: 'Raj Kumar',
    email: 'raj.kumar@email.com',
    phone: '9876543210',
    monthlyNetSalary: 75000,
    creditScore: 750,
    preApprovedLimit: 500000,
    existingLoan: false,
    employmentType: 'salaried',
  },
  {
    customerId: 'CUST002',
    name: 'Priya Singh',
    email: 'priya.singh@email.com',
    phone: '9876543211',
    monthlyNetSalary: 85000,
    creditScore: 780,
    preApprovedLimit: 600000,
    existingLoan: false,
    employmentType: 'salaried',
  },
  {
    customerId: 'CUST003',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    phone: '9876543212',
    monthlyNetSalary: 65000,
    creditScore: 720,
    preApprovedLimit: 450000,
    existingLoan: true,
    employmentType: 'salaried',
  },
];

export const CustomDataEntry: React.FC<CustomDataEntryProps> = ({
  onCustomerSelected,
  onLoanDetailsEntered,
  onClose,
  userProfile,
}) => {
  const [selectedTab, setSelectedTab] = useState('select');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [customCustomer, setCustomCustomer] = useState<Partial<CustomerData>>({});
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loanAmount: 300000,
    tenure: 60,
    rate: 8.5,
  });

  // Pre-fill form with user profile data
  React.useEffect(() => {
    if (userProfile) {
      setCustomCustomer({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        email: userProfile.email,
        phone: userProfile.phone,
        monthlyNetSalary: userProfile.monthlySalary,
        employmentType: userProfile.employmentType || 'salaried',
        existingLoan: userProfile.hasExistingLoan,
        // Estimate credit score and limit if not available
        creditScore: 750,
        preApprovedLimit: (userProfile.monthlySalary || 50000) * 10,
      });
    }
  }, [userProfile]);

  const handleSelectCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    onCustomerSelected?.(customer);
    setSelectedTab('loan');
  };

  const handleCreateCustomCustomer = () => {
    const customer: CustomerData = {
      customerId: `CUSTOM${Date.now()}`,
      name: customCustomer.name || 'New Customer',
      email: customCustomer.email || '',
      phone: customCustomer.phone || '',
      monthlyNetSalary: customCustomer.monthlyNetSalary || 50000,
      creditScore: customCustomer.creditScore || 700,
      preApprovedLimit: customCustomer.preApprovedLimit || 300000,
      existingLoan: customCustomer.existingLoan || false,
      employmentType: customCustomer.employmentType || 'salaried',
    };
    setSelectedCustomer(customer);
    onCustomerSelected?.(customer);
    setSelectedTab('loan');
  };

  const handleLoanDetailsChange = (field: keyof LoanDetails, value: any) => {
    const updated = { ...loanDetails, [field]: value };
    setLoanDetails(updated);
    onLoanDetailsEntered?.(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select">Select/Add Customer</TabsTrigger>
          <TabsTrigger value="loan" disabled={!selectedCustomer}>
            Loan Details
          </TabsTrigger>
        </TabsList>

        {/* Customer Selection Tab */}
        <TabsContent value="select" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pre-Approved Customers
            </h3>
            <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEFAULT_CUSTOMERS.map((customer) => (
                <SpotlightCard
                  key={customer.customerId}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-300 border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md",
                    selectedCustomer?.customerId === customer.customerId
                      ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "hover:scale-[1.02] hover:shadow-md"
                  )}
                  spotlightColor="rgba(var(--primary), 0.1)"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {customer.customerId}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedCustomer?.customerId === customer.customerId
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedCustomer?.customerId === customer.customerId && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Salary</span>
                        <span className="font-medium">₹{customer.monthlyNetSalary.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className={cn(
                          "font-medium",
                          customer.creditScore >= 750 ? "text-green-500" : "text-yellow-500"
                        )}>{customer.creditScore}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/5 flex justify-between text-sm">
                        <span className="text-muted-foreground">Limit</span>
                        <span className="font-bold text-primary">₹{customer.preApprovedLimit.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
          </div>

          {/* Custom Customer Entry */}
          <SpotlightCard 
            className="p-6 border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md"
            spotlightColor="rgba(var(--primary), 0.1)"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary" />
                Enter Your Own Details
              </h3>
              {userProfile && (
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Auto-filled from Profile
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={customCustomer.name || ''}
                    onChange={(e) =>
                      setCustomCustomer({ ...customCustomer, name: e.target.value })
                    }
                    className="bg-white/50 dark:bg-black/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={customCustomer.email || ''}
                    onChange={(e) =>
                      setCustomCustomer({ ...customCustomer, email: e.target.value })
                    }
                    className="bg-white/50 dark:bg-black/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="10-digit phone number"
                    value={customCustomer.phone || ''}
                    onChange={(e) =>
                      setCustomCustomer({ ...customCustomer, phone: e.target.value })
                    }
                    className="bg-white/50 dark:bg-black/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employment">Employment Type *</Label>
                  <Select
                    value={customCustomer.employmentType || 'salaried'}
                    onValueChange={(value) =>
                      setCustomCustomer({ ...customCustomer, employmentType: value })
                    }
                  >
                    <SelectTrigger id="employment" className="bg-white/50 dark:bg-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">Salaried</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Net Salary (₹) *</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="salary"
                      type="number"
                      placeholder="50000"
                      value={customCustomer.monthlyNetSalary || ''}
                      onChange={(e) =>
                        setCustomCustomer({
                          ...customCustomer,
                          monthlyNetSalary: parseInt(e.target.value),
                        })
                      }
                      className="pl-9 bg-white/50 dark:bg-black/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit">Credit Score (300-900) *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="credit"
                      type="number"
                      min="300"
                      max="900"
                      placeholder="700"
                      value={customCustomer.creditScore || ''}
                      onChange={(e) =>
                        setCustomCustomer({
                          ...customCustomer,
                          creditScore: parseInt(e.target.value),
                        })
                      }
                      className="pl-9 bg-white/50 dark:bg-black/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preapproved">Pre-approved Limit (₹) *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="preapproved"
                      type="number"
                      placeholder="300000"
                      value={customCustomer.preApprovedLimit || ''}
                      onChange={(e) =>
                        setCustomCustomer({
                          ...customCustomer,
                          preApprovedLimit: parseInt(e.target.value),
                        })
                      }
                      className="pl-9 bg-white/50 dark:bg-black/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingloan">Existing Loan?</Label>
                  <Select
                    value={customCustomer.existingLoan ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setCustomCustomer({
                        ...customCustomer,
                        existingLoan: value === 'yes',
                      })
                    }
                  >
                    <SelectTrigger id="existingloan" className="bg-white/50 dark:bg-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateCustomCustomer}
              className="w-full mt-8 h-12 text-base shadow-lg shadow-primary/20"
              disabled={!customCustomer.name || !customCustomer.email || !customCustomer.phone}
            >
              <Plus className="w-4 h-4 mr-2" />
              Use These Details
            </Button>
          </SpotlightCard>


        </TabsContent>

        {/* Loan Details Tab */}
        <TabsContent value="loan" className="space-y-4">
          {selectedCustomer && (

            <SpotlightCard 
              className="p-6 md:p-8 border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md"
              spotlightColor="rgba(var(--primary), 0.1)"
            >
              <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedCustomer.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {selectedCustomer.customerId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Pre-approved Limit</p>
                  <p className="font-bold text-primary">₹{selectedCustomer.preApprovedLimit.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Loan Requirements
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Loan Amount (₹) *
                      <span className="text-xs text-muted-foreground ml-2">
                        (Max: ₹{selectedCustomer.preApprovedLimit.toLocaleString('en-IN')})
                      </span>
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        max={selectedCustomer.preApprovedLimit}
                        placeholder="300000"
                        value={loanDetails.loanAmount}
                        onChange={(e) =>
                          handleLoanDetailsChange('loanAmount', parseInt(e.target.value))
                        }
                        className="pl-9 bg-white/50 dark:bg-black/20 h-11"
                      />
                    </div>
                    {loanDetails.loanAmount > selectedCustomer.preApprovedLimit && (
                      <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                        ⚠️ Amount exceeds pre-approved limit
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenure">
                      Tenure (Months) *
                      <span className="text-xs text-muted-foreground ml-2">(12 - 84 months)</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tenure"
                        type="number"
                        min="12"
                        max="84"
                        placeholder="60"
                        value={loanDetails.tenure}
                        onChange={(e) =>
                          handleLoanDetailsChange('tenure', parseInt(e.target.value))
                        }
                        className="pl-9 bg-white/50 dark:bg-black/20 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">
                      Interest Rate (%) *
                      <span className="text-xs text-muted-foreground ml-2">(Annual)</span>
                    </Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="rate"
                        type="number"
                        step="0.1"
                        min="5"
                        max="15"
                        placeholder="8.5"
                        value={loanDetails.rate}
                        onChange={(e) =>
                          handleLoanDetailsChange('rate', parseFloat(e.target.value))
                        }
                        className="pl-9 bg-white/50 dark:bg-black/20 h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* EMI Calculation Preview */}
                <div className="flex flex-col h-full">
                  <Label className="mb-2">Repayment Preview</Label>
                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/10 p-6 flex flex-col justify-center items-center text-center">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Estimated Monthly EMI</p>
                    <p className="text-4xl font-bold text-primary mb-4">
                      ₹{calculateEMI(
                        loanDetails.loanAmount,
                        loanDetails.rate,
                        loanDetails.tenure
                      ).toLocaleString('en-IN')}
                    </p>
                    
                    <div className="w-full h-px bg-primary/10 my-4" />
                    
                    <div className="flex justify-between w-full text-sm px-4">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold">
                        ₹{(
                          calculateEMI(
                            loanDetails.loanAmount,
                            loanDetails.rate,
                            loanDetails.tenure
                          ) * loanDetails.tenure
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between w-full text-sm px-4 mt-2">
                      <span className="text-muted-foreground">Total Interest</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        ₹{(
                          (calculateEMI(
                            loanDetails.loanAmount,
                            loanDetails.rate,
                            loanDetails.tenure
                          ) * loanDetails.tenure) - loanDetails.loanAmount
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                <Button
                  onClick={() => setSelectedTab('select')}
                  variant="outline"
                  className="flex-1 h-12 text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={onClose} 
                  className="flex-[2] h-12 text-base shadow-lg shadow-primary/20"
                >
                  Start Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </SpotlightCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round(principal / tenureMonths);

  const emi =
    (principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
}

export default CustomDataEntry;
