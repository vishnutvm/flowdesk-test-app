"use client";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

const baseControl =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FieldWrapper({ label, htmlFor, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, required, className, ...props },
  ref
) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(baseControl, error && "border-red-400 focus:border-red-500 focus:ring-red-100", className)}
        {...props}
      />
    </FieldWrapper>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, required, className, children, ...props },
  ref
) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error || undefined}
        className={clsx(baseControl, error && "border-red-400", className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, required, className, ...props },
  ref
) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error || undefined}
        className={clsx(baseControl, "min-h-[90px] resize-y", error && "border-red-400", className)}
        {...props}
      />
    </FieldWrapper>
  );
});
