import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog com altura máxima dinâmica, flexbox e rolagem suave */}
      <div
        className={`relative w-full ${maxWidths[maxWidth]} max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white rounded-apple-xl shadow-apple-lg border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Cabeçalho Fixo (shrink-0) */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="pr-4">
            <h3 className="text-base sm:text-lg font-semibold text-apple-text tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-apple-secondary mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-apple-text hover:bg-gray-100 rounded-full transition-colors shrink-0"
            title="Fechar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com rolagem interna suave */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
