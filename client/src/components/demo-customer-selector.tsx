import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wallet,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer } from "@shared/schema";

interface DemoCustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: Customer) => void;
  className?: string;
  showDetails?: boolean;
}

// Categorize customers by demo scenario
function getDemoCategory(customer: Customer): {
  type: "rejection" | "approval" | "salary-required";
  label: string;
  color: string;
  icon: typeof CheckCircle;
} {
  if (customer.creditScore < 700) {
    return {
      type: "rejection",
      label: "Rejection Demo",
      color: "text-red-500 bg-red-500/10",
      icon: XCircle,
    };
  }
  // High limit customers get instant approval
  if (customer.preApprovedLimit >= 150000) {
    return {
      type: "approval",
      label: "Instant Approval",
      color: "text-green-500 bg-green-500/10",
      icon: CheckCircle,
    };
  }
  // Mid-range customers may need salary verification
  return {
    type: "salary-required",
    label: "Salary Verification",
    color: "text-yellow-500 bg-yellow-500/10",
    icon: AlertTriangle,
  };
}

export function DemoCustomerSelector({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  className,
  showDetails = true,
}: DemoCustomerSelectorProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.customerId === selectedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [selectedCustomerId, customers]);

  const handleSelectChange = (customerId: string) => {
    const customer = customers.find(c => c.customerId === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      onSelectCustomer(customer);
    }
  };

  // Group customers by demo category
  const rejectionCustomers = customers.filter(c => c.creditScore < 700);
  const approvalCustomers = customers.filter(c => c.creditScore >= 700 && c.preApprovedLimit >= 150000);
  const verificationCustomers = customers.filter(c => c.creditScore >= 700 && c.preApprovedLimit < 150000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Select 
        value={selectedCustomerId} 
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a demo customer profile" />
        </SelectTrigger>
        <SelectContent>
          {approvalCustomers.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Instant Approval Demos
              </SelectLabel>
              {approvalCustomers.map((customer) => (
                <SelectItem key={customer.customerId} value={customer.customerId}>
                  <div className="flex items-center gap-2">
                    <span>{customer.name}</span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      Score: {customer.creditScore}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {verificationCustomers.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Salary Verification Demos
              </SelectLabel>
              {verificationCustomers.map((customer) => (
                <SelectItem key={customer.customerId} value={customer.customerId}>
                  <div className="flex items-center gap-2">
                    <span>{customer.name}</span>
                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                      Score: {customer.creditScore}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {rejectionCustomers.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-red-600">
                <XCircle className="h-3 w-3" />
                Rejection Demos
              </SelectLabel>
              {rejectionCustomers.map((customer) => (
                <SelectItem key={customer.customerId} value={customer.customerId}>
                  <div className="flex items-center gap-2">
                    <span>{customer.name}</span>
                    <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                      Score: {customer.creditScore}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {showDetails && selectedCustomer && (
        <Card className="animate-fade-in">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.city} • {selectedCustomer.employmentType}
                  </p>
                </div>
              </div>
              
              {(() => {
                const category = getDemoCategory(selectedCustomer);
                const Icon = category.icon;
                return (
                  <Badge className={cn("gap-1", category.color)}>
                    <Icon className="h-3 w-3" />
                    {category.label}
                  </Badge>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Credit Score</p>
                  <p className={cn(
                    "font-semibold",
                    selectedCustomer.creditScore >= 700 ? "text-green-600" : "text-red-600"
                  )}>
                    {selectedCustomer.creditScore}/900
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pre-Approved</p>
                  <p className="font-semibold">{formatCurrency(selectedCustomer.preApprovedLimit)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Salary</p>
                  <p className="font-semibold">{formatCurrency(selectedCustomer.monthlyNetSalary)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                {selectedCustomer.existingLoan === "yes" ? (
                  <TrendingDown className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Existing Loan</p>
                  <p className="font-semibold capitalize">{selectedCustomer.existingLoan}</p>
                </div>
              </div>
            </div>

            {/* Demo scenario hints */}
            <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Demo Tip:</strong>{" "}
                {selectedCustomer.creditScore < 700 
                  ? "Any loan request will be rejected due to credit score below 700."
                  : selectedCustomer.preApprovedLimit >= 150000
                    ? `Request up to ${formatCurrency(selectedCustomer.preApprovedLimit)} for instant approval.`
                    : `Request ${formatCurrency(selectedCustomer.preApprovedLimit * 1.5)} to trigger salary slip verification.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
