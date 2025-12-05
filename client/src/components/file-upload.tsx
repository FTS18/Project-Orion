import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, File, X, Check, Loader2, FileText, Image } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadedFile?: { name: string; size: number } | null;
  error?: string;
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024,
  onFileSelect,
  onFileRemove,
  isUploading = false,
  uploadProgress,
  uploadedFile,
  error,
  className,
  label = "Upload Salary Slip",
  description = "Drag and drop your salary slip or click to browse",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    const acceptedTypes = accept.split(",").map(t => t.trim().toLowerCase());
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const fileMime = file.type.toLowerCase();
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith(".")) {
        return type === fileExt;
      }
      return fileMime.includes(type.replace("*", ""));
    });

    if (!isValidType) {
      return `Please upload a valid file type: ${accept}`;
    }
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setLocalError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize, accept]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      onFileSelect(file);
    }
  };

  const displayError = error || localError;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="h-5 w-5 text-red-500" aria-hidden="true" />;
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      return <Image className="h-5 w-5 text-blue-500" aria-hidden="true" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" aria-hidden="true" />;
  };

  if (uploadedFile) {
    return (
      <Card 
        className={cn("p-4 animate-fade-in", className)}
        data-testid="file-upload-success"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getFileIcon(uploadedFile.name)}
              <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(uploadedFile.size)} - Uploaded successfully
            </p>
          </div>
          {onFileRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFileRemove}
              aria-label="Remove file"
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        className={cn(
          "relative flex flex-col items-center justify-center",
          "h-32 border-2 border-dashed rounded-lg cursor-pointer",
          "transition-all duration-200",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-60",
          displayError && "border-red-500/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-upload-dropzone"
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
          aria-label={label}
          data-testid="input-file-upload"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">
              Uploading... {uploadProgress !== undefined ? `${uploadProgress}%` : ""}
            </span>
            {uploadProgress !== undefined && (
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "h-12 w-12 rounded-lg flex items-center justify-center transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}>
              <Upload className={cn(
                "h-6 w-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        )}
      </label>

      {displayError && (
        <p className="text-sm text-red-500 flex items-center gap-1" role="alert">
          <X className="h-3 w-3" aria-hidden="true" />
          {displayError}
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Accepted formats: {accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")} 
        {" "}| Max size: {Math.round(maxSize / 1024 / 1024)}MB
      </p>
    </div>
  );
}
