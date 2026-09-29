import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary:
      'bg-apple-blue hover:bg-apple-hoverBlue text-white shadow-sm hover:shadow-apple-sm focus:ring-apple-blue',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-apple-text focus:ring-gray-300',
    outline:
      'border border-gray-200 hover:border-gray-300 text-apple-text hover:bg-gray-50 focus:ring-gray-200',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500',
    ghost:
      'text-apple-secondary hover:text-apple-text hover:bg-gray-100/70 focus:ring-gray-200',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-apple-sm',
    md: 'text-sm px-4 py-2.5 rounded-apple',
    lg: 'text-base px-6 py-3.5 rounded-apple-lg font-semibold',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Carregando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
