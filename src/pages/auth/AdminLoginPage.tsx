import React, { useState, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import { LoginCard } from '../../components/layout/LoginCard';
import { LoginVisualSidebar } from '../../components/layout/LoginVisualSidebar';
import { DividerWithText } from '../../components/common/DividerWithText';
import { 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles,
  Server
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const emailInputId = useId();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    password,
    showPassword,
    inputType,
    inputId: passwordInputId,
    setPassword,
    handleChange: handlePasswordChange,
    toggleShowPassword,
  } = usePasswordToggle('');

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const fillAdminDemo = () => {
    setError('');
    setEmail('admin@jgcode.com');
    setPassword('admin123');
  };

  const adminSidebar = (
    <LoginVisualSidebar
      imageSrc="/images/admin-login.jpg"
      imageAlt="Administrador JGcode Console"
      archGradientClass="from-indigo-100/80 via-indigo-50/50 to-transparent border-indigo-200/50"
      badge={
        <div className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-apple-sm flex items-center gap-2">
          <Server size={14} className="text-indigo-600" />
          <span className="text-xs font-bold text-[#1D1D1F]">Console JGcode v2.4</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      }
    />
  );

  return (
    <LoginCard sidebar={adminSidebar}>
      <div>
        {/* Header com Navegação de Volta */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JG
            </div>
            <div>
              <span className="font-bold text-[#1D1D1F] tracking-tight text-base block leading-none">
                JGcode
              </span>
              <span className="text-[11px] text-[#86868B]">Console Administrativo</span>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors focus:outline-none focus:underline"
            aria-label="Voltar para o Portal do Cliente"
          >
            <ArrowLeft size={13} />
            <span>Portal do Cliente</span>
          </Link>
        </header>

        {/* Título de Boas-vindas */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold mb-2">
            <ShieldCheck size={12} />
            <span>Acesso Restrito da Equipe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Painel da Equipe!!
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#86868B]">
            Entre com seu e-mail corporativo para gerenciar clientes e projetos.
          </p>
        </div>

        {/* Mensagem de Erro com Acessibilidade */}
        {error && (
          <div 
            role="alert" 
            aria-live="polite" 
            className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-medium"
          >
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleAdminLogin} className="space-y-4" noValidate>
          <div>
            <label 
              htmlFor={emailInputId} 
              className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 ml-1"
            >
              E-mail Corporativo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id={emailInputId}
                type="email"
                placeholder="email@jgcode.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-full text-[#1D1D1F] text-sm font-medium py-3 pl-11 pr-4 transition-all outline-none placeholder:text-gray-400 shadow-sm"
                required
                autoFocus
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor={passwordInputId} 
              className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 ml-1"
            >
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id={passwordInputId}
                type={inputType}
                placeholder="Sua senha corporativa"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-white border border-[#E5E5EA] focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-full text-[#1D1D1F] text-sm font-medium py-3 pl-11 pr-11 transition-all outline-none placeholder:text-gray-400 shadow-sm"
                required
                aria-required="true"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right mt-1.5 mr-1">
              <span className="text-xs text-[#86868B] hover:text-indigo-600 transition-colors cursor-pointer">
                Esqueceu a senha?
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Divisor Reutilizável */}
        <DividerWithText>ou acesse como demonstração</DividerWithText>

        {/* Atalho Demo 1-clique */}
        <button
          type="button"
          onClick={fillAdminDemo}
          className="w-full p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-indigo-50 border border-[#E5E5EA] hover:border-indigo-200 text-left transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Preencher credenciais de teste para administrador"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1D1D1F] block group-hover:text-indigo-700 transition-colors">
                Preencher Credenciais Admin
              </span>
              <span className="text-[10px] text-[#86868B]">admin@jgcode.com • admin123</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-2xs">
            1-Clique
          </span>
        </button>
      </div>

      {/* Rodapé: Voltar ao portal */}
      <footer className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-[#86868B]">
        <span>Precisa acessar suas faturas como cliente? </span>
        <Link 
          to="/login" 
          className="font-bold text-indigo-600 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
        >
          Ir para o Portal do Cliente
        </Link>
      </footer>
    </LoginCard>
  );
};
