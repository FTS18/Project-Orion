import { useState, useCallback, useEffect, useRef } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import { WizardStepper, WizardNavigation } from "@/components/wizard-stepper";
import { FileUpload } from "@/components/file-upload";
import { CustomerDataCard, LoanRequestCard, UnderwritingResultCard } from "@/components/data-card";
import { StatusBadge } from "@/components/status-badge";
import { SanctionLetterModal } from "@/components/sanction-letter-modal";
import type { CustomerData, LoanDetails } from "@/components/custom-data-entry";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  Upload,
  XCircle,
  Users,
  UserCircle,
  Wallet,
  CreditCard,
  Briefcase,
  Percent,
  ArrowRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, type UserProfile } from "@/lib/agent-user-context";
import { GrainyBackground } from "@/components/ui/grainy-background";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const WIZARD_STEPS = [
  { id: 1, label: "Applicant", description: "Personal Details" },
  { id: 2, label: "Loan Details", description: "Amount & Tenure" },
  { id: 3, label: "Documents", description: "Income Proof" },
  { id: 4, label: "Verification", description: "Identity Check" },
  { id: 5, label: "Decision", description: "Final Approval" },
];

const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().min(18, "Must be at least 18").max(100, "Invalid age"),
  city: z.string().min(2, "City is required"),
  monthlyNetSalary: z.coerce.number().min(10000, "Minimum salary is 10,000"),
  creditScore: z.coerce.number().min(300, "Min score 300").max(900, "Max score 900"),
  preApprovedLimit: z.coerce.number().min(10000, "Minimum limit is 10,000"),
});

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
  
  const [customCustomerData, setCustomCustomerData] = useState<CustomerData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    getCurrentUser().then(setUserProfile);
  }, []);
  
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

  const selectedCustomer = customCustomerData 
    ? { ...customCustomerData } as unknown as Customer 
    : customers?.find(c => c.customerId === selectedCustomerId);

  const { data: creditData, isLoading: isLoadingCredit } = useQuery<{ score: number; preApprovedLimit: number }>({
    queryKey: ["/api/credit", selectedCustomerId],
    enabled: !!selectedCustomerId && !selectedCustomerId.startsWith("CUSTOM"),
  });

  const { data: offers, isLoading: isLoadingOffers } = useQuery<Array<{ offerId: string; interestRate: number }>>({
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
      const res = await apiRequest("POST", "/api/verify-kyc", {
        customerId: selectedCustomerId,
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        address: selectedCustomer.city || "Mumbai",
      });
      return res.json() as Promise<KycVerificationResponse>;
    },
    onSuccess: (data) => {
      setKycResult(data);
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Could not verify KYC information. Please ensure all details are correct.",
        variant: "destructive",
      });
    },
  });

  const underwriteMutation = useMutation({
    mutationFn: async () => {
      const rate = offers?.[0]?.interestRate || 12;
      const res = await apiRequest("POST", "/api/underwrite", {
        customerId: selectedCustomerId,
        loanRequest: {
          amount: parseInt(loanAmount),
          tenure: parseInt(loanTenure),
          rate,
        },
        creditScore: creditData?.score,
        preApprovedLimit: creditData?.preApprovedLimit,
      });
      return res.json() as Promise<UnderwritingResult>;
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
      const res = await apiRequest("POST", "/api/generate-sanction-letter", {
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
      return res.json() as Promise<SanctionLetterResponse>;
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
      if (!selectedCustomerId) {
        toast({
          title: "Applicant Details Required",
          description: "Please fill in your details to proceed.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 2) {
      if (!loanAmount || !loanPurpose) {
        toast({
          title: "Loan Details Required",
          description: "Please specify the loan amount and purpose.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep === 4) {
      await verifyKycMutation.mutateAsync();
    }

    if (currentStep < 5) {
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
        return !!selectedCustomerId;
      case 2:
        return !!loanAmount && parseInt(loanAmount) > 0 && !!loanPurpose;
      case 3:
        return true; // File upload is optional for demo flow, or strictly required? Let's make it optional for smoother demo
      case 4:
        return kycResult?.status === "VERIFIED";
      case 5:
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
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between relative gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="self-start md:self-center gap-2 hover:bg-primary/5 hover:text-primary transition-colors pl-0"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Home
              </Button>
              
              <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 w-full md:w-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Loan Application
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Complete the steps below for an instant decision.
                </p>
              </div>

              <div className="hidden md:block w-[100px]" /> {/* Spacer for balance */}
            </div>
          </div>

          <WizardStepper 
            steps={WIZARD_STEPS} 
            currentStep={currentStep} 
            className="mb-8 max-w-4xl mx-auto"
            onStepClick={(stepId) => {
              if (stepId < currentStep) {
                setCurrentStep(stepId);
              }
            }}
          />

          <SpotlightCard 
            className="animate-fade-in border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden mx-auto" 
            spotlightColor="rgba(var(--primary), 0.1)"
          >
            <CardContent className="p-6 md:p-10">
              {currentStep === 1 && (
                <Step1ApplicantInfo
                  userProfile={userProfile}
                  onCustomCustomerChange={setCustomCustomerData}
                  customCustomerData={customCustomerData}
                  onSelectCustomer={setSelectedCustomerId}
                  onNext={handleNext}
                />
              )}

              {currentStep === 2 && (
                <Step2LoanDetails
                  loanAmount={loanAmount}
                  onLoanAmountChange={setLoanAmount}
                  loanTenure={loanTenure}
                  onLoanTenureChange={setLoanTenure}
                  loanPurpose={loanPurpose}
                  onLoanPurposeChange={setLoanPurpose}
                  offers={offers}
                  isLoadingOffers={isLoadingOffers}
                  selectedCustomer={selectedCustomer}
                />
              )}

              {currentStep === 3 && (
                <Step3Documents
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

              {currentStep === 4 && (
                <Step4Verification
                  selectedCustomer={selectedCustomer}
                  kycResult={kycResult}
                  isVerifying={verifyKycMutation.isPending}
                  onVerify={() => verifyKycMutation.mutate()}
                />
              )}

              {currentStep === 5 && (
                <Step5Decision
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

              {currentStep > 1 && (
                <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
                  <WizardNavigation
                    currentStep={currentStep}
                    totalSteps={5}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    isNextDisabled={!canProceed()}
                    isSubmitting={underwriteMutation.isPending}
                    submitLabel="Submit for Decision"
                  />
                </div>
              )}
            </CardContent>
          </SpotlightCard>
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
  userProfile?: UserProfile | null;
  onCustomCustomerChange: (data: CustomerData | null) => void;
  customCustomerData: CustomerData | null;
  onSelectCustomer: (id: string) => void;
  onNext: () => void;
}

function Step1ApplicantInfo({
  userProfile,
  onCustomCustomerChange,
  customCustomerData,
  onSelectCustomer,
  onNext
}: Step1Props) {
  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      age: 25,
      city: "",
      monthlyNetSalary: 50000,
      creditScore: 750,
      preApprovedLimit: 300000,
    },
  });

  // Auto-fill from user profile
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        email: userProfile.email,
        phone: userProfile.phone,
        age: userProfile.age || 25,
        city: userProfile.city || "Mumbai",
        monthlyNetSalary: userProfile.monthlySalary || 50000,
        creditScore: 750,
        preApprovedLimit: (userProfile.monthlySalary || 50000) * 10,
      });
    }
  }, [userProfile, form]);

  const onSubmit = (data: z.infer<typeof customerFormSchema>) => {
    const newCustomer: CustomerData = {
      customerId: `CUSTOM${Date.now()}`,
      ...data,
      existingLoan: false,
      employmentType: 'salaried',
    };
    
    onCustomCustomerChange(newCustomer);
    onSelectCustomer(newCustomer.customerId);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <UserCircle className="w-5 h-5" />
          </div>
          Enter Applicant Details
        </h3>
        {userProfile && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 w-fit">
            Auto-filled from Profile
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">City</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="monthlyNetSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Monthly Salary (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Credit Score</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preApprovedLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Pre-approved Limit (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-11 bg-white/50 dark:bg-black/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full mt-8 h-12 text-base font-medium shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]" 
          >
            <Plus className="w-5 h-5 mr-2" />
            {customCustomerData ? "Update Details" : "Save & Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

interface Step2Props {
  loanAmount: string;
  onLoanAmountChange: (value: string) => void;
  loanTenure: string;
  onLoanTenureChange: (value: string) => void;
  loanPurpose: string;
  onLoanPurposeChange: (value: string) => void;
  offers?: Array<{ offerId: string; interestRate: number }>;
  isLoadingOffers?: boolean;
  selectedCustomer?: Customer;
}

function Step2LoanDetails({
  loanAmount,
  onLoanAmountChange,
  loanTenure,
  onLoanTenureChange,
  loanPurpose,
  onLoanPurposeChange,
  offers,
  isLoadingOffers,
  selectedCustomer
}: Step2Props) {
  // Safe access to preApprovedLimit
  const preApprovedLimit = (selectedCustomer as any)?.preApprovedLimit || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold">Loan Requirements</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="loanAmount" className="text-sm font-medium">Loan Amount (₹)</Label>
            <div className="relative group">
              <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="loanAmount"
                type="number"
                placeholder="Enter amount"
                value={loanAmount}
                onChange={(e) => onLoanAmountChange(e.target.value)}
                min={10000}
                className="pl-10 h-12 text-lg bg-white/50 dark:bg-black/20"
              />
            </div>
            {preApprovedLimit > 0 && parseInt(loanAmount) > preApprovedLimit ? (
              <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 mt-2">
                <AlertCircle className="h-3 w-3" />
                Exceeds limit of ₹{preApprovedLimit.toLocaleString('en-IN')}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <Label htmlFor="loanTenure" className="text-sm font-medium">Tenure (Months)</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Select value={loanTenure} onValueChange={onLoanTenureChange}>
                <SelectTrigger className="pl-10 h-12 text-lg bg-white/50 dark:bg-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 24, 36, 48, 60, 72, 84].map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="loanPurpose" className="text-sm font-medium">Purpose</Label>
            <div className="relative group">
              <Target className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Select value={loanPurpose} onValueChange={onLoanPurposeChange}>
                <SelectTrigger className="pl-10 h-12 text-lg bg-white/50 dark:bg-black/20">
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

          {/* EMI Preview */}
          {loanAmount && loanTenure && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              {isLoadingOffers ? (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : null}
              
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Estimated Monthly EMI</p>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                ₹{Math.round((parseInt(loanAmount) * ((offers?.[0]?.interestRate || 8.5)/1200) * Math.pow(1 + (offers?.[0]?.interestRate || 8.5)/1200, parseInt(loanTenure))) / (Math.pow(1 + (offers?.[0]?.interestRate || 8.5)/1200, parseInt(loanTenure)) - 1)).toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="h-3 w-3" />
                <span>{offers?.[0]?.interestRate || 8.5}% Interest Rate</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Step3Props {
  selectedCustomer?: Customer;
  loanRequest: LoanRequest | null;
  onFileSelect: (file: File) => void;
  uploadedFile: { name: string; size: number } | null;
  onFileRemove: () => void;
  isUploading: boolean;
  salaryData: SalaryExtractionResponse | null;
}

function Step3Documents({
  selectedCustomer,
  loanRequest,
  onFileSelect,
  uploadedFile,
  onFileRemove,
  isUploading,
  salaryData
}: Step3Props) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Income Proof</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Please upload your latest salary slip or bank statement (PDF/Image) to verify your income.
            </p>
            
            <FileUpload
              onFileSelect={onFileSelect}
              selectedFile={uploadedFile}
              onRemove={onFileRemove}
              isUploading={isUploading}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          {salaryData && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-in slide-in-from-bottom-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Document Verified</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Successfully extracted income details.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Net Income:</span>
                      <span className="ml-2 font-medium">₹{salaryData.netIncome.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="ml-2 font-medium">{(salaryData.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 lg:w-96 space-y-4">
          <CustomerDataCard customer={selectedCustomer} className="h-full" />
          {loanRequest && <LoanRequestCard loanRequest={loanRequest} className="h-full" />}
        </div>
      </div>
    </div>
  );
}

interface Step4Props {
  selectedCustomer?: Customer;
  kycResult: KycVerificationResponse | null;
  isVerifying: boolean;
  onVerify: () => void;
}

function Step4Verification({
  selectedCustomer,
  kycResult,
  isVerifying,
  onVerify
}: Step4Props) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
        <p className="text-muted-foreground">
          We need to verify your identity against government records. This process is instant and secure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-muted/50 border border-border/50 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Applicant Name</span>
              <span className="font-medium">{selectedCustomer?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Phone Number</span>
              <span className="font-medium">{selectedCustomer?.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">PAN Status</span>
              <Badge variant="outline" className="bg-background">Pending Check</Badge>
            </div>
          </div>

          {!kycResult && (
            <Button 
              onClick={onVerify} 
              disabled={isVerifying}
              className="w-full h-12 text-base shadow-lg shadow-primary/20"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying Details...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Verify Identity Now
                </>
              )}
            </Button>
          )}
        </div>

        <div className="relative min-h-[200px] flex items-center justify-center">
          {kycResult ? (
            <div className="text-center space-y-4 animate-in zoom-in-50 duration-500">
              <div className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center ${
                kycResult.status === 'VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {kycResult.status === 'VERIFIED' ? (
                  <CheckCircle className="h-12 w-12" />
                ) : (
                  <XCircle className="h-12 w-12" />
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-1">
                  {kycResult.status === 'VERIFIED' ? 'Verification Successful' : 'Verification Failed'}
                </h4>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {kycResult.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground opacity-50">
              <Shield className="h-24 w-24 mx-auto mb-4 stroke-1" />
              <p>Waiting for verification...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Step5Props {
  selectedCustomer?: Customer;
  loanRequest: LoanRequest | null;
  kycResult: KycVerificationResponse | null;
  salaryData: SalaryExtractionResponse | null;
  underwritingResult: UnderwritingResult | null;
  isProcessing: boolean;
  onGenerateSanction: () => void;
  isGenerating: boolean;
}

function Step5Decision({
  selectedCustomer,
  loanRequest,
  kycResult,
  salaryData,
  underwritingResult,
  isProcessing,
  onGenerateSanction,
  isGenerating
}: Step5Props) {
  if (isProcessing) {
    return (
      <div className="py-20 text-center space-y-6 animate-fade-in">
        <div className="relative mx-auto h-24 w-24">
          <div className="absolute inset-0 rounded-full border-4 border-muted opacity-20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Analyzing Your Profile</h3>
          <p className="text-muted-foreground">
            Our AI is evaluating your creditworthiness and generating the best offer...
          </p>
        </div>
      </div>
    );
  }

  if (underwritingResult) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <Badge 
            variant={underwritingResult.decision === "APPROVE" ? "default" : "destructive"}
            className="mb-4 px-4 py-1 text-base"
          >
            {underwritingResult.decision === "APPROVE" ? "APPROVED" : "REJECTED"}
          </Badge>
          <h3 className="text-2xl font-bold mb-2">
            {underwritingResult.decision === "APPROVE" ? "Congratulations!" : "Application Status"}
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {underwritingResult.decision === "APPROVE" 
              ? "Your loan application has been approved based on your profile and documents."
              : underwritingResult.reason}
          </p>
        </div>

        {underwritingResult.decision === "APPROVE" && (
          <div className="grid md:grid-cols-2 gap-8">
            <UnderwritingResultCard result={underwritingResult} />
            
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Next Steps
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Download your Sanction Letter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Sign the agreement digitally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Amount disbursed within 2 hours</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={onGenerateSanction} 
                disabled={isGenerating}
                className="w-full h-14 text-lg shadow-xl shadow-primary/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Letter...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Download Sanction Letter
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Ready to submit your application?</p>
    </div>
  );
}
