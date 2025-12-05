import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';

interface FormValidationError {
  [key: string]: string | undefined;
}

export const useFormValidation = (initialValues: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormValidationError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'customerId':
        if (!value) return 'Customer ID is required';
        if (!/^CUST\d{3}$/.test(value)) return 'Invalid format. Use CUST001-CUST010';
        return null;

      case 'loanAmount':
        if (!value) return 'Loan amount is required';
        if (isNaN(value) || value <= 0) return 'Amount must be greater than 0';
        if (value > 5000000) return 'Amount cannot exceed ₹50 lakhs';
        return null;

      case 'tenure':
        if (!value) return 'Tenure is required';
        if (isNaN(value) || value < 6 || value > 84) return 'Tenure must be 6-84 months';
        return null;

      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;

      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isFormValid = () => {
    return Object.keys(values).every(key => !errors[key]);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isFormValid,
    setValues
  };
};

export const FormField = ({
  label,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => {
  const hasError = touched && error;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          hasError
            ? 'border-destructive focus:ring-destructive'
            : 'border-input focus:ring-primary'
        }`}
      />
      {hasError && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
