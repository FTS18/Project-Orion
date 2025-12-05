import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { WizardStepper, WizardNavigation } from "@/components/wizard-stepper";
import { FileUpload } from "@/components/file-upload";
import { CustomerDataCard, LoanRequestCard, UnderwritingResultCard } from "@/components/data-card";
import { StatusBadge } from "@/components/status-badge";
import { SanctionLetterModal } from "@/components/sanction-letter-modal";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  Customer, 
  LoanRequest, 
  KycVerificationResponse,
  SalaryExtractionResponse,
  UnderwritingResult, 
  SanctionLetterResponse 
} from "@shared/schema";
import { 
  User, 
  FileText, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  Loader2,
  IndianRupee,
  Calendar,
  Target,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const WIZARD_STEPS = [
  { id: 1, label: "Details", description: "Customer & Loan" },
  { id: 2, label: "Documents", description: "Upload Files" },
  { id: 3, label: "Verification", description: "KYC Check" },
  { id: 4, label: "Review", description: "Final Decision" },
];

const LOAN_PURPOSES = [
  "Home Improvement",
  "Education",
  "Medical Emergency",
  "Vehicle Purchase",
  "Business Expansion",
  "Debt Consolidation",
  "Travel",
  "Wedding",
  "Other",
];

export default function StandardModePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [loanTenure, setLoanTenure] = useState<string>("12");
  const [loanPurpose, setLoanPurpose] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [salaryData, setSalaryData] = useState<SalaryExtractionResponse | null>(null);
  const [kycResult, setKycResult] = useState<KycVerificationResponse | null>(null);
  const [underwritingResult, setUnderwritingResult] = useState<UnderwritingResult | null>(null);
  const [sanctionLetter, setSanctionLetter] = useState<SanctionLetterResponse | null>(null);
  const [showSanctionModal, setShowSanctionModal] = useState(false);

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const selectedCustomer = customers?.find(c => c.customerId === selectedCustomerId);

  const { data: creditData } = useQuery<{ score: number; preApprovedLimit: number }>({
    queryKey: ["/api/credit", selectedCustomerId],
    enabled: !!selectedCustomerId,
  });

  const { data: offers } = useQuery<Array<{ offerId: string; interestRate: number }>>({
    queryKey: ["/api/offers"],
    enabled: !!selectedCustomerId,
  });

  const extractSalaryMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", selectedCustomerId);
      const response = await fetch("/api/extract-salary", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to extract salary");
      return response.json() as Promise<SalaryExtractionResponse>;
    },
    onSuccess: (data) => {
      setSalaryData(data);
      toast({
        title: "Salary Extracted",
        description: `Net income: ₹${data.netIncome.toLocaleString('en-IN')}`,
      });
    },
    onError: () => {
      toast({
        title: "Extraction Failed",
        description: "Could not extract salary information from the document",
        variant: "destructive",
      });
    },
  });

  const verifyKycMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer) throw new Error("No customer selected");
      return apiRequest<KycVerificationResponse>("POST", "/api/verify-kyc", {
        customerId: selectedCustomerId,
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        address: selectedCustomer.city,
      });
    },
    onSuccess: (data) => {
      setKycResult(data);
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Could not verify KYC information",
        variant: "destructive",
      });
    },
  });

  const underwriteMutation = useMutation({
    mutationFn: async () => {
      const rate = offers?.[0]?.interestRate || 12;
      return apiRequest<UnderwritingResult>("POST", "/api/underwrite", {
        customerId: selectedCustomerId,
        loanRequest: {
          amount: parseInt(loanAmount),
          tenure: parseInt(loanTenure),
          rate,
        },
        creditScore: creditData?.score,
        preApprovedLimit: creditData?.preApprovedLimit,
      });
    },
    onSuccess: (data) => {
      setUnderwritingResult(data);
      if (data.decision === "APPROVE") {
        toast({
          title: "Loan Approved!",
          description: "Congratulations! Your loan has been approved.",
        });
      } else if (data.decision === "REJECT") {
        toast({
          title: "Loan Rejected",
          description: data.reason,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Underwriting Failed",
        description: "Could not process underwriting decision",
        variant: "destructive",
      });
    },
  });

  const generateSanctionMutation = useMutation({
    mutationFn: async () => {
      const rate = offers?.[0]?.interestRate || 12;
      return apiRequest<SanctionLetterResponse>("POST", "/api/generate-sanction-letter", {
        customerId: selectedCustomerId,
        loanTerms: {
          amount: parseInt(loanAmount),
          tenure: parseInt(loanTenure),
          rate,
          emi: underwritingResult?.emi || 0,
          totalAmount: underwritingResult?.totalAmount || 0,
        },
        signatory: "Loan Officer",
      });
    },
    onSuccess: (data) => {
      setSanctionLetter(data);
      setShowSanctionModal(true);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate sanction letter",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    extractSalaryMutation.mutate(file);
  }, [extractSalaryMutation]);

  const handleNext = useCallback(async () => {
    if (currentStep === 1) {
      if (!selectedCustomerId || !loanAmount || !loanPurpose) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 3) {
      await verifyKycMutation.mutateAsync();
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, selectedCustomerId, loanAmount, loanPurpose, verifyKycMutation, toast]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    await underwriteMutation.mutateAsync();
  }, [underwriteMutation]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCustomerId && loanAmount && parseInt(loanAmount) > 0 && loanPurpose;
      case 2:
        return true;
      case 3:
        return kycResult?.status === "VERIFIED";
      case 4:
        return true;
      default:
        return false;
    }
  };

  const loanRequest: LoanRequest | null = selectedCustomerId && loanAmount ? {
    customerId: selectedCustomerId,
    amount: parseInt(loanAmount) || 0,
    tenure: parseInt(loanTenure) || 12,
    purpose: loanPurpose,
    rate: offers?.[0]?.interestRate,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        mode="standard" 
        onModeChange={(mode) => navigate(`/${mode}`)}
        showModeToggle 
      />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2 mb-4"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
            
            <h1 className="text-3xl font-bold mb-2">Loan Application</h1>
            <p className="text-muted-foreground">
              Complete the steps below to submit your loan application
            </p>
          </div>

          <WizardStepper 
            steps={WIZARD_STEPS} 
            currentStep={currentStep}
            className="mb-8"
          />

          <Card className="animate-fade-in">
            <CardContent className="p-6 md:p-8">
              {currentStep === 1 && (
                <Step1CustomerDetails
                  customers={customers || []}
                  isLoading={isLoadingCustomers}
                  selectedCustomerId={selectedCustomerId}
                  onSelectCustomer={setSelectedCustomerId}
                  loanAmount={loanAmount}
                  onLoanAmountChange={setLoanAmount}
                  loanTenure={loanTenure}
                  onLoanTenureChange={setLoanTenure}
                  loanPurpose={loanPurpose}
                  onLoanPurposeChange={setLoanPurpose}
                  creditData={creditData}
                />
              )}

              {currentStep === 2 && (
                <Step2Documents
                  selectedCustomer={selectedCustomer}
                  loanRequest={loanRequest}
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null}
                  onFileRemove={() => {
                    setUploadedFile(null);
                    setSalaryData(null);
                  }}
                  isUploading={extractSalaryMutation.isPending}
                  salaryData={salaryData}
                />
              )}

              {currentStep === 3 && (
                <Step3Verification
                  selectedCustomer={selectedCustomer}
                  kycResult={kycResult}
                  isVerifying={verifyKycMutation.isPending}
                  onVerify={() => verifyKycMutation.mutate()}
                />
              )}

              {currentStep === 4 && (
                <Step4Review
                  selectedCustomer={selectedCustomer}
                  loanRequest={loanRequest}
                  kycResult={kycResult}
                  salaryData={salaryData}
                  underwritingResult={underwritingResult}
                  isProcessing={underwriteMutation.isPending}
                  onGenerateSanction={() => generateSanctionMutation.mutate()}
                  isGenerating={generateSanctionMutation.isPending}
                />
              )}

              <WizardNavigation
                currentStep={currentStep}
                totalSteps={4}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                isNextDisabled={!canProceed()}
                isSubmitting={underwriteMutation.isPending}
                submitLabel="Submit for Decision"
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <SanctionLetterModal
        isOpen={showSanctionModal}
        onClose={() => setShowSanctionModal(false)}
        sanctionLetter={sanctionLetter}
        customer={selectedCustomer || null}
        loanTerms={underwritingResult?.emi ? {
          amount: parseInt(loanAmount),
          tenure: parseInt(loanTenure),
          rate: offers?.[0]?.interestRate || 12,
          emi: underwritingResult.emi,
          totalAmount: underwritingResult.totalAmount || 0,
        } : undefined}
        onDownload={() => {
          toast({
            title: "Download Started",
            description: "Your sanction letter is being downloaded",
          });
        }}
      />
    </div>
  );
}

