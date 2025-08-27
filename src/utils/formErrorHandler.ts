import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

export interface FormErrors {
  [field: string]: string | string[];
}

export interface ValidationResult {
  success: boolean;
  errors?: FormErrors;
  data?: any;
}

class FormErrorHandler {
  // Parse Zod validation errors
  parseZodError(error: z.ZodError): FormErrors {
    const errors: FormErrors = {};
    
    error.issues.forEach((err: z.ZodIssue) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      
      if (Array.isArray(errors[path])) {
        (errors[path] as string[]).push(err.message);
      } else {
        errors[path] = [errors[path] as string, err.message];
      }
    });
    
    // Flatten single error arrays
    Object.keys(errors).forEach((key) => {
      if (Array.isArray(errors[key]) && (errors[key] as string[]).length === 1) {
        errors[key] = (errors[key] as string[])[0];
      }
    });
    
    return errors;
  }

  // Parse API validation errors (422 responses)
  parseApiValidationError(error: any): FormErrors {
    const errors: FormErrors = {};
    
    // Handle different API error formats
    if (error.details) {
      // Format 1: { details: { field1: ['error1', 'error2'], field2: 'error3' } }
      if (typeof error.details === 'object') {
        Object.entries(error.details).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errors[field] = messages.length === 1 ? messages[0] : messages;
          } else {
            errors[field] = messages as string;
          }
        });
      }
    } else if (error.errors) {
      // Format 2: { errors: [{ field: 'field1', message: 'error1' }] }
      if (Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          if (err.field && err.message) {
            if (!errors[err.field]) {
              errors[err.field] = [];
            }
            
            if (Array.isArray(errors[err.field])) {
              (errors[err.field] as string[]).push(err.message);
            } else {
              errors[err.field] = [errors[err.field] as string, err.message];
            }
          }
        });
        
        // Flatten single error arrays
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key]) && (errors[key] as string[]).length === 1) {
            errors[key] = (errors[key] as string[])[0];
          }
        });
      }
    } else if (error.message) {
      // Format 3: Single error message
      errors._form = error.message;
    }
    
    return errors;
  }

  // Display form errors in toast
  showFormErrors(errors: FormErrors, title: string = 'Validation Error') {
    const errorMessages: string[] = [];
    
    Object.entries(errors).forEach(([field, messages]) => {
      if (field === '_form') {
        // General form error
        if (Array.isArray(messages)) {
          errorMessages.push(...messages);
        } else {
          errorMessages.push(messages);
        }
      } else {
        // Field-specific error
        const fieldName = this.formatFieldName(field);
        if (Array.isArray(messages)) {
          messages.forEach(msg => {
            errorMessages.push(`${fieldName}: ${msg}`);
          });
        } else {
          errorMessages.push(`${fieldName}: ${messages}`);
        }
      }
    });
    
    if (errorMessages.length === 1) {
      toast({
        title,
        description: errorMessages[0],
        variant: 'destructive'
      });
    } else if (errorMessages.length > 1) {
      // For multiple messages, join them with line breaks
      toast({
        title,
        description: errorMessages.join('\n'),
        variant: 'destructive'
      });
    }
  }

  // Format field name for display
  private formatFieldName(field: string): string {
    // Convert camelCase or snake_case to Title Case
    return field
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\./g, ' > ') // Replace dots with arrows for nested fields
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Validate form data with Zod schema
  validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = this.parseZodError(error);
        return {
          success: false,
          errors
        };
      }
      
      return {
        success: false,
        errors: {
          _form: 'An unexpected error occurred during validation'
        }
      };
    }
  }

  // Set errors on form fields (for react-hook-form)
  setFieldErrors(
    errors: FormErrors,
    setError: (field: string, error: { type: string; message: string }) => void
  ) {
    Object.entries(errors).forEach(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : messages;
      setError(field, {
        type: 'manual',
        message
      });
    });
  }

  // Get field error message
  getFieldError(errors: FormErrors, field: string): string | undefined {
    const error = errors[field];
    if (!error) return undefined;
    return Array.isArray(error) ? error[0] : error;
  }

  // Check if field has error
  hasFieldError(errors: FormErrors, field: string): boolean {
    return !!errors[field];
  }

  // Clear field error
  clearFieldError(errors: FormErrors, field: string): FormErrors {
    const newErrors = { ...errors };
    delete newErrors[field];
    return newErrors;
  }

  // Clear all errors
  clearAllErrors(): FormErrors {
    return {};
  }

  // Merge errors from multiple sources
  mergeErrors(...errorObjects: FormErrors[]): FormErrors {
    const merged: FormErrors = {};
    
    errorObjects.forEach((errors) => {
      Object.entries(errors).forEach(([field, messages]) => {
        if (!merged[field]) {
          merged[field] = messages;
        } else {
          // Merge messages
          const existing = Array.isArray(merged[field]) 
            ? merged[field] as string[] 
            : [merged[field] as string];
          const newMessages = Array.isArray(messages) 
            ? messages 
            : [messages];
          
          merged[field] = [...existing, ...newMessages];
        }
      });
    });
    
    return merged;
  }

  // Create a summary of all errors
  getErrorSummary(errors: FormErrors): string {
    const errorCount = Object.keys(errors).length;
    
    if (errorCount === 0) {
      return '';
    } else if (errorCount === 1) {
      const [field, message] = Object.entries(errors)[0];
      if (field === '_form') {
        return Array.isArray(message) ? message[0] : message;
      }
      return `${this.formatFieldName(field)}: ${Array.isArray(message) ? message[0] : message}`;
    } else {
      return `Please fix ${errorCount} errors in the form`;
    }
  }
}

// Create singleton instance
export const formErrorHandler = new FormErrorHandler();

// Export convenience functions
export const parseZodError = (error: z.ZodError) => 
  formErrorHandler.parseZodError(error);

export const parseApiValidationError = (error: any) => 
  formErrorHandler.parseApiValidationError(error);

export const showFormErrors = (errors: FormErrors, title?: string) => 
  formErrorHandler.showFormErrors(errors, title);

export const validateWithSchema = <T>(schema: z.ZodSchema<T>, data: unknown) => 
  formErrorHandler.validateWithSchema(schema, data);

export const getFieldError = (errors: FormErrors, field: string) => 
  formErrorHandler.getFieldError(errors, field);

export const hasFieldError = (errors: FormErrors, field: string) => 
  formErrorHandler.hasFieldError(errors, field);

export const getErrorSummary = (errors: FormErrors) => 
  formErrorHandler.getErrorSummary(errors);

export default formErrorHandler;