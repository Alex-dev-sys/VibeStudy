/**
 * Accessible Form Components
 * Provides accessible form inputs with proper labels and error handling
 */

'use client';

import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';

/* ============================================
   FORM FIELD
   ============================================ */

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function FormField({ children, error, className }: FormFieldProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      {children}
      {error && (
        <p className="text-sm text-red-400" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================
   LABEL
   ============================================ */

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={clsx(
          'block text-sm font-medium text-white/90 mb-2',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

/* ============================================
   INPUT
   ============================================ */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, helperText, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <FormField error={error}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        
        {helperText && (
          <p id={helperId} className="text-sm text-white/60 mb-2">
            {helperText}
          </p>
        )}

        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-white placeholder:text-white/40',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={clsx(
            error && errorId,
            helperText && helperId
          )}
          aria-required={required}
          {...props}
        />
      </FormField>
    );
  }
);

Input.displayName = 'Input';

/* ============================================
   TEXTAREA
   ============================================ */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, helperText, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <FormField error={error}>
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        
        {helperText && (
          <p id={helperId} className="text-sm text-white/60 mb-2">
            {helperText}
          </p>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-white placeholder:text-white/40',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-vertical min-h-[100px]',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={clsx(
            error && errorId,
            helperText && helperId
          )}
          aria-required={required}
          {...props}
        />
      </FormField>
    );
  }
);

Textarea.displayName = 'Textarea';

/* ============================================
   SELECT
   ============================================ */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, label, helperText, required, options, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <FormField error={error}>
        {label && (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        )}
        
        {helperText && (
          <p id={helperId} className="text-sm text-white/60 mb-2">
            {helperText}
          </p>
        )}

        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={clsx(
            error && errorId,
            helperText && helperId
          )}
          aria-required={required}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

Select.displayName = 'Select';

/* ============================================
   CHECKBOX
   ============================================ */

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, className, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const helperId = `${checkboxId}-helper`;

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={clsx(
            'mt-1 w-5 h-5 rounded',
            'bg-white/5 border-2 border-white/20',
            'text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0c061c]',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'cursor-pointer',
            className
          )}
          aria-describedby={helperText ? helperId : undefined}
          {...props}
        />
        <div className="flex-1">
          <Label htmlFor={checkboxId} className="cursor-pointer mb-0">
            {label}
          </Label>
          {helperText && (
            <p id={helperId} className="text-sm text-white/60 mt-1">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/* ============================================
   RADIO GROUP
   ============================================ */

interface RadioOption {
  value: string;
  label: string;
  helperText?: string;
}

interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  required,
}: RadioGroupProps) {
  const groupId = useId();

  return (
    <FormField error={error}>
      <fieldset>
        <legend className="block text-sm font-medium text-white/90 mb-3">
          {label}
          {required && (
            <span className="text-red-400 ml-1" aria-label="required">
              *
            </span>
          )}
        </legend>

        <div className="space-y-3" role="radiogroup" aria-labelledby={groupId}>
          {options.map((option, index) => {
            const optionId = `${groupId}-${index}`;
            const helperId = `${optionId}-helper`;

            return (
              <div key={option.value} className="flex items-start gap-3">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className={clsx(
                    'mt-1 w-5 h-5 rounded-full',
                    'bg-white/5 border-2 border-white/20',
                    'text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0c061c]',
                    'transition-all duration-200',
                    'cursor-pointer'
                  )}
                  aria-describedby={option.helperText ? helperId : undefined}
                />
                <div className="flex-1">
                  <Label htmlFor={optionId} className="cursor-pointer mb-0">
                    {option.label}
                  </Label>
                  {option.helperText && (
                    <p id={helperId} className="text-sm text-white/60 mt-1">
                      {option.helperText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
    </FormField>
  );
}
