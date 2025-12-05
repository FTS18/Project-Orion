import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer, LoanRequest, UnderwritingResult } from "@shared/schema";
import { StatusBadge } from "@/components/status-badge";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  IndianRupee,
  Calendar,
  Target,
  Percent,
  TrendingUp
} from "lucide-react";

interface CustomerDataCardProps {
  customer: Customer | null;
  isLoading?: boolean;
  className?: string;
}

export function CustomerDataCard({ customer, isLoading, className }: CustomerDataCardProps) {
  if (isLoading) {
    return <CustomerDataCardSkeleton className={className} />;
  }

  if (!customer) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-sm text-muted-foreground text-center">
          No customer data available
        </p>
      </Card>
    );
  }

  const fields = [
    { icon: <User className="h-4 w-4" />, label: "Name", value: customer.name },
    { icon: <Calendar className="h-4 w-4" />, label: "Age", value: `${customer.age} years` },
    { icon: <MapPin className="h-4 w-4" />, label: "City", value: customer.city },
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: customer.phone },
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: customer.email },
    { icon: <Briefcase className="h-4 w-4" />, label: "Employment", value: customer.employmentType },
    { icon: <CreditCard className="h-4 w-4" />, label: "Credit Score", value: customer.creditScore.toString() },
    { icon: <IndianRupee className="h-4 w-4" />, label: "Pre-Approved", value: `₹${customer.preApprovedLimit.toLocaleString('en-IN')}` },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Monthly Salary", value: `₹${customer.monthlyNetSalary.toLocaleString('en-IN')}` },
  ];

  return (
    <Card className={cn("", className)} data-testid="customer-data-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">{customer.name}</h3>
            <p className="text-sm text-muted-foreground">ID: {customer.customerId}</p>
          </div>
          {customer.existingLoan === "yes" && (
            <StatusBadge status="PENDING" size="sm" showIcon={false} />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-0.5">{field.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{field.label}</p>
                <p className="text-sm font-medium truncate">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        {customer.existingLoan === "yes" && customer.existingLoanAmount > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Existing Loan</p>
            <p className="text-sm font-medium">₹{customer.existingLoanAmount.toLocaleString('en-IN')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomerDataCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LoanRequestCardProps {
  loanRequest: LoanRequest | null;
  isLoading?: boolean;
  className?: string;
}

export function LoanRequestCard({ loanRequest, isLoading, className }: LoanRequestCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!loanRequest) {
    return null;
  }

  const fields = [
    { icon: <IndianRupee className="h-4 w-4" />, label: "Amount", value: `₹${loanRequest.amount.toLocaleString('en-IN')}` },
    { icon: <Calendar className="h-4 w-4" />, label: "Tenure", value: `${loanRequest.tenure} months` },
    { icon: <Target className="h-4 w-4" />, label: "Purpose", value: loanRequest.purpose },
    { icon: <Percent className="h-4 w-4" />, label: "Interest Rate", value: loanRequest.rate ? `${loanRequest.rate}%` : "TBD" },
  ];

  return (
    <Card className={cn("", className)} data-testid="loan-request-card">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">Loan Request</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-0.5">{field.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{field.label}</p>
                <p className="text-sm font-medium">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface UnderwritingResultCardProps {
  result: UnderwritingResult | null;
  isLoading?: boolean;
  className?: string;
}

export function UnderwritingResultCard({ result, isLoading, className }: UnderwritingResultCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const decisionColors = {
    APPROVE: "bg-green-500/10 border-green-500/20",
    REJECT: "bg-red-500/10 border-red-500/20",
    PENDING: "bg-yellow-500/10 border-yellow-500/20",
  };

  return (
    <Card 
      className={cn("border-2", decisionColors[result.decision], className)} 
      data-testid="underwriting-result-card"
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={result.decision} />
              {result.referenceNumber && (
                <span className="text-xs text-muted-foreground font-mono">
                  Ref: {result.referenceNumber}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground">{result.reason}</p>
            {result.requiredAction && (
              <p className="text-sm text-muted-foreground mt-1">
                Required: {result.requiredAction}
              </p>
            )}
          </div>
          
          {result.emi && result.totalAmount && (
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly EMI</p>
                <p className="text-xl font-bold">₹{result.emi.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
                <p className="text-xl font-bold">₹{result.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function MetricCard({ label, value, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("", className)} data-testid={`metric-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs mt-1 flex items-center gap-1",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          {icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
