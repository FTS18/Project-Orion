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
import { 
  Loader2, User, Phone, Mail, Bell, Palette, Save, 
  DollarSign, Briefcase, CreditCard, TrendingUp, CheckCircle2,
  MapPin, Wallet, LogOut, ChevronRight, Shield
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
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
    creditScore: 750, // Mock credit score
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
        description: "Your changes have been saved successfully.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200"
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save profile changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-100 dark:selection:bg-blue-900/30">
      <Header />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-400/5 dark:bg-blue-500/5 blur-[100px]" />
         <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/5 dark:bg-blue-600/5 blur-[100px]" />
      </div>
      
      <main className="relative pt-24 pb-16 container mx-auto px-4 md:px-8 max-w-6xl z-10">
        <div className="animate-fade-in-up">
          <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
               <div className="px-2">
                 <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                   Settings
                 </h1>
                 <p className="text-muted-foreground mt-1">Manage your account</p>
              </div>

               <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
                  <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full gap-1">
                    <TabsTrigger 
                      value="profile" 
                      className="w-full justify-between px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-emerald-500/10 dark:data-[state=active]:from-blue-500/10 dark:data-[state=active]:to-blue-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-blue-400 transition-all font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-500 group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-blue-400" />
                        <span>Profile Details</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="financial" 
                      className="w-full justify-between px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-emerald-500/10 dark:data-[state=active]:from-blue-500/10 dark:data-[state=active]:to-blue-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-blue-400 transition-all font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-slate-500 group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-blue-400" />
                        <span>Financial Info</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                    </TabsTrigger>

                    <TabsTrigger 
                      value="preferences" 
                      className="w-full justify-between px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-emerald-500/10 dark:data-[state=active]:from-blue-500/10 dark:data-[state=active]:to-blue-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-blue-400 transition-all font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <Palette className="h-4 w-4 text-slate-500 group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-blue-400" />
                        <span>Appearance</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                    </TabsTrigger>

                    <TabsTrigger 
                      value="notifications" 
                      className="w-full justify-between px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-emerald-500/10 dark:data-[state=active]:from-blue-500/10 dark:data-[state=active]:to-blue-500/10 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-blue-400 transition-all font-medium group"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-slate-500 group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-blue-400" />
                        <span>Notifications</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6 px-2">
                    <Button 
                       variant="ghost" 
                       className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 gap-3"
                       onClick={handleLogout}
                    >
                       <LogOut className="h-4 w-4" />
                       Log Out
                    </Button>
                  </div>
               </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
               <TabsContent value="profile" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <SpotlightCard 
                    className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl" 
                    spotlightColor={resolvedTheme === "dark" 
                      ? "rgba(30, 64, 175, 0.15)" // Darker Blue (blue-800) with lower opacity
                      : "rgba(52, 211, 153, 0.05)" // Lighter Green (emerald-400) with very low opacity
                    }
                  >
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-600 dark:text-slate-400">First Name</Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                              id="firstName"
                              className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all"
                              value={formData.firstName}
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-600 dark:text-slate-400">Last Name</Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                              id="lastName"
                              className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600 dark:text-slate-400">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            id="email"
                            className="pl-10 h-11 bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-muted-foreground cursor-not-allowed"
                            value={user?.email || ""}
                            disabled
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Email address cannot be changed for security reasons.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-slate-600 dark:text-slate-400">Age</Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                              id="age"
                              type="number"
                              className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all"
                              placeholder="25"
                              value={formData.age}
                              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-600 dark:text-slate-400">City</Label>
                          <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                              id="city"
                              className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all"
                              placeholder="Mumbai"
                              value={formData.city}
                              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-600 dark:text-slate-400">Phone Number</Label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                          <Input 
                            id="phone"
                            type="tel"
                            className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-800" />

                      <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-blue-600 dark:to-blue-500 hover:from-emerald-700 hover:to-emerald-600 dark:hover:from-blue-700 dark:hover:to-blue-600 text-white shadow-lg shadow-emerald-500/20 dark:shadow-blue-500/20 border-0 h-11 px-8">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </SpotlightCard>
               </TabsContent>

               <TabsContent value="financial" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <SpotlightCard 
                    className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl" 
                    spotlightColor="rgba(16, 185, 129, 0.1)"
                  >
                    <CardHeader>
                      <CardTitle>Financial Information</CardTitle>
                      <CardDescription>
                        Manage your financial details for loan eligibility.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Credit Score & Pre-approved Limit */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900/50 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                              <TrendingUp className="h-24 w-24 text-emerald-500 dark:text-blue-500" />
                           </div>
                           <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-blue-500/10 text-emerald-600 dark:text-blue-400">
                                   <TrendingUp className="h-5 w-5" />
                                </div>
                                <Label className="text-base font-semibold">Credit Score</Label>
                              </div>
                              
                              <div className="flex items-end gap-3 mb-2">
                                <Input
                                  type="number"
                                  min={300}
                                  max={900}
                                  value={formData.creditScore}
                                  onChange={(e) => setFormData(prev => ({ ...prev, creditScore: Math.min(900, Math.max(300, parseInt(e.target.value) || 650)) }))}
                                  className="w-28 text-3xl font-bold h-14 bg-white/50 dark:bg-black/20 border-emerald-500/20 dark:border-blue-500/20 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 text-emerald-700 dark:text-blue-400"
                                />
                                <Badge className={cn(
                                    "h-7 mb-2", 
                                    formData.creditScore >= 750 ? "bg-emerald-100 dark:bg-blue-900/30 text-emerald-700 dark:text-blue-300 border-emerald-200 dark:border-blue-800" : 
                                    formData.creditScore >= 700 ? "bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-300 border-blue-200 dark:border-slate-700" : "bg-orange-100 dark:bg-red-900/30 text-orange-700 dark:text-red-300 border-orange-200 dark:border-red-800"
                                )}>
                                  {formData.creditScore >= 750 ? "Excellent" : formData.creditScore >= 700 ? "Good" : "Fair"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 font-medium">Editable for demo purposes (300-900)</p>
                           </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Wallet className="h-24 w-24 text-blue-500" />
                           </div>
                           <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400">
                                   <CreditCard className="h-5 w-5" />
                                </div>
                                <Label className="text-base font-semibold">Pre-approved Limit</Label>
                              </div>
                              <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                ₹{preApprovedLimit.toLocaleString('en-IN')}
                              </div>
                              <div className="flex items-center gap-1.5 mt-3 text-xs text-blue-600/80 dark:text-indigo-400 font-medium">
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                                 <span>Calculated based on salary profile</span>
                              </div>
                           </div>
                        </div>
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-800" />

                      <div className="space-y-2">
                        <Label htmlFor="monthlySalary" className="text-slate-600 dark:text-slate-400">Monthly Net Salary (₹)</Label>
                        <div className="relative group">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                          <Input 
                            id="monthlySalary"
                            type="number"
                            className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all font-mono"
                            placeholder="50000"
                            value={formData.monthlySalary}
                            onChange={(e) => setFormData(prev => ({ ...prev, monthlySalary: e.target.value }))}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Defines your borrowing capacity</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employmentType" className="text-slate-600 dark:text-slate-400">Employment Type</Label>
                        <div className="relative group">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                          <Select 
                            value={formData.employmentType} 
                            onValueChange={(value: "salaried" | "self_employed") => 
                              setFormData(prev => ({ ...prev, employmentType: value }))
                            }
                          >
                            <SelectTrigger className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus:ring-emerald-500/20 dark:focus:ring-blue-500/20 focus:border-emerald-500 dark:focus:border-blue-500 transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salaried">Salaried</SelectItem>
                              <SelectItem value="self_employed">Self-Employed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="hasExistingLoan" className="text-base font-medium">Do you have an existing loan?</Label>
                            <p className="text-xs text-muted-foreground">Active loans may affect your debt-to-income ratio</p>
                          </div>
                          <Switch
                            id="hasExistingLoan"
                            checked={formData.hasExistingLoan}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, hasExistingLoan: checked }))
                            }
                            className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-blue-600"
                          />
                        </div>

                        {formData.hasExistingLoan && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top-2">
                            <Label htmlFor="existingLoanAmount" className="text-slate-600 dark:text-slate-400">Existing Loan EMI (₹/month)</Label>
                            <div className="relative group">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-blue-500 transition-colors" />
                              <Input 
                                id="existingLoanAmount"
                                type="number"
                                className="pl-10 h-11 bg-white border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/20 dark:focus-visible:ring-blue-500/20 focus-visible:border-emerald-500 dark:focus-visible:border-blue-500 transition-all font-mono"
                                placeholder="10000"
                                value={formData.existingLoanAmount}
                                onChange={(e) => setFormData(prev => ({ ...prev, existingLoanAmount: e.target.value }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-800" />

                      <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-blue-600 dark:to-blue-500 hover:from-emerald-700 hover:to-emerald-600 dark:hover:from-blue-700 dark:hover:to-blue-600 text-white shadow-lg shadow-emerald-500/20 dark:shadow-blue-500/20 border-0 h-11 px-8">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Update Financial Profile
                        </Button>
                      </div>
                    </CardContent>
                  </SpotlightCard>
               </TabsContent>

               <TabsContent value="preferences" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <SpotlightCard 
                    className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl" 
                    spotlightColor="rgba(16, 185, 129, 0.1)"
                  >
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>
                        Customize how the app looks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label>Theme Preference</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {(['light', 'dark', 'system'] as const).map((t) => (
                            <Button
                              key={t}
                              variant={theme === t ? "default" : "outline"}
                              className={cn(
                                "capitalize h-24 flex flex-col gap-2 relative overflow-hidden",
                                theme === t ? "bg-emerald-50 text-emerald-900 border-emerald-500 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-500" : "hover:bg-slate-50 dark:hover:bg-slate-900"
                              )}
                              onClick={() => setTheme(t)}
                            >
                               {t === 'light' && <div className="p-2 rounded-full bg-white shadow-sm border"><SunIcon /></div>}
                               {t === 'dark' && <div className="p-2 rounded-full bg-slate-950 shadow-sm border text-white"><MoonIcon /></div>}
                               {t === 'system' && <div className="p-2 rounded-full bg-gradient-to-r from-white to-black shadow-sm border"><MonitorIcon /></div>}
                               <span className="font-medium">{t}</span>
                               {theme === t && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500 dark:text-blue-500" />}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </SpotlightCard>
               </TabsContent>

               <TabsContent value="notifications" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <SpotlightCard 
                    className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl" 
                    spotlightColor="rgba(16, 185, 129, 0.1)"
                  >
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Configure how you receive alerts and updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-slate-200 dark:bg-slate-800">
                              <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                           </div>
                           <div className="space-y-0.5">
                              <Label className="text-base">Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive updates about your loan applications
                              </p>
                           </div>
                        </div>
                        <Switch
                          checked={formData.notifications}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                          className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-blue-600 dark:to-blue-500 hover:from-emerald-700 hover:to-emerald-600 dark:hover:from-blue-700 dark:hover:to-blue-600 text-white shadow-lg shadow-emerald-500/20 dark:shadow-blue-500/20 border-0 h-11 px-8">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </SpotlightCard>
               </TabsContent>
            </div>

          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Icons for Theme Buttons
function SunIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M7.49999 0.833344C7.91421 0.833344 8.24999 1.16913 8.24999 1.58334V2.33334C8.24999 2.74756 7.91421 3.08334 7.49999 3.08334C7.08578 3.08334 6.74999 2.74756 6.74999 2.33334V1.58334C6.74999 1.16913 7.08578 0.833344 7.49999 0.833344ZM3.54166 2.04168C3.83455 1.74878 4.30942 1.74878 4.60232 2.04168L5.13264 2.57201C5.42554 2.8649 5.42554 3.33977 5.13264 3.63267C4.83975 3.92556 4.36488 3.92556 4.07198 3.63267L3.54166 3.10234C3.24876 2.80945 3.24876 2.33457 3.54166 2.04168ZM1.58333 6.75001C1.16912 6.75001 0.833328 7.0858 0.833328 7.50001C0.833328 7.91422 1.16912 8.25001 1.58333 8.25001H2.33333C2.74754 8.25001 3.08333 7.91422 3.08333 7.50001C3.08333 7.0858 2.74754 6.75001 2.33333 6.75001H1.58333ZM2.04166 11.4583C1.74877 11.1654 1.74877 10.6906 2.04166 10.3977C2.33456 10.1048 2.80943 10.1048 3.10232 10.3977L3.63265 10.928C3.92554 11.2209 3.92554 11.6958 3.63265 11.9887C3.33976 12.2816 2.86489 12.2816 2.57199 11.9887L2.04166 11.4583ZM7.49999 11.9167C7.08578 11.9167 6.74999 12.2525 6.74999 12.6667V13.4167C6.74999 13.8309 7.08578 14.1667 7.49999 14.1667C7.91421 14.1667 8.24999 13.8309 8.24999 13.4167V12.6667C8.24999 12.2525 7.91421 11.9167 7.49999 11.9167ZM11.4583 12.9583C11.1654 13.2512 10.6906 13.2512 10.3977 12.9583C10.1048 12.6654 10.1048 12.1906 10.3977 11.8977L10.928 11.3673C11.2209 11.0744 11.6958 11.0744 11.9887 11.3673C12.2816 11.6602 12.2816 12.1351 11.9887 12.428L11.4583 12.9583ZM13.4167 8.25001C13.8309 8.25001 14.1667 7.91422 14.1667 7.50001C14.1667 7.0858 13.8309 6.75001 13.4167 6.75001H12.6667C12.2525 6.75001 11.9167 7.0858 11.9167 7.50001C11.9167 7.91422 12.2525 8.25001 12.6667 8.25001H13.4167ZM11.9887 3.63267C12.2816 3.92556 12.2816 4.40044 11.9887 4.69333C11.6958 4.98622 11.2209 4.98622 10.928 4.69333L10.3977 4.163C10.1048 3.87011 10.1048 3.39524 10.3977 3.10234C10.6906 2.80945 11.1654 2.80945 11.4583 3.10234L11.9887 3.63267ZM7.49999 4.16668C5.65905 4.16668 4.16666 5.65906 4.16666 7.50001C4.16666 9.34096 5.65905 10.8333 7.49999 10.8333C9.34094 10.8333 10.8333 9.34096 10.8333 7.50001C10.8333 5.65906 9.34094 4.16668 7.49999 4.16668Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}

function MoonIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M1.66667 7.50001C1.66667 4.27835 4.27835 1.66668 7.50001 1.66668C10.7217 1.66668 13.3333 4.27835 13.3333 7.50001C13.3333 10.7217 10.7217 13.3333 7.50001 13.3333C4.27835 13.3333 1.66667 10.7217 1.66667 7.50001ZM7.50001 2.50001C4.73859 2.50001 2.50001 4.73859 2.50001 7.50001C2.50001 10.2614 4.73859 12.5 7.50001 12.5C10.2614 12.5 12.5 10.2614 12.5 7.50001C12.5 4.73859 10.2614 2.50001 7.50001 2.50001ZM8.95834 5.20834C8.95834 6.35893 8.02559 7.29168 6.87501 7.29168C6.67156 7.29168 6.47457 7.26244 6.28725 7.20721C5.97607 8.52834 6.98223 9.79168 8.33334 9.79168C9.71405 9.79168 10.8333 8.6724 10.8333 7.29168C10.8333 5.94056 9.56999 4.9344 8.24887 5.24559C8.3041 5.43291 8.33334 5.6299 8.33334 5.83334C8.33334 5.62232 8.55297 5.4057 8.95834 5.20834Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}

function MonitorIcon() {
   return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M2.5 2.5H12.5V9.5H2.5V2.5ZM2.5 1.5C1.94772 1.5 1.5 1.94772 1.5 2.5V9.5C1.5 10.0523 1.94772 10.5 2.5 10.5H6V12.5H4.5C4.22386 12.5 4 12.7239 4 13C4 13.2761 4.22386 13.5 4.5 13.5H10.5C10.7761 13.5 11 13.2761 11 13C11 12.7239 10.7761 12.5 10.5 12.5H9V10.5H12.5C13.0523 10.5 13.5 10.0523 13.5 9.5V2.5C13.5 1.94772 13.0523 1.5 12.5 1.5H2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}
