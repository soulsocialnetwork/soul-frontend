import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
          {
            'btn-primary-glass': variant === 'primary',
            'glass-pill text-textPrimary': variant === 'secondary',
            'border border-white/12 bg-transparent text-white hover:bg-white/6': variant === 'outline',
            'text-textSecondary hover:text-textPrimary hover:bg-white/5': variant === 'ghost',
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-7 text-sm': size === 'md',
            'h-14 px-8 text-sm': size === 'lg',
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
