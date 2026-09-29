import React from 'react';

interface LoginCardProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  children,
  sidebar,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-apple-blue selection:text-white">
      <main className={`w-full max-w-4xl bg-white rounded-3xl shadow-apple-lg border border-[#E5E5EA] overflow-hidden grid grid-cols-1 lg:grid-cols-12 ${className}`}>
        {/* Coluna do Formulário (Esquerda no desktop / Abaixo no mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          {children}
        </div>

        {/* Coluna Visual (Direita no desktop / Topo no mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-5 bg-gradient-to-b from-[#F5F5F7] to-white p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-l border-[#E5E5EA]">
          {sidebar}
        </div>
      </main>
    </div>
  );
};
