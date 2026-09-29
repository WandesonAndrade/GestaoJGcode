import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/storageService';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado de Menu Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estado de Menu Recolhido / Minimizado no Desktop
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jgcode_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jgcode_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Contadores rápidos para o menu lateral
  const clientsCount = StorageService.getClients().length;
  const usersCount = StorageService.getUsers().length;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      exact: true,
      icon: LayoutDashboard,
      description: 'Visão Geral & Indicadores',
    },
    {
      name: 'Clientes',
      path: '/admin/clientes',
      exact: false,
      icon: Users,
      badge: clientsCount,
      description: 'Gestão, Projetos & Cobrança',
    },
    {
      name: 'Usuários',
      path: '/admin/usuarios',
      exact: false,
      icon: ShieldCheck,
      badge: usersCount,
      description: 'Equipe & Controle de Acesso',
    },
  ];

  const isActiveRoute = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path || location.pathname === `${path}/dashboard`;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-apple-bg flex">
      {/* Backdrop para Menu Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR (MENU LATERAL - COM ESTADO MINIMIZADO/EXPANDIDO)   */}
      {/* ========================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white/90 backdrop-blur-xl border-r border-gray-200/70 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-72 lg:w-20' : 'w-72'}`}
      >
        {/* Topo do Menu: Marca e Botão de Minimizar */}
        <div className={isCollapsed ? 'p-3 text-center' : 'p-5'}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
              <div className="w-10 h-10 rounded-apple bg-apple-text flex items-center justify-center text-white font-bold text-base shadow-apple-sm shrink-0">
                JG
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-apple-text tracking-tight text-base truncate">
                      JGcode
                    </span>
                    <span className="bg-blue-50 text-apple-blue text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-100 shrink-0">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-apple-secondary block truncate">
                    Gestão & Faturamento
                  </span>
                </div>
              )}
            </div>

            {/* Botão de Fechar no Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-apple transition-colors"
            >
              <X size={18} />
            </button>

            {/* Botão de Minimizar/Expandir no Desktop */}
            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-apple transition-colors"
                title="Minimizar Menu Lateral"
                aria-label="Minimizar Menu"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>

          {/* Botão Expandir quando minimizado no Desktop */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center mt-3">
              <button
                onClick={toggleCollapse}
                className="p-2 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-apple transition-colors"
                title="Expandir Menu Lateral"
                aria-label="Expandir Menu"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          )}

          {/* Divisor */}
          <div className="h-px bg-gray-100 mt-4" />

          {/* Links de Navegação */}
          <nav className="mt-4 space-y-1.5">
            {!isCollapsed && (
              <div className="px-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">
                Navegação
              </div>
            )}

            {navItems.map((item) => {
              const active = isActiveRoute(item.path, item.exact);
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? `${item.name}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                  className={`group flex items-center rounded-apple text-xs font-semibold transition-all relative ${
                    isCollapsed
                      ? 'lg:justify-center lg:px-0 lg:py-3 px-3.5 py-2.5 justify-between'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    active
                      ? 'bg-apple-text text-white shadow-apple-sm'
                      : 'text-apple-secondary hover:text-apple-text hover:bg-gray-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={19}
                      className={
                        active
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-apple-text transition-colors'
                      }
                    />
                    {(!isCollapsed || isMobileMenuOpen) && <span>{item.name}</span>}
                  </div>

                  {item.badge !== undefined && (
                    <>
                      {/* Badge completa quando expandido */}
                      {(!isCollapsed || isMobileMenuOpen) && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-apple-secondary group-hover:bg-gray-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Mini ponto de badge quando minimizado */}
                      {isCollapsed && !isMobileMenuOpen && item.badge > 0 && (
                        <span className="hidden lg:block absolute top-2 right-2 w-2 h-2 rounded-full bg-apple-blue" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Rodapé do Menu Lateral: Perfil do Administrador */}
        <div className={`border-t border-gray-100 bg-gray-50/50 ${isCollapsed ? 'p-2 text-center' : 'p-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'lg:flex-col lg:gap-2 justify-between' : 'justify-between'}`}>
            <div
              className={`flex items-center gap-2.5 overflow-hidden ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
              title={isCollapsed ? `${user?.name || 'Administrador'} (${user?.email || 'admin@jgcode.com'})` : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              {(!isCollapsed || isMobileMenuOpen) && (
                <div className="overflow-hidden text-left">
                  <span className="block text-xs font-semibold text-apple-text truncate">
                    {user?.name || 'Administrador'}
                  </span>
                  <span className="text-[10px] text-apple-blue font-medium block truncate">
                    {user?.adminRole === 'SUPER_ADMIN'
                      ? 'Administrador Geral'
                      : user?.adminRole === 'PROJECT_MANAGER'
                      ? 'Gestor de Projetos'
                      : user?.adminRole === 'FINANCIAL'
                      ? 'Financeiro'
                      : user?.adminRole === 'SUPPORT'
                      ? 'Suporte'
                      : 'Administrador'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`text-apple-secondary hover:text-red-600 hover:bg-red-50 rounded-apple transition-colors shrink-0 ${
                isCollapsed ? 'p-1.5 mt-1' : 'p-2'
              }`}
              title="Encerrar Sessão"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* CONTEÚDO PRINCIPAL (COM MARGEM DINÂMICA BASEADA NO ESTADO) */}
      {/* ========================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Topo Mobile com Botão de Menu */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/60 h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-apple-text hover:bg-gray-100 rounded-apple transition-colors"
              aria-label="Abrir Menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-apple-sm bg-apple-text flex items-center justify-center text-white font-bold text-xs">
                JG
              </div>
              <span className="font-bold text-apple-text tracking-tight text-sm">
                JGcode Admin
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-apple-secondary hover:text-apple-text rounded-apple"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Área de Visualização da Página */}
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};
