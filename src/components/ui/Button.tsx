import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] select-none',
          {
            'btn-primary-glass': variant === 'primary',
            'glass-pill text-textPrimary': variant === 'secondary',
            'border border-white/10 bg-transparent text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5': variant === 'outline',
            'text-white/50 hover:text-textPrimary hover:bg-white/5': variant === 'ghost',
            'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/30': variant === 'danger',
            'h-8 px-3.5 text-xs': size === 'sm',
            'h-9 px-5 text-sm': size === 'md',
            'h-11 px-6 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
