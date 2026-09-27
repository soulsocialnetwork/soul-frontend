import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-bold text-textPrimary ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={isPassword && passwordVisible ? 'text' : type}
            className={cn(
              'glass-input flex h-12 w-full rounded-2xl px-4 py-2 text-sm text-textPrimary placeholder:text-textSecondary/40 disabled:cursor-not-allowed disabled:opacity-50',
              isPassword && 'pr-12',
              error && 'border-red-500/40',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              disabled={props.disabled}
              aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible(visible => !visible)}
              className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-xl text-textSecondary hover:text-textPrimary focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 disabled:opacity-50"
            >
              {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400/80 ml-1 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
