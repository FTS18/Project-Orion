import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Phone, Mail, Bell, Palette, Shield, Save, DollarSign, Briefcase, CreditCard, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-provider";
import { GrainyBackground } from "@/components/ui/grainy-background";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    city: "",
    notifications: true,
    monthlySalary: "",
    employmentType: "salaried" as "salaried" | "self_employed",
    hasExistingLoan: false,
    existingLoanAmount: "",
    creditScore: 750, // Mock credit score (editable for demo)
  });
  
  const [preApprovedLimit, setPreApprovedLimit] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth/login");
        return;
      }
      
      setUser(user);
      
      // Load from user metadata
      if (user.user_metadata) {
        const salary = user.user_metadata.monthly_salary || 0;
        
        // Use saved credit score or generate random one for new users
        const savedScore = user.user_metadata.credit_score;
        const mockScore = savedScore || Math.floor(Math.random() * (850 - 650) + 650);
        
        setFormData({
          firstName: user.user_metadata.first_name || "",
          lastName: user.user_metadata.last_name || "",
          phone: user.user_metadata.phone || "",
          age: (user.user_metadata.age || "").toString(),
          city: user.user_metadata.city || "",
          notifications: user.user_metadata.notifications !== false,
          monthlySalary: salary.toString(),
          employmentType: user.user_metadata.employment_type || "salaried",
          hasExistingLoan: user.user_metadata.has_existing_loan || false,
          existingLoanAmount: (user.user_metadata.existing_loan_amount || 0).toString(),
          creditScore: mockScore,
        });
        
        // Calculate pre-approved limit (10x monthly salary)
        setPreApprovedLimit(salary > 0 ? salary * 10 : mockScore * 500);
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const salary = parseInt(formData.monthlySalary) || 0;
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          age: parseInt(formData.age) || 0,
          city: formData.city,
          notifications: formData.notifications,
          monthly_salary: salary,
          employment_type: formData.employmentType,
          has_existing_loan: formData.hasExistingLoan,
          existing_loan_amount: formData.hasExistingLoan ? parseInt(formData.existingLoanAmount) || 0 : 0,
          credit_score: formData.creditScore, // Save mock credit score
          pre_approved_limit: salary > 0 ? salary * 10 : formData.creditScore * 500,
        }
      });
      
      // Update pre-approved limit
      setPreApprovedLimit(salary > 0 ? salary * 10 : formData.creditScore * 500);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <GrainyBackground />
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4 pt-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 flex-shrink-0">
              <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 justify-start w-full">
                <TabsTrigger 
                  value="profile" 
                  className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-200 rounded-xl"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-200 rounded-xl"
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Financial</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-200 rounded-xl"
                >
                  <Palette className="h-5 w-5" />
                  <span className="font-medium">Preferences</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-200 rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Notifications</span>
                </TabsTrigger>
              </TabsList>
            </aside>

            <div className="flex-1 min-w-0">
              <TabsContent value="profile" className="mt-0 space-y-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="firstName"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="lastName"
                          className="pl-10"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        className="pl-10"
                        value={user?.email || ""}
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="age"
                          type="number"
                          className="pl-10"
                          placeholder="25"
                          value={formData.age}
                          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="city"
                          className="pl-10"
                          placeholder="Mumbai"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone"
                        type="tel"
                        className="pl-10"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </SpotlightCard>
            </TabsContent>

            <TabsContent value="financial" className="mt-0 space-y-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                  <CardDescription>
                    Manage your financial details for loan eligibility.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Credit Score & Pre-approved Limit */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <Label>Credit Score (Demo)</Label>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <Input
                          type="number"
                          min={300}
                          max={900}
                          value={formData.creditScore}
                          onChange={(e) => setFormData(prev => ({ ...prev, creditScore: Math.min(900, Math.max(300, parseInt(e.target.value) || 650)) }))}
                          className="w-24 text-2xl font-bold h-12"
                        />
                        <Badge variant={formData.creditScore >= 750 ? "default" : formData.creditScore >= 700 ? "secondary" : "destructive"}>
                          {formData.creditScore >= 750 ? "Excellent" : formData.creditScore >= 700 ? "Good" : "Fair"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Editable for demo (300-900)</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <Label>Pre-approved Limit</Label>
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        ₹{preApprovedLimit.toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Based on your salary & credit score</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Monthly Salary */}
                  <div className="space-y-2">
                    <Label htmlFor="monthlySalary">Monthly Net Salary (₹)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="monthlySalary"
                        type="number"
                        className="pl-10"
                        placeholder="50000"
                        value={formData.monthlySalary}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlySalary: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your pre-approved limit is 10x your monthly salary
                    </p>
                  </div>

                  {/* Employment Type */}
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
                        <SelectTrigger className="pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salaried">Salaried</SelectItem>
                          <SelectItem value="self_employed">Self-Employed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Existing Loan */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hasExistingLoan">Do you have an existing loan?</Label>
                        <p className="text-xs text-muted-foreground">This affects your loan eligibility</p>
                      </div>
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
                            className="pl-10"
                            placeholder="10000"
                            value={formData.existingLoanAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, existingLoanAmount: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </SpotlightCard>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 space-y-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how the app looks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <Button
                          key={t}
                          variant={theme === t ? "default" : "outline"}
                          className="capitalize"
                          onClick={() => setTheme(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </SpotlightCard>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your loan applications
                      </p>
                    </div>
                    <Switch
                      checked={formData.notifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                    />
                  </div>

                  <Separator />

                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </SpotlightCard>
            </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
