/**
 * Loan Comparison Component
 * Side-by-side comparison of selected loan products
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Scale, Check, X, TrendingUp, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoanProduct } from "@/data/mock-loans";

interface LoanComparisonProps {
  products: LoanProduct[];
  onSelect?: (product: LoanProduct) => void;
}

export function LoanComparison({ products, onSelect }: LoanComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<LoanProduct[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleProduct = (product: LoanProduct) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else if (selectedProducts.length < 3) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const isSelected = (product: LoanProduct) => 
    selectedProducts.some(p => p.id === product.id);

  // Parse interest rate to get min value for comparison
  const parseRate = (rate: string): number => {
    const match = rate.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 99;
  };

  const getLowestRate = () => {
    if (selectedProducts.length === 0) return null;
    return selectedProducts.reduce((min, p) => 
      parseRate(p.interestRate) < parseRate(min.interestRate) ? p : min
    );
  };

  const calculateEMI = (principal: number, rate: number, tenureMonths: number): number => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;
    return Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
           (Math.pow(1 + monthlyRate, tenureMonths) - 1));
  };

  return (
    <div className="space-y-4">
      {/* Selection Cards */}
      <div className="flex gap-2 flex-wrap">
        {products.slice(0, 6).map(product => (
          <Badge
            key={product.id}
            variant={isSelected(product) ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all py-2 px-3",
              isSelected(product) && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleProduct(product)}
          >
            {isSelected(product) && <Check className="w-3 h-3 mr-1" />}
            {product.productName}
          </Badge>
        ))}
      </div>

      {/* Compare Button */}
      {selectedProducts.length >= 2 && (
        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 w-full">
              <Scale className="w-4 h-4" />
              Compare {selectedProducts.length} Products
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Loan Comparison
              </DialogTitle>
            </DialogHeader>
            
            {/* Comparison Table */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }}>
              {selectedProducts.map((product, index) => {
                const lowestRate = getLowestRate();
                const isLowest = lowestRate?.id === product.id;
                const rate = parseRate(product.interestRate);
                const emi = calculateEMI(500000, rate, 24);
                
                return (
                  <Card key={product.id} className={cn(
                    "p-4 relative",
                    isLowest && "ring-2 ring-green-500"
                  )}>
                    {isLowest && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Best Rate
                      </Badge>
                    )}
                    
                    <div className="space-y-4">
                      {/* Header */}
                      <div>
                        <h3 className="font-semibold text-sm">{product.productName}</h3>
                        <p className="text-xs text-muted-foreground">{product.bankName}</p>
                      </div>
                      
                      {/* Comparison Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate</span>
                          <span className={cn("font-medium", isLowest && "text-green-500")}>
                            {product.interestRate}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Amount</span>
                          <span className="font-medium">
                            {typeof product.maxAmount === 'number' 
                              ? `₹${(product.maxAmount / 100000).toFixed(1)}L` 
                              : product.maxAmount}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tenure</span>
                          <span className="font-medium">{product.tenureRange}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processing Fee</span>
                          <span className="font-medium">{product.processingFee}</span>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Calculator className="w-3 h-3" />
                            <span className="text-xs">EMI for ₹5L (24 mo)</span>
                          </div>
                          <span className="font-bold text-lg">₹{emi.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Features</span>
                        <ul className="space-y-1">
                          {product.features.slice(0, 2).map((f, i) => (
                            <li key={i} className="flex items-center gap-1 text-xs">
                              <Check className="w-3 h-3 text-green-500" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Select Button */}
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          onSelect?.(product);
                          setShowComparison(false);
                        }}
                      >
                        Select This Offer
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
