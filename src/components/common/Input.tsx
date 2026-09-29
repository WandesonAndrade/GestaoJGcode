import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
            {label}
          </label>
        )}
        <div className="relative rounded-apple transition-all duration-200">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white/90 border text-apple-text text-sm rounded-apple transition-all duration-200',
                'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white',
                leftIcon ? 'pl-10' : 'pl-3.5',
                rightIcon ? 'pr-10' : 'pr-3.5',
                'py-2.5',
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-gray-200 focus:border-apple-blue focus:ring-apple-blue/20 hover:border-gray-300',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-apple-secondary mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
