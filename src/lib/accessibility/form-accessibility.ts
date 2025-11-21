/**
 * Form Accessibility Utilities
 * Ensures forms are accessible with proper labels, errors, and validation
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { announceFormError } from './aria-announcer';
import { focusFirstError } from './focus-management';

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormAccessibilityOptions {
  announceErrors?: boolean;
  focusFirstError?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

/**
 * Hook for accessible form management
 */
export function useAccessibleForm<T extends Record<string, any>>(
  initialValues: T,
  validate: (values: T) => FormFieldError[],
  options: FormAccessibilityOptions = {}
) {
  const {
    announceErrors = true,
    focusFirstError: shouldFocusFirstError = true,
    validateOnBlur = true,
    validateOnChange = false,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormFieldError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  };

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    if (validateOnChange) {
      const validationErrors = validate({ ...values, [field]: value });
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));

    if (validateOnBlur) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => {
    return async (event: React.FormEvent) => {
      event.preventDefault();

      const validationErrors = validateForm();

      if (validationErrors.length > 0) {
        // Announce errors to screen readers
        if (announceErrors) {
          validationErrors.forEach(error => {
            announceFormError(error.field, error.message);
          });
        }

        // Focus first error
        if (shouldFocusFirstError && formRef.current) {
          focusFirstError(formRef.current);
        }

        return;
      }

      await onSubmit(values);
    };
  };

  const getFieldProps = (field: string) => {
    const fieldErrors = errors.filter(e => e.field === field);
    const hasError = fieldErrors.length > 0 && touched.has(field);
    const errorId = `${field}-error`;
    const descriptionId = `${field}-description`;

    return {
      id: field,
      name: field,
      value: values[field] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleChange(field, e.target.value),
      onBlur: () => handleBlur(field),
      'aria-invalid': hasError,
      'aria-describedby': hasError ? errorId : descriptionId,
      'aria-required': true,
    };
  };

  const getErrorProps = (field: string) => {
    const fieldErrors = errors.filter(e => e.field === field);
    const hasError = fieldErrors.length > 0 && touched.has(field);

    return {
      id: `${field}-error`,
      role: 'alert',
      'aria-live': 'polite' as const,
      hidden: !hasError,
      children: hasError ? fieldErrors[0].message : null,
    };
  };

  return {
    values,
    errors,
    touched,
    formRef,
    handleSubmit,
    getFieldProps,
    getErrorProps,
    setValues,
    validateForm,
  };
}

/**
 * Generate accessible field ID
 */
export function generateFieldId(name: string, prefix?: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
  return prefix ? `${prefix}-${cleanName}` : cleanName;
}

/**
 * Get ARIA attributes for form field
 */
export function getFieldAriaAttributes(
  fieldName: string,
  options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string[];
    labelledBy?: string[];
  } = {}
) {
  const { required = false, invalid = false, describedBy = [], labelledBy = [] } = options;

  const attributes: Record<string, any> = {};

  if (required) {
    attributes['aria-required'] = true;
  }

  if (invalid) {
    attributes['aria-invalid'] = true;
  }

  if (describedBy.length > 0) {
    attributes['aria-describedby'] = describedBy.join(' ');
  }

  if (labelledBy.length > 0) {
    attributes['aria-labelledby'] = labelledBy.join(' ');
  }

  return attributes;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): FormFieldError | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  return null;
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): FormFieldError | null {
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return null;
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): FormFieldError | null {
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }
  return null;
}

/**
 * Create accessible error message component props
 */
export function createErrorMessageProps(fieldName: string, error?: string) {
  return {
    id: `${fieldName}-error`,
    role: 'alert' as const,
    'aria-live': 'polite' as const,
    className: 'text-sm text-red-400 mt-1',
    children: error,
  };
}

/**
 * Create accessible label props
 */
/**
 * Get label props for a form field
 */
export function getLabelProps(fieldName: string, required: boolean = false) {
  return {
    htmlFor: fieldName,
    className: 'block text-sm font-medium text-white/90 mb-2',
    'data-required': required,
  };
}
