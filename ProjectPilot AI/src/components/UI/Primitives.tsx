import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white active:bg-blue-700 font-semibold shadow-xs',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:bg-slate-900',
      outline: 'bg-transparent hover:bg-slate-800/50 text-slate-300 border border-slate-700 active:bg-slate-800',
      ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
      danger: 'bg-red-700 hover:bg-red-600 text-white active:bg-red-800 font-semibold',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs rounded-md',
      md: 'px-3.5 py-2 text-sm rounded-md',
      lg: 'px-4 py-2.5 text-base rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer border border-transparent',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">{label}</label>}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-slate-500 flex items-center pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-900 border border-slate-700/80 rounded-md text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50',
              icon ? 'pl-9 pr-3.5 py-2' : 'px-3.5 py-2',
              error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-100 transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({
  className,
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'purple' | 'blue' | 'slate';
  children: React.ReactNode;
}) => {
  const styles = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800',
    purple: 'bg-slate-800 text-purple-300 border-slate-700',
    blue: 'bg-slate-800 text-blue-300 border-slate-700',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border select-none', styles[variant], className)}>
      {children}
    </span>
  );
};
