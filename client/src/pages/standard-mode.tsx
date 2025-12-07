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
  { id: 1, label: "Details", description: "Customer & Loan" },
  { id: 2, label: "Documents", description: "Upload Files" },
  { id: 3, label: "Verification", description: "KYC Check" },
  { id: 4, label: "Review", description: "Final Decision" },
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
        return selectedCustomerId && loanAmount && parseInt(loanAmount) > 0 && (customCustomerData ? true : loanPurpose);
      case 2:
        return true;
      case 3:
        return kycResult?.status === "VERIFIED";
      case 4:
        return true;
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
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-8 md:mb-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center relative">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="self-start md:absolute md:left-0 md:top-0 gap-2 hover:bg-primary/5 hover:text-primary transition-colors mb-4 md:mb-0 pl-0 md:pl-4"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Home
              </Button>
              
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Loan Application
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Complete the guided steps below to get your instant loan decision.
                </p>
              </div>
            </div>
          </div>

          <WizardStepper 
            steps={WIZARD_STEPS} 
            currentStep={currentStep} 
            className="mb-8"
            onStepClick={(stepId) => {
              // Only allow navigating to previous steps or the current step
              if (stepId < currentStep) {
                setCurrentStep(stepId);
              }
            }}
          />

          <SpotlightCard 
            className="animate-fade-in border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden" 
            spotlightColor="rgba(var(--primary), 0.1)"
          >
            <CardContent className="p-8 md:p-12">
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
                  isLoadingCredit={isLoadingCredit}
                  userProfile={userProfile}
                  onCustomCustomerChange={setCustomCustomerData}
                  customCustomerData={customCustomerData}
                  offers={offers}
                  isLoadingOffers={isLoadingOffers}
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

              <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
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
              </div>
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
  isLoadingCredit?: boolean;
  userProfile?: UserProfile | null;
  onCustomCustomerChange?: (data: CustomerData | null) => void;
  customCustomerData?: CustomerData | null;
  offers?: Array<{ offerId: string; interestRate: number }>;
  isLoadingOffers?: boolean;
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
  isLoadingCredit,
  userProfile,
  onCustomCustomerChange,
  customCustomerData,
  offers,
  isLoadingOffers
}: Step1Props) {
  const [activeTab, setActiveTab] = useState("select");
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
    if (userProfile && activeTab === "custom") {
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
  }, [userProfile, activeTab, form]);

  const onSubmit = (data: z.infer<typeof customerFormSchema>) => {
    const newCustomer: CustomerData = {
      customerId: `CUSTOM${Date.now()}`,
      ...data,
      existingLoan: false,
      employmentType: 'salaried',
    };
    
    onCustomCustomerChange?.(newCustomer);
    onSelectCustomer(newCustomer.customerId);
    onLoanAmountChange(newCustomer.preApprovedLimit.toString());
  };

  const selectedCustomer = customCustomerData 
    ? { ...customCustomerData } as unknown as Customer 
    : customers.find(c => c.customerId === selectedCustomerId);

  // Use credit data from props or from selected customer
  const displayCreditData = customCustomerData ? {
    score: customCustomerData.creditScore,
    preApprovedLimit: customCustomerData.preApprovedLimit
  } : creditData;

  return (
    <div className="space-y-8 animate-fade-in">
      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        if (val === "select") {
          onCustomCustomerChange?.(null);
          onSelectCustomer("");
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="select">Select Existing Customer</TabsTrigger>
          <TabsTrigger value="custom">Enter Custom Details</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Select Customer</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <SpotlightCard
                    key={customer.customerId}
                    className={cn(
                      "p-5 cursor-pointer transition-all duration-300 border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl",
                      selectedCustomerId === customer.customerId
                        ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02] bg-primary/5"
                        : "hover:scale-[1.02] hover:shadow-md hover:bg-white/80 dark:hover:bg-black/60"
                    )}
                    spotlightColor="rgba(var(--primary), 0.1)"
                    onClick={() => onSelectCustomer(customer.customerId)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{customer.customerId}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                      </div>
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        selectedCustomerId === customer.customerId
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30"
                      )}>
                        {selectedCustomerId === customer.customerId && <CheckCircle className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <SpotlightCard 
            className="p-6 md:p-8 border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl"
            spotlightColor="rgba(var(--primary), 0.1)"
          >
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
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

                  <div className="space-y-5">
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
                  Use These Details
                </Button>
              </form>
            </Form>
          </SpotlightCard>
        </TabsContent>
      </Tabs>

      {/* Loan Details Section - Only show when customer is selected */}
      {(selectedCustomerId || customCustomerData) && (
        <div className="space-y-6 animate-fade-in pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
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
                {isLoadingCredit ? (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground animate-pulse">
                    <div className="h-3 w-3 rounded-full bg-primary/20" />
                    Checking credit limit...
                  </div>
                ) : displayCreditData && parseInt(loanAmount) > displayCreditData.preApprovedLimit ? (
                  <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    Exceeds limit of ₹{displayCreditData.preApprovedLimit.toLocaleString('en-IN')}
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
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                    @ {offers?.[0]?.interestRate || 8.5}% p.a. Interest
                  </Badge>
                </div>
              )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedCustomer || !loanRequest) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Customer Summary Card */}
      <SpotlightCard 
        className="p-6 border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md"
        spotlightColor="rgba(var(--primary), 0.1)"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {selectedCustomer.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {selectedCustomer.customerId}</p>
            </div>
          </div>
          
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-muted-foreground">Loan Amount</p>
              <p className="font-semibold">₹{loanRequest.amount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tenure</p>
              <p className="font-semibold">{loanRequest.tenure} months</p>
            </div>
          </div>
        </div>
      </SpotlightCard>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload Documents</h2>
            </div>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              Pending
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Upload Salary Slip</p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Please upload your latest salary slip for income verification. This helps us process your application faster.
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />

            {!uploadedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Upload Salary Slip</h3>
                <p className="text-sm text-muted-foreground mb-4">PDF or image of your latest salary slip</p>
                <p className="text-xs text-muted-foreground/70">Accepted formats: PDF, JPG, JPEG, PNG | Max size: 5MB</p>
              </div>
            ) : (
              <SpotlightCard 
                className="p-4 border-primary/20 bg-primary/5"
                spotlightColor="rgba(var(--primary), 0.1)"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFileRemove}
                    className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-primary font-medium">Analyzing document...</span>
                      <span className="text-muted-foreground">Please wait</span>
                    </div>
                    <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-progress-indeterminate" />
                    </div>
                  </div>
                )}
              </SpotlightCard>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Document Preview</h3>
          <div className="aspect-[3/4] rounded-xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
            {uploadedFile ? (
              <>
                <FileText className="h-16 w-16 text-primary/20 mb-4" />
                <p className="font-medium text-lg">Preview Available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We've successfully received your document. Our AI is extracting the details.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground">No document uploaded yet</p>
                <p className="text-xs text-muted-foreground/70 mt-2 max-w-[200px]">
                  Upload your salary slip to see the preview and extracted data here.
                </p>
              </>
            )}
          </div>
        </div>
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
    <div className="space-y-8 animate-fade-in">
      <SpotlightCard 
        className="p-8 border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md"
        spotlightColor="rgba(var(--primary), 0.1)"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">KYC Verification</h2>
            <p className="text-sm text-muted-foreground">Identity Verification</p>
          </div>
        </div>

        {!kycResult ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-primary/5 mx-auto flex items-center justify-center mb-6">
              <Shield className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-lg font-medium mb-2">Verify Your Identity</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              We need to verify your identity against our records. This is a mandatory step to ensure secure loan processing.
            </p>
            <Button
              onClick={onVerify}
              disabled={isVerifying}
              size="lg"
              className="min-w-[200px] shadow-lg shadow-primary/20"
              data-testid="button-verify-kyc"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Identity
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className={cn(
            "rounded-xl p-6 border transition-all duration-500",
            kycResult.status === "VERIFIED" && "bg-green-500/5 border-green-500/20",
            kycResult.status === "PENDING" && "bg-yellow-500/5 border-yellow-500/20",
            kycResult.status === "FAILED" && "bg-red-500/5 border-red-500/20"
          )}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  kycResult.status === "VERIFIED" && "bg-green-500/10 text-green-600",
                  kycResult.status === "PENDING" && "bg-yellow-500/10 text-yellow-600",
                  kycResult.status === "FAILED" && "bg-red-500/10 text-red-600"
                )}>
                  {kycResult.status === "VERIFIED" ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {kycResult.status === "VERIFIED" ? "Verification Successful" : "Verification Failed"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {kycResult.status === "VERIFIED" 
                      ? "Your identity has been successfully verified."
                      : "We found issues with your provided details."}
                  </p>
                </div>
              </div>
              <StatusBadge status={kycResult.status} />
            </div>

            {kycResult.mismatches.length > 0 && (
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Reasons for Failure:
                </p>
                <ul className="space-y-2">
                  {kycResult.mismatches.map((mismatch, i) => (
                    <li key={i} className="text-sm flex items-center gap-2 text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      {mismatch}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SpotlightCard>

      {selectedCustomer && (
        <div className="opacity-80 hover:opacity-100 transition-opacity">
          <CustomerDataCard customer={selectedCustomer} />
        </div>
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Review & Submit</h2>
            <p className="text-sm text-muted-foreground">Final Decision</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Application Summary */}
        <SpotlightCard 
          className="p-6 border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md"
          spotlightColor="rgba(var(--primary), 0.1)"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Application Summary
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Applicant</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {selectedCustomer?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedCustomer?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Loan Amount</p>
                  <p className="font-semibold text-lg">₹{loanRequest?.amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tenure</p>
                  <p className="font-semibold text-lg">{loanRequest?.tenure} Months</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Verifications</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">KYC Status</span>
                    </div>
                    {kycResult ? (
                      <StatusBadge status={kycResult.status} />
                    ) : (
                      <Badge variant="outline">Not Verified</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Income Check</span>
                    </div>
                    {salaryData ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Skipped</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Processing State */}
        {isProcessing && (
          <SpotlightCard className="p-8 text-center" spotlightColor="rgba(var(--primary), 0.1)">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Processing Application</h3>
            <p className="text-muted-foreground">
              Our AI agents are evaluating your profile and generating the best offer...
            </p>
          </SpotlightCard>
        )}

        {/* Underwriting Result */}
        {underwritingResult && (
          <div className="animate-fade-in space-y-6">
            <UnderwritingResultCard result={underwritingResult} />
            
            {underwritingResult.decision === "APPROVE" && (
              <SpotlightCard 
                className="p-6 border-green-500/20 bg-green-500/5"
                spotlightColor="rgba(34, 197, 94, 0.1)"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Sanction Letter Ready</h3>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">
                        Your loan has been approved. You can now generate and download your sanction letter.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={onGenerateSanction}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 min-w-[200px]"
                    data-testid="button-generate-sanction"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Download Letter
                      </>
                    )}
                  </Button>
                </div>
              </SpotlightCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
