import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Search, Filter, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MOCK_LOANS, fetchLoans, type LoanProduct } from "@/data/mock-loans";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { isFeatureEnabled } from "@/config/features.config";

export default function LoanMarketplace() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");

  const [loans, setLoans] = useState<LoanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadData = async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      // Pass filters to simulation? 
      // Simplified: We fetch chunk, then filter client side for smooth UX on small dataset
      // But for "lazy loading" demo, we append data.
      const { data, hasMore: moreAvailable } = await fetchLoans(pageNum, 12);
      
      setLoans(prev => isInitial ? data : [...prev, ...data]);
      setHasMore(moreAvailable);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadData(1, true);
  }, []);

  // Extract unique banks and categories for filters
  const banks = useMemo(() => Array.from(new Set(MOCK_LOANS.map(l => l.bankName))).sort(), []);
  const categories = useMemo(() => Array.from(new Set(MOCK_LOANS.map(l => l.category))).sort(), []);

  // Filter loans
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesSearch = 
        loan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.bankName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || loan.category === categoryFilter;
      const matchesBank = bankFilter === "all" || loan.bankName === bankFilter;

      return matchesSearch && matchesCategory && matchesBank;
    });
  }, [loans, searchQuery, categoryFilter, bankFilter]);


  // Load more on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading && filteredLoans.length > 0) {
           loadData(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isLoading, page, filteredLoans.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
      {isFeatureEnabled('particlesBackground') && (
        <ParticlesBackground 
          className="opacity-30 pointer-events-none" 
          particleCount={30}
          speed={0.2}
          connectDistance={100}
        />
      )}
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Loan Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare and choose from the best loan offers across India's top banks.
          </p>
        </motion.div>

        {/* Filters - Sticky */}
        <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 mb-8 transition-all duration-200 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search loans, banks..." 
                className="pl-10 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat} Loan</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Banks</SelectItem>
                {banks.map(bank => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {isLoading && loans.length === 0 ? (
             // Skeleton array - explicitly styled to be visible
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[520px] rounded-xl border border-border/40 bg-card/40 p-6 space-y-6 animate-pulse">
                    <div className="flex justify-between items-start">
                       <Skeleton className="h-16 w-16 rounded-xl bg-muted-foreground/20" />
                       <div className="space-y-2 flex flex-col items-end">
                          <Skeleton className="h-5 w-24 bg-muted-foreground/20" />
                          <Skeleton className="h-4 w-16 bg-muted-foreground/10" />
                       </div>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-3/4 bg-muted-foreground/20" />
                        <Skeleton className="h-5 w-1/2 bg-muted-foreground/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                      <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                      <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                      <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                    </div>
                    <div className="space-y-3 mt-6 flex-1">
                      <Skeleton className="h-4 w-full bg-muted-foreground/10" />
                      <Skeleton className="h-4 w-full bg-muted-foreground/10" />
                      <Skeleton className="h-4 w-5/6 bg-muted-foreground/10" />
                    </div>
                    <Skeleton className="h-12 w-full mt-auto rounded-lg bg-primary/20" />
                </div>
             ))
          ) : filteredLoans.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-24">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No loans found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setBankFilter("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              {filteredLoans.map((loan, index) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  layout
                >
                  <Card className="h-full flex flex-col hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-xl bg-white p-2 flex items-center justify-center shadow-sm border">
                          <img src={loan.logo} alt={loan.bankName} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {loan.category}
                          </Badge>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 dark:border-green-900 text-xs">
                            {95 + (index % 5)}% Match
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-1" title={loan.productName}>{loan.productName}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {loan.bankName}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Interest</p>
                          <p className="font-bold text-primary text-lg">{loan.interestRate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Max Amount</p>
                          <p className="font-semibold text-foreground">
                            {typeof loan.maxAmount === 'number' 
                              ? `₹${(loan.maxAmount / 100000).toFixed(1)} L`
                              : loan.maxAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Tenure</p>
                          <p className="font-medium text-sm text-foreground">{loan.tenureRange}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Proc. Fee</p>
                          <p className="font-medium text-sm text-foreground">{loan.processingFee}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {loan.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="leading-tight line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button 
                        className="w-full gap-2 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all" 
                        onClick={() => navigate("/agentic", { 
                          state: { 
                            selectedLoan: {
                              id: loan.id,
                              name: loan.productName,
                              bank: loan.bankName,
                              amount: loan.maxAmount,
                              type: loan.loanType
                            } 
                          } 
                        })}
                      >
                        Apply via AI Agent <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {isFetchingMore && (
                 <>
                  {Array.from({ length: 3 }).map((_, i) => (
                      <div key={`more-${i}`} className="h-[520px] rounded-xl border border-border/40 bg-card/40 p-6 space-y-6 animate-pulse hidden md:block">
                          <div className="flex justify-between items-start">
                             <Skeleton className="h-16 w-16 rounded-xl bg-muted-foreground/20" />
                             <div className="space-y-2 flex flex-col items-end">
                                <Skeleton className="h-5 w-24 bg-muted-foreground/20" />
                                <Skeleton className="h-4 w-16 bg-muted-foreground/10" />
                             </div>
                          </div>
                          <div className="space-y-3">
                              <Skeleton className="h-8 w-3/4 bg-muted-foreground/20" />
                              <Skeleton className="h-5 w-1/2 bg-muted-foreground/10" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                            <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                            <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                            <Skeleton className="h-16 w-full rounded-lg bg-muted-foreground/10" />
                          </div>
                          <div className="space-y-3 mt-6 flex-1">
                            <Skeleton className="h-4 w-full bg-muted-foreground/10" />
                            </div>
                          <Skeleton className="h-12 w-full mt-auto rounded-lg bg-primary/20" />
                      </div>
                   ))}
                   <div className="col-span-full h-20 flex items-center justify-center p-4 md:hidden">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                 </>
              )}
              
              {/* Infinite scroll trigger */}
              {!isLoading && hasMore && !isFetchingMore && (
                 <div ref={observerTarget} className="col-span-full h-10 w-full" />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
