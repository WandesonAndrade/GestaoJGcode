import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCpfCnpj } from '../../hooks/useCpfCnpj';
import { LoginCard } from '../../components/layout/LoginCard';
import { LoginVisualSidebar } from '../../components/layout/LoginVisualSidebar';
import { 
  ArrowRight, 
  IdCard, 
  MessageCircle, 
  Building2, 
  User, 
  Lock, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export const ClientLoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { value: cpfCnpj, docType, inputId, handleChange, validate } = useCpfCnpj('');
  const { loginClient } = useAuth();
  const navigate = useNavigate();

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      setError('Por favor, informe um CPF ou CNPJ válido.');
      return;
    }

    setLoading(true);
    const res = await loginClient(cpfCnpj);
    setLoading(false);

    if (res.success) {
      navigate('/cliente');
    } else {
      setError(res.message || 'CPF ou CNPJ não encontrado no sistema.');
    }
  };

  const clientSidebar = (
    <LoginVisualSidebar
      imageSrc="/images/client-login.jpg"
      imageAlt="Cliente JGcode no Portal"
      archGradientClass="from-blue-100/80 via-blue-50/50 to-transparent border-blue-200/50"
      badge={
        <div className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-apple-sm flex items-center gap-2">
          <Zap size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-[#1D1D1F]">Pix com Baixa Automática</span>
          <CheckCircle2 size={13} className="text-emerald-500" />
        </div>
      }
    />
  );

  return (
    <LoginCard sidebar={clientSidebar}>
      <div>
        {/* Header da Marca & Suporte */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-apple-blue flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JG
            </div>
            <div>
              <span className="font-bold text-[#1D1D1F] tracking-tight text-base block leading-none">
                JGcode
              </span>
              <span className="text-[11px] text-[#86868B]">Portal do Cliente</span>
            </div>
          </div>

          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-emerald-600 transition-colors focus:outline-none focus:underline"
            aria-label="Falar com o suporte técnico no WhatsApp"
          >
            <MessageCircle size={14} className="text-emerald-600" />
            <span>Suporte</span>
          </a>
        </header>

        {/* Título de Boas-vindas */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Bem-vindo(a)!!
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#86868B]">
            Informe seu documento para visualizar faturas e pagar com Pix.
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
        <form onSubmit={handleClientLogin} className="space-y-4" noValidate>
          <div>
            <label 
              htmlFor={inputId} 
              className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 ml-1"
            >
              CPF ou CNPJ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {docType === 'CNPJ' ? (
                  <Building2 size={18} className="text-apple-blue" />
                ) : docType === 'CPF' ? (
                  <User size={18} className="text-apple-blue" />
                ) : (
                  <IdCard size={18} />
                )}
              </div>

              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                placeholder="Digite seu CPF ou CNPJ"
                value={cpfCnpj}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E5EA] focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 rounded-full text-[#1D1D1F] text-sm font-medium py-3 pl-11 pr-16 transition-all outline-none placeholder:text-gray-400 shadow-sm"
                required
                autoFocus
                aria-required="true"
                aria-label="CPF ou CNPJ do cliente"
              />

              {docType && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <span className="text-[10px] font-bold text-apple-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {docType}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-full bg-apple-blue hover:bg-apple-hoverBlue text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group focus:outline-none focus:ring-4 focus:ring-apple-blue/30"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Acessar Portal</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Rodapé: Link discreto para equipe */}
      <footer className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#86868B]">
        <span>Área da equipe JGcode?</span>
        <Link
          to="/admin/login"
          className="font-bold text-apple-blue hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-apple-blue rounded"
        >
          <Lock size={12} />
          <span>Painel Admin</span>
        </Link>
      </footer>
    </LoginCard>
  );
};
