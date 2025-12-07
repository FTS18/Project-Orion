import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Shield, User, MapPin, Phone, Calendar, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCDocumentViewerProps {
  customerId: string;
  customerName: string;
  phone?: string;
  address?: string;
  city?: string;
  dob?: string;
  isVerified?: boolean;
  className?: string;
}

// Generate masked Aadhaar number based on customer ID
function generateAadhaarNumber(customerId: string): string {
  const hash = customerId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const last4 = Math.abs(hash % 10000).toString().padStart(4, '0');
  return `XXXX-XXXX-${last4}`;
}

// Generate PAN number based on customer name
function generatePANNumber(name: string): string {
  const firstTwo = name.substring(0, 2).toUpperCase();
  const last4 = Math.floor(1000 + Math.random() * 9000);
  return `${firstTwo}XPK${last4}D`;
}

export function KYCDocumentViewer({
  customerId,
  customerName,
  phone,
  address,
  city,
  dob,
  isVerified = false,
  className,
}: KYCDocumentViewerProps) {
  const aadhaarNumber = generateAadhaarNumber(customerId);
  const panNumber = generatePANNumber(customerName);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Aadhaar Card */}
      <Card className="overflow-hidden border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
        <CardHeader className="pb-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold">Aadhaar Card</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              Government of India
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            {/* Photo placeholder */}
            <div className="w-20 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="font-semibold text-foreground">{customerName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">DOB</p>
                  <p className="text-sm font-medium">{dob || "XX/XX/XXXX"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
                  <p className="text-sm font-medium">-</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p>
                <p className="text-sm">{address || "Address on file"}, {city || ""}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Aadhaar Number</p>
              <p className="font-mono text-lg font-bold tracking-wider">{aadhaarNumber}</p>
            </div>
            {isVerified && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PAN Card */}
      <Card className="overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold">PAN Card</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              Income Tax Dept.
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            {/* Photo placeholder */}
            <div className="w-20 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="font-semibold text-foreground">{customerName}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Father's Name</p>
                <p className="text-sm font-medium">-</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</p>
                <p className="text-sm font-medium">{dob || "XX/XX/XXXX"}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Permanent Account Number</p>
              <p className="font-mono text-lg font-bold tracking-wider">{panNumber}</p>
            </div>
            {isVerified && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status Summary */}
      <Card className={cn(
        "border-2",
        isVerified 
          ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" 
          : "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20"
      )}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              isVerified ? "bg-green-500/20" : "bg-yellow-500/20"
            )}>
              <FileText className={cn(
                "h-5 w-5",
                isVerified ? "text-green-600" : "text-yellow-600"
              )} />
            </div>
            <div>
              <p className="font-semibold">
                {isVerified ? "KYC Documents Verified" : "KYC Verification Pending"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isVerified 
                  ? "All identity documents have been successfully verified"
                  : "Identity verification in progress..."
                }
              </p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{phone || "Phone on file"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{city || "City on file"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>DOB: {dob || "On file"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Customer: {customerId}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
