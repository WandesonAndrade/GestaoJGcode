import React from 'react';

interface DividerWithTextProps {
  children?: React.ReactNode;
  className?: string;
}

export const DividerWithText: React.FC<DividerWithTextProps> = ({
  children = 'ou',
  className = '',
}) => {
  return (
    <div className={`relative my-6 text-center ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[#E5E5EA]" />
      </div>
      <div className="relative inline-block bg-white px-3 text-[11px] font-medium text-[#86868B]">
        {children}
      </div>
    </div>
  );
};
