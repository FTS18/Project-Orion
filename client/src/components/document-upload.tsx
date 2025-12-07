/**
 * Document Upload Component
 * Mock document upload for salary slip and Aadhaar
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Wallet,
  Loader2,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  accepted: string[];
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  status: 'uploading' | 'processing' | 'verified' | 'failed';
  progress: number;
  extractedData?: Record<string, string>;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    description: 'For identity verification',
    icon: <CreditCard className="w-5 h-5" />,
    required: true,
    accepted: ['image/png', 'image/jpeg', 'application/pdf']
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'For tax verification',
    icon: <FileText className="w-5 h-5" />,
    required: true,
    accepted: ['image/png', 'image/jpeg', 'application/pdf']
  },
  {
    id: 'salary',
    name: 'Salary Slip',
    description: 'Last 3 months salary proof',
    icon: <Wallet className="w-5 h-5" />,
    required: true,
    accepted: ['image/png', 'image/jpeg', 'application/pdf']
  }
];

interface DocumentUploadProps {
  onComplete?: (documents: UploadedDocument[]) => void;
  customerName?: string;
}

export function DocumentUpload({ onComplete, customerName = "Customer" }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Record<string, UploadedDocument>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const simulateUpload = (docType: DocumentType, fileName: string) => {
    const docId = `${docType.id}-${Date.now()}`;
    
    // Start upload
    setDocuments(prev => ({
      ...prev,
      [docType.id]: {
        id: docId,
        name: fileName,
        type: docType.id,
        status: 'uploading',
        progress: 0
      }
    }));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Switch to processing
        setDocuments(prev => ({
          ...prev,
          [docType.id]: { ...prev[docType.id], status: 'processing', progress: 100 }
        }));
        
        // Simulate OCR/verification
        setTimeout(() => {
          setDocuments(prev => ({
            ...prev,
            [docType.id]: {
              ...prev[docType.id],
              status: 'verified',
              extractedData: getMockExtractedData(docType.id)
            }
          }));
        }, 1500);
      } else {
        setDocuments(prev => ({
          ...prev,
          [docType.id]: { ...prev[docType.id], progress }
        }));
      }
    }, 200);
  };

  const getMockExtractedData = (docType: string): Record<string, string> => {
    switch (docType) {
      case 'aadhaar':
        return {
          'Name': customerName,
          'Aadhaar Number': 'XXXX-XXXX-4670',
          'Address': 'Verified ✓'
        };
      case 'pan':
        return {
          'Name': customerName.toUpperCase(),
          'PAN': 'ANXPK9642D',
          'Status': 'Active ✓'
        };
      case 'salary':
        return {
          'Employer': 'Verified Company',
          'Net Salary': '₹65,000',
          'Month': 'November 2024'
        };
      default:
        return {};
    }
  };

  const handleFileSelect = (docType: DocumentType) => {
    // Simulate file selection (in real app, would use file input)
    const mockFileName = `${docType.name.replace(' ', '_')}.pdf`;
    simulateUpload(docType, mockFileName);
  };

  const handleDrop = (docType: DocumentType, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      simulateUpload(docType, file.name);
    }
  };

  const allVerified = DOCUMENT_TYPES.filter(d => d.required)
    .every(d => documents[d.id]?.status === 'verified');

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Document Upload</h3>
        </div>
        {allVerified && (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Verified
          </Badge>
        )}
      </div>

      <div className="grid gap-3">
        {DOCUMENT_TYPES.map(docType => {
          const doc = documents[docType.id];
          const isVerified = doc?.status === 'verified';
          const isUploading = doc?.status === 'uploading' || doc?.status === 'processing';
          
          return (
            <motion.div
              key={docType.id}
              layout
              className={cn(
                "border rounded-lg p-4 transition-all",
                dragOver === docType.id && "border-primary bg-primary/5",
                isVerified && "border-green-500/50 bg-green-500/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(docType.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(docType, e)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isVerified ? "bg-green-500/10 text-green-500" : "bg-muted"
                  )}>
                    {isVerified ? <CheckCircle2 className="w-5 h-5" /> : docType.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{docType.name}</span>
                      {docType.required && (
                        <Badge variant="outline" className="text-[10px] py-0">Required</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{docType.description}</p>
                  </div>
                </div>

                {!doc && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFileSelect(docType)}
                    className="gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Upload
                  </Button>
                )}

                {isVerified && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    Verified
                  </Badge>
                )}
              </div>

              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {doc?.status === 'processing' ? 'Verifying document...' : 'Uploading...'}
                      </span>
                    </div>
                    <Progress value={doc?.progress || 0} className="h-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extracted Data Preview */}
              <AnimatePresence>
                {isVerified && doc?.extractedData && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t"
                  >
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Eye className="w-3 h-3" />
                      Extracted Information
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(doc.extractedData).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="ml-1 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {allVerified && (
        <Button 
          className="w-full gap-2 bg-green-600 hover:bg-green-700"
          onClick={() => onComplete?.(Object.values(documents))}
        >
          <CheckCircle2 className="w-4 h-4" />
          All Documents Verified - Continue
        </Button>
      )}
    </Card>
  );
}
