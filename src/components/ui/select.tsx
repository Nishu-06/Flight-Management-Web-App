import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <label className="block space-y-1.5" htmlFor={selectId}>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink shadow-sm outline-none transition focus:border-skyway focus:ring-2 focus:ring-teal-100",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
      </label>
    );
  }
);

Select.displayName = "Select";
