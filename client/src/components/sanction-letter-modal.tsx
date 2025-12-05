import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Download, 
  FileText, 
  Check, 
  Calendar, 
  IndianRupee,
  Building,
  User,
  Hash
} from "lucide-react";
import type { Customer, SanctionLetterResponse } from "@shared/schema";

interface SanctionLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sanctionLetter: SanctionLetterResponse | null;
  customer: Customer | null;
  loanTerms?: {
    amount: number;
    tenure: number;
    rate: number;
    emi: number;
    totalAmount: number;
  };
  onDownload?: () => void;
  isDownloading?: boolean;
}

export function SanctionLetterModal({
  isOpen,
  onClose,
  sanctionLetter,
  customer,
  loanTerms,
  onDownload,
  isDownloading,
}: SanctionLetterModalProps) {
  if (!sanctionLetter || !customer) {
    return null;
  }

  const generateSchedule = () => {
    if (!loanTerms) return [];
    const schedule = [];
    let balance = loanTerms.amount;
    const monthlyRate = loanTerms.rate / 12 / 100;
    
    for (let i = 1; i <= Math.min(loanTerms.tenure, 6); i++) {
      const interest = balance * monthlyRate;
      const principal = loanTerms.emi - interest;
      balance -= principal;
      schedule.push({
        month: i,
        emi: loanTerms.emi,
        principal: Math.round(principal),
        interest: Math.round(interest),
        balance: Math.max(0, Math.round(balance)),
      });
    }
    return schedule;
  };

  const schedule = generateSchedule();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="sanction-letter-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
            </div>
            <span>Loan Approved!</span>
          </DialogTitle>
          <DialogDescription id="sanction-letter-description">
            Your loan application has been approved. Download your sanction letter below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="p-4 bg-green-500/5 border-green-500/20">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-green-500" aria-hidden="true" />
              <div>
                <h4 className="font-semibold">Sanction Letter</h4>
                <p className="text-sm text-muted-foreground">
                  Reference: {sanctionLetter.referenceNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Applicant</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer ID</p>
                  <p className="font-medium">{customer.customerId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Generated On</p>
                  <p className="font-medium">
                    {new Date(sanctionLetter.generatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Lender</p>
                  <p className="font-medium">Agentic Finance Ltd.</p>
                </div>
              </div>
            </div>
          </Card>

          {loanTerms && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" aria-hidden="true" />
                Loan Terms
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
                  <p className="text-lg font-bold">₹{loanTerms.amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Tenure</p>
                  <p className="text-lg font-bold">{loanTerms.tenure} months</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest</p>
                  <p className="text-lg font-bold">{loanTerms.rate}% p.a.</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly EMI</p>
                  <p className="text-lg font-bold text-primary">₹{loanTerms.emi.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {schedule.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3">Repayment Schedule (First 6 Months)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">Month</th>
                          <th className="py-2 px-3 text-right font-medium text-muted-foreground">EMI</th>
                          <th className="py-2 px-3 text-right font-medium text-muted-foreground">Principal</th>
                          <th className="py-2 px-3 text-right font-medium text-muted-foreground">Interest</th>
                          <th className="py-2 px-3 text-right font-medium text-muted-foreground">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row) => (
                          <tr key={row.month} className="border-b last:border-0">
                            <td className="py-2 px-3">{row.month}</td>
                            <td className="py-2 px-3 text-right">₹{row.emi.toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 text-right">₹{row.principal.toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 text-right">₹{row.interest.toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 text-right">₹{row.balance.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-close-sanction-modal"
          >
            Close
          </Button>
          <Button 
            onClick={onDownload}
            disabled={isDownloading}
            className="gap-2"
            data-testid="button-download-sanction-letter"
          >
            {isDownloading ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SanctionLetterPreview({ 
  sanctionLetter, 
  customer,
  className 
}: { 
  sanctionLetter: SanctionLetterResponse; 
  customer: Customer;
  className?: string;
}) {
  return (
    <Card className={cn("p-6 bg-white dark:bg-card", className)}>
      <div className="text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold">SANCTION LETTER</h2>
        <p className="text-sm text-muted-foreground mt-1">Agentic Finance Limited</p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reference No:</span>
          <span className="font-medium font-mono">{sanctionLetter.referenceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">
            {new Date(sanctionLetter.generatedAt).toLocaleDateString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Applicant:</span>
          <span className="font-medium">{customer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Customer ID:</span>
          <span className="font-medium">{customer.customerId}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          This letter confirms the sanction of your loan application. 
          Please retain this document for your records.
        </p>
      </div>
    </Card>
  );
}
