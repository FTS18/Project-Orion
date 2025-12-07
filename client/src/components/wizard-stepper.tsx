import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  onStepClick?: (stepId: number) => void;
}

export function WizardStepper({ steps, currentStep, className, onStepClick }: WizardStepperProps) {
  return (
    <nav 
      className={cn("w-full", className)}
      aria-label="Application progress"
    >
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <li 
              key={step.id}
              className={cn(
                "flex items-center flex-1",
                index < steps.length - 1 && "after:content-[''] after:flex-1 after:h-0.5 after:mx-2 md:after:mx-4",
                isCompleted && "after:bg-primary",
                isCurrent && "after:bg-gradient-to-r after:from-primary after:to-border",
                isUpcoming && "after:bg-border"
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onStepClick && (isCompleted || isCurrent)) {
                      onStepClick(step.id);
                    }
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 cursor-default",
                    isUpcoming && "bg-muted text-muted-foreground border-2 border-border cursor-not-allowed"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  data-testid={`step-indicator-${step.id}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </button>
                <div className="text-center">
                  <span 
                    className={cn(
                      "text-xs font-medium block",
                      (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-[10px] text-muted-foreground hidden md:block">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface WizardBreadcrumbsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function WizardBreadcrumbs({ steps, currentStep, className }: WizardBreadcrumbsProps) {
  return (
    <nav 
      className={cn("flex items-center gap-2 text-sm", className)}
      aria-label="Breadcrumb"
    >
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-muted-foreground">/</span>
            )}
            <span
              className={cn(
                "transition-colors",
                isCurrent && "text-primary font-medium",
                isCompleted && "text-foreground",
                !isCurrent && !isCompleted && "text-muted-foreground"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  className?: string;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isNextDisabled = false,
  isSubmitting = false,
  previousLabel = "Back",
  nextLabel = "Continue",
  submitLabel = "Submit Application",
  className,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div 
      className={cn(
        "flex items-center justify-between pt-6 border-t",
        className
      )}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        className={cn(
          "text-sm font-medium transition-colors",
          isFirstStep 
            ? "text-muted-foreground cursor-not-allowed" 
            : "text-foreground hover:text-primary"
        )}
        data-testid="button-wizard-previous"
      >
        {previousLabel}
      </button>

      <button
        type="button"
        onClick={isLastStep && onSubmit ? onSubmit : onNext}
        disabled={isNextDisabled || isSubmitting}
        className={cn(
          "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        data-testid={isLastStep ? "button-wizard-submit" : "button-wizard-next"}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processing...
          </span>
        ) : isLastStep ? (
          submitLabel
        ) : (
          nextLabel
        )}
      </button>
    </div>
  );
}
