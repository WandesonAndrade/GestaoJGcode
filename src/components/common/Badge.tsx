import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200/60',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-tight',
          variants[variant],
          className
        )
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
