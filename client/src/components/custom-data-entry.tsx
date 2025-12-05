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
import { Users, Plus, X } from 'lucide-react';

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
}) => {
  const [selectedTab, setSelectedTab] = useState('select');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [customCustomer, setCustomCustomer] = useState<Partial<CustomerData>>({});
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    loanAmount: 300000,
    tenure: 60,
    rate: 8.5,
  });

  const handleSelectCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    onCustomerSelected?.(customer);
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
              {DEFAULT_CUSTOMERS.map((customer) => (
                <Card
                  key={customer.customerId}
                  className={`p-4 cursor-pointer transition ${
                    selectedCustomer?.customerId === customer.customerId
                      ? 'border-2 border-primary bg-primary/5'
                      : 'hover:border-primary'
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-gray-600">
                        ID: {customer.customerId} | Phone: {customer.phone}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>Salary: ₹{customer.monthlyNetSalary.toLocaleString('en-IN')}</span>
                        <span>Credit Score: {customer.creditScore}</span>
                        <span>Pre-approved: ₹{customer.preApprovedLimit.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedCustomer?.customerId === customer.customerId
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedCustomer?.customerId === customer.customerId && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Customer Entry */}
          <Card className="p-6 bg-blue-50 border-2 border-dashed">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Or Enter Your Own Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={customCustomer.name || ''}
                  onChange={(e) =>
                    setCustomCustomer({ ...customCustomer, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={customCustomer.email || ''}
                  onChange={(e) =>
                    setCustomCustomer({ ...customCustomer, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="10-digit phone number"
                  value={customCustomer.phone || ''}
                  onChange={(e) =>
                    setCustomCustomer({ ...customCustomer, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="salary">Monthly Net Salary (₹) *</Label>
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
                />
              </div>

              <div>
                <Label htmlFor="credit">Credit Score (300-900) *</Label>
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
                />
              </div>

              <div>
                <Label htmlFor="preapproved">Pre-approved Limit (₹) *</Label>
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
                />
              </div>

              <div>
                <Label htmlFor="employment">Employment Type *</Label>
                <Select
                  value={customCustomer.employmentType || 'salaried'}
                  onValueChange={(value) =>
                    setCustomCustomer({ ...customCustomer, employmentType: value })
                  }
                >
                  <SelectTrigger id="employment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
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
                  <SelectTrigger id="existingloan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleCreateCustomCustomer}
              className="w-full mt-4"
              disabled={!customCustomer.name || !customCustomer.email || !customCustomer.phone}
            >
              <Plus className="w-4 h-4 mr-2" />
              Use These Details
            </Button>
          </Card>

          {selectedCustomer && (
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedTab('loan')}
                className="flex-1"
              >
                Continue to Loan Details →
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Loan Details Tab */}
        <TabsContent value="loan" className="space-y-4">
          {selectedCustomer && (
            <>
              <Card className="p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">Selected Customer</h3>
                <p className="text-sm">{selectedCustomer.name} ({selectedCustomer.customerId})</p>
                <p className="text-xs text-gray-600 mt-1">Email: {selectedCustomer.email}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Loan Requirements</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">
                      Loan Amount (₹) *
                      <span className="text-xs text-gray-500 ml-2">
                        (Max: ₹{selectedCustomer.preApprovedLimit.toLocaleString('en-IN')})
                      </span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      max={selectedCustomer.preApprovedLimit}
                      placeholder="300000"
                      value={loanDetails.loanAmount}
                      onChange={(e) =>
                        handleLoanDetailsChange('loanAmount', parseInt(e.target.value))
                      }
                    />
                    {loanDetails.loanAmount > selectedCustomer.preApprovedLimit && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Amount exceeds pre-approved limit
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tenure">
                      Tenure (Months) *
                      <span className="text-xs text-gray-500 ml-2">(12 - 84 months)</span>
                    </Label>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="rate">
                      Interest Rate (%) *
                      <span className="text-xs text-gray-500 ml-2">(Annual)</span>
                    </Label>
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
                    />
                  </div>

                  {/* EMI Calculation Preview */}
                  <Card className="p-4 bg-green-50 border-green-200">
                    <p className="text-xs text-gray-600 mb-2">Monthly EMI Estimate</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹
                      {calculateEMI(
                        loanDetails.loanAmount,
                        loanDetails.rate,
                        loanDetails.tenure
                      ).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Total Amount: ₹
                      {(
                        calculateEMI(
                          loanDetails.loanAmount,
                          loanDetails.rate,
                          loanDetails.tenure
                        ) * loanDetails.tenure
                      ).toLocaleString('en-IN')}
                    </p>
                  </Card>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => setSelectedTab('select')}
                    variant="outline"
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button onClick={onClose} className="flex-1">
                    Start Application
                  </Button>
                </div>
              </Card>
            </>
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
