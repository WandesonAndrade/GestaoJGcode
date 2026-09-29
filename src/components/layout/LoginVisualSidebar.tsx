import React from 'react';

interface LoginVisualSidebarProps {
  imageSrc: string;
  imageAlt: string;
  archGradientClass?: string;
  badge?: React.ReactNode;
}

export const LoginVisualSidebar: React.FC<LoginVisualSidebarProps> = ({
  imageSrc,
  imageAlt,
  archGradientClass = 'from-blue-100/80 via-blue-50/50 to-transparent border-blue-200/50',
  badge,
}) => {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] flex items-end justify-center">
      {/* O Arco Arquitetônico Decorativo */}
      <div 
        className={`absolute inset-x-4 bottom-0 top-6 rounded-t-full bg-gradient-to-b border-t border-x ${archGradientClass}`} 
        aria-hidden="true"
      />
      
      {/* Imagem 3D do Personagem / Administrador */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="relative z-10 w-full h-full object-contain drop-shadow-xl select-none pointer-events-none"
        loading="eager"
      />

      {/* Badge Flutuante no Rodapé do Arco */}
      {badge && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          {badge}
        </div>
      )}
    </div>
  );
};