interface Step1Props {
  customers: Customer[];
  isLoading: boolean;
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  loanAmount: string;
  onLoanAmountChange: (value: string) => void;
  loanTenure: string;
  onLoanTenureChange: (value: string) => void;
  loanPurpose: string;
  onLoanPurposeChange: (value: string) => void;
  creditData?: { score: number; preApprovedLimit: number };
}

function Step1CustomerDetails({
  customers,
  isLoading,
  selectedCustomerId,
  onSelectCustomer,
  loanAmount,
  onLoanAmountChange,
  loanTenure,
  onLoanTenureChange,
  loanPurpose,
  onLoanPurposeChange,
  creditData,
}: Step1Props) {
  const selectedCustomer = customers.find(c => c.customerId === selectedCustomerId);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Select Customer</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <Select value={selectedCustomerId} onValueChange={onSelectCustomer}>
            <SelectTrigger className="h-12" data-testid="select-customer">
              <SelectValue placeholder="Select a customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem 
                  key={customer.customerId} 
                  value={customer.customerId}
                  data-testid={`select-option-${customer.customerId}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-muted-foreground">({customer.customerId})</span>
                    <span className="text-xs text-muted-foreground">{customer.city}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedCustomer && (
          <div className="mt-4 animate-fade-in">
            <CustomerDataCard customer={selectedCustomer} />
            
            {creditData && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit Score</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    creditData.score >= 700 ? "text-green-500" : 
                    creditData.score >= 650 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {creditData.score}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Pre-Approved Limit</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{creditData.preApprovedLimit.toLocaleString('en-IN')}
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCustomerId && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Loan Details</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="Enter amount"
                value={loanAmount}
                onChange={(e) => onLoanAmountChange(e.target.value)}
                min={10000}
                className="h-12"
                data-testid="input-loan-amount"
              />
              {creditData && parseInt(loanAmount) > creditData.preApprovedLimit * 2 && (
                <p className="text-xs text-yellow-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Amount exceeds 2x pre-approved limit
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTenure">Tenure (Months)</Label>
              <Select value={loanTenure} onValueChange={onLoanTenureChange}>
                <SelectTrigger className="h-12" data-testid="select-tenure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 12, 18, 24, 36, 48, 60, 72, 84].map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="loanPurpose">Purpose</Label>
              <Select value={loanPurpose} onValueChange={onLoanPurposeChange}>
                <SelectTrigger className="h-12" data-testid="select-purpose">
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Step2Props {
  selectedCustomer?: Customer;
  loanRequest: LoanRequest | null;
  onFileSelect: (file: File) => void;
  uploadedFile: { name: string; size: number } | null;
  onFileRemove: () => void;
  isUploading: boolean;
  salaryData: SalaryExtractionResponse | null;
}

function Step2Documents({
  selectedCustomer,
  loanRequest,
  onFileSelect,
  uploadedFile,
  onFileRemove,
  isUploading,
  salaryData,
}: Step2Props) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Upload Documents</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Upload your salary slip for income verification. This helps us process your application faster.
        </p>

        <FileUpload
          accept=".pdf,.jpg,.jpeg,.png"
          onFileSelect={onFileSelect}
          onFileRemove={onFileRemove}
          uploadedFile={uploadedFile}
          isUploading={isUploading}
          label="Upload Salary Slip"
          description="PDF or image of your latest salary slip"
        />

        {salaryData && (
          <Card className="mt-4 p-4 bg-green-500/5 border-green-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
              <h3 className="font-medium">Salary Information Extracted</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Gross Income</p>
                <p className="font-semibold">₹{salaryData.grossIncome.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Income</p>
                <p className="font-semibold">₹{salaryData.netIncome.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employer</p>
                <p className="font-semibold">{salaryData.employer}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {selectedCustomer && <CustomerDataCard customer={selectedCustomer} />}
        {loanRequest && <LoanRequestCard loanRequest={loanRequest} />}
      </div>
    </div>
  );
}

interface Step3Props {
  selectedCustomer?: Customer;
  kycResult: KycVerificationResponse | null;
  isVerifying: boolean;
  onVerify: () => void;
}

function Step3Verification({
  selectedCustomer,
  kycResult,
  isVerifying,
  onVerify,
}: Step3Props) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold">KYC Verification</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          We need to verify your identity against our records. This is a mandatory step for loan processing.
        </p>

        {!kycResult && (
          <Button
            onClick={onVerify}
            disabled={isVerifying}
            className="gap-2"
            data-testid="button-verify-kyc"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" aria-hidden="true" />
                Verify KYC
              </>
            )}
          </Button>
        )}

        {kycResult && (
          <Card className={cn(
            "p-6 animate-fade-in",
            kycResult.status === "VERIFIED" && "bg-green-500/5 border-green-500/20",
            kycResult.status === "PENDING" && "bg-yellow-500/5 border-yellow-500/20",
            kycResult.status === "FAILED" && "bg-red-500/5 border-red-500/20"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={kycResult.status} />
              <span className="text-sm text-muted-foreground">
                {kycResult.status === "VERIFIED" 
                  ? "All details verified successfully"
                  : kycResult.status === "PENDING"
                  ? "Some details need correction"
                  : "Verification failed"
                }
              </span>
            </div>

            {kycResult.mismatches.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Mismatches Found:</p>
                <ul className="space-y-1">
                  {kycResult.mismatches.map((mismatch, i) => (
                    <li key={i} className="text-sm flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-3 w-3" />
                      {mismatch}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>

      {selectedCustomer && (
        <CustomerDataCard customer={selectedCustomer} />
      )}
    </div>
  );
}

interface Step4Props {
  selectedCustomer?: Customer;
  loanRequest: LoanRequest | null;
  kycResult: KycVerificationResponse | null;
  salaryData: SalaryExtractionResponse | null;
  underwritingResult: UnderwritingResult | null;
  isProcessing: boolean;
  onGenerateSanction: () => void;
  isGenerating: boolean;
}

function Step4Review({
  selectedCustomer,
  loanRequest,
  kycResult,
  salaryData,
  underwritingResult,
  isProcessing,
  onGenerateSanction,
  isGenerating,
}: Step4Props) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Review & Submit</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Review all your information before submitting for final decision.
        </p>

        <div className="space-y-4">
          {selectedCustomer && <CustomerDataCard customer={selectedCustomer} />}
          {loanRequest && <LoanRequestCard loanRequest={loanRequest} />}
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">KYC Status</p>
              </div>
              {kycResult ? (
                <StatusBadge status={kycResult.status} />
              ) : (
                <span className="text-sm text-muted-foreground">Not verified</span>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Salary Verification</p>
              </div>
              {salaryData ? (
                <span className="text-sm text-green-500">₹{salaryData.netIncome.toLocaleString('en-IN')}/month</span>
              ) : (
                <span className="text-sm text-muted-foreground">Not provided</span>
              )}
            </Card>
          </div>
        </div>

        {isProcessing && (
          <Card className="p-6 mt-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium">Processing your application...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          </Card>
        )}

        {underwritingResult && (
          <div className="mt-6 animate-fade-in">
            <UnderwritingResultCard result={underwritingResult} />
            
            {underwritingResult.decision === "APPROVE" && (
              <Button
                onClick={onGenerateSanction}
                disabled={isGenerating}
                className="mt-4 gap-2"
                data-testid="button-generate-sanction"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Generate Sanction Letter
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
