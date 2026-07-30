import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-bold text-textPrimary ml-1">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            className={cn(
              'glass-input flex h-12 w-full appearance-none rounded-2xl px-4 pr-10 text-sm text-textPrimary disabled:cursor-not-allowed disabled:opacity-50',
              '[&_option]:bg-[#0c0c10] [&_option]:text-textPrimary',
              error && 'border-red-500/40',
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400/80 ml-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
