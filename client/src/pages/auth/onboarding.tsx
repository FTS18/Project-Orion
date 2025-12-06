import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Phone, CheckCircle, Briefcase, DollarSign, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import Header from "@/components/header";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    monthlySalary: "",
    employmentType: "salaried" as "salaried" | "self_employed",
    hasExistingLoan: false,
    existingLoanAmount: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth/login");
        return;
      }
      setUser(user);
      
      // Pre-fill from user metadata if available
      if (user.user_metadata) {
        setFormData(prev => ({
          ...prev,
          firstName: user.user_metadata.first_name || user.user_metadata.full_name?.split(' ')[0] || "",
          lastName: user.user_metadata.last_name || user.user_metadata.full_name?.split(' ').slice(1).join(' ') || "",
        }));
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          monthly_salary: parseInt(formData.monthlySalary) || 0,
          employment_type: formData.employmentType,
          has_existing_loan: formData.hasExistingLoan,
          existing_loan_amount: formData.hasExistingLoan ? parseInt(formData.existingLoanAmount) || 0 : 0,
          onboarding_complete: true,
        }
      });

      if (error) throw error;

      // Save to backend
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      });

      toast({
        title: "Profile Complete!",
        description: "Welcome to Project Orion. Let's get started!",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Financial Info" },
    { number: 3, title: "Contact" },
    { number: 4, title: "Complete" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= s.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'}
                  transition-colors
                `}>
                  {step > s.number ? <CheckCircle className="h-5 w-5" /> : s.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${step > s.number ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <SpotlightCard 
            className="border-primary/10 shadow-2xl bg-background/60 backdrop-blur-xl" 
            spotlightColor="rgba(var(--primary), 0.1)"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {step === 1 && "Welcome! Let's set up your profile"}
                {step === 2 && "Financial Information"}
                {step === 3 && "How can we reach you?"}
                {step === 4 && "You're all set!"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us a bit about yourself"}
                {step === 2 && "Help us understand your financial profile"}
                {step === 3 && "Add your contact information"}
                {step === 4 && "Your profile is complete"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="firstName"
                          placeholder="John"
                          className="pl-10 bg-background/50"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="lastName"
                          placeholder="Doe"
                          className="pl-10 bg-background/50"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={() => setStep(2)}
                      disabled={!formData.firstName || !formData.lastName}
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="monthlySalary">Monthly Net Salary (₹)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="monthlySalary"
                          type="number"
                          placeholder="50000"
                          className="pl-10 bg-background/50"
                          value={formData.monthlySalary}
                          onChange={(e) => setFormData(prev => ({ ...prev, monthlySalary: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Select 
                          value={formData.employmentType} 
                          onValueChange={(value: "salaried" | "self_employed") => 
                            setFormData(prev => ({ ...prev, employmentType: value }))
                          }
                        >
                          <SelectTrigger className="pl-10 bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="salaried">Salaried</SelectItem>
                            <SelectItem value="self_employed">Self-Employed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasExistingLoan">Do you have an existing loan?</Label>
                        <Switch
                          id="hasExistingLoan"
                          checked={formData.hasExistingLoan}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasExistingLoan: checked }))
                          }
                        />
                      </div>

                      {formData.hasExistingLoan && (
                        <div className="space-y-2">
                          <Label htmlFor="existingLoanAmount">Existing Loan EMI (₹/month)</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="existingLoanAmount"
                              type="number"
                              placeholder="10000"
                              className="pl-10 bg-background/50"
                              value={formData.existingLoanAmount}
                              onChange={(e) => setFormData(prev => ({ ...prev, existingLoanAmount: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        className="flex-1"
                        onClick={() => setStep(3)}
                        disabled={!formData.monthlySalary}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="pl-10 bg-background/50"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Optional - for important notifications</p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setStep(2)}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        className="flex-1"
                        onClick={() => setStep(4)}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center"
                  >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Hi, {formData.firstName}! 👋
                      </p>
                      <p className="text-muted-foreground">
                        Your profile is ready. You can now access all features of Project Orion.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setStep(3)}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Get Started"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </SpotlightCard>
        </motion.div>
      </main>
    </div>
  );
}
