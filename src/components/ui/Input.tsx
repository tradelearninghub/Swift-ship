import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && <span className="text-status-danger ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-10 px-3.5 py-2 text-sm bg-surface-base border border-border-default rounded-lg placeholder:text-text-muted transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:opacity-50 disabled:bg-slate-50",
            error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-status-danger mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
