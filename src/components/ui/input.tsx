import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="block space-y-1.5" htmlFor={inputId}>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-skyway focus:ring-2 focus:ring-teal-100",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {error ? (
          <span id={`${inputId}-error`} className="text-xs font-medium text-red-600">
            {error}
          </span>
        ) : null}
      </label>
    );
  }
);

Input.displayName = "Input";
