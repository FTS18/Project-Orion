import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { MOCK_LOANS, shuffleLoans, type LoanProduct } from "@/data/mock-loans";

// Re-export LoanProduct type for other components
export type { LoanProduct };

export function FeaturedLoans() {
  const [, navigate] = useLocation();
  
  // Use client-side mock data - no backend needed!
  // Pick 3 random distinct categories for maximum variety
  const featuredLoans = useMemo(() => {
    // Get all unique categories
    const categories = Array.from(new Set(MOCK_LOANS.map(l => l.category)));
    
    // Shuffle categories
    const shuffledCats = [...categories].sort(() => 0.5 - Math.random());
    
    // Pick top 3 categories
    const selectedCats = shuffledCats.slice(0, 3);
    
    // For each selected category, pick a random loan
    return selectedCats.map(cat => {
      const loansInCat = MOCK_LOANS.filter(l => l.category === cat);
      return loansInCat[Math.floor(Math.random() * loansInCat.length)];
    });
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Loan Offers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked offers from India's top banks, tailored for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredLoans.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-primary/10 bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <img src={loan.logo} alt={loan.bankName} className="h-8 object-contain" />
                    <Badge variant="outline" className="bg-primary/5">{loan.loanType}</Badge>
                  </div>
                  <CardTitle className="text-xl">{loan.productName}</CardTitle>
                  <CardDescription>{loan.bankName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold text-primary">{loan.interestRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Amount</p>
                      <p className="font-semibold">
                        {typeof loan.maxAmount === 'number' 
                          ? `₹${(loan.maxAmount / 100000).toFixed(1)} Lakhs`
                          : loan.maxAmount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    {loan.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
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
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate("/loans")} className="rounded-full px-8">
            View All Loan Offers
          </Button>
        </div>
      </div>
    </section>
  );
}
