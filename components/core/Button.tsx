'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    const variants = {
      primary: 'bg-delta text-white hover:bg-delta/90 focus:ring-delta',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
      outline: 'border-2 border-delta text-delta hover:bg-delta/10 focus:ring-delta',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
      danger: 'bg-negative text-white hover:bg-negative/90 focus:ring-negative',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-200 transform active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;