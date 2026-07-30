import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-bold text-textPrimary ml-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'glass-input flex h-12 w-full rounded-2xl px-4 py-2 text-sm text-textPrimary placeholder:text-textSecondary/40 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/40',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400/80 ml-1 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
