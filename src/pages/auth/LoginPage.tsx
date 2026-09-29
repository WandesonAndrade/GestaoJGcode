import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { formatCpfCnpj } from '../../utils/formatters';
import { Code2, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginClient, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginClient(cpfCnpj);
    setLoading(false);

    if (res.success) {
      navigate('/cliente');
    } else {
      setError(res.message || 'Erro ao realizar login.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message || 'Erro ao realizar login.');
    }
  };

  const fillQuickDemo = (type: 'padaria' | 'roberto' | 'admin') => {
    setError('');
    if (type === 'padaria') {
      setActiveTab('client');
      setCpfCnpj('12.345.678/0001-90');
    } else if (type === 'roberto') {
      setActiveTab('client');
      setCpfCnpj('123.456.789-00');
    } else if (type === 'admin') {
      setActiveTab('admin');
      setEmail('admin@jgcode.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting (Apple style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/50 via-transparent to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo JGcode */}
        <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-apple-xl shadow-apple border border-gray-100 mb-4">
          <div className="w-10 h-10 rounded-apple-sm bg-apple-blue flex items-center justify-center text-white shadow-sm">
            <Code2 size={24} className="stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-apple-text">JGcode</h1>
        <p className="mt-1 text-sm text-apple-secondary">
          Tecnologia sob medida, gestão transparente de projetos e pagamentos
        </p>

        {/* Tab Selector (Apple Segmented Control) */}
        <div className="mt-8 mx-4 sm:mx-0 p-1 bg-gray-200/70 rounded-apple flex gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('client');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-apple-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'client'
                ? 'bg-white text-apple-text shadow-apple-sm'
                : 'text-apple-secondary hover:text-apple-text'
            }`}
          >
            <UserCheck size={14} />
            Área do Cliente
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-apple-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-apple-text shadow-apple-sm'
                : 'text-apple-secondary hover:text-apple-text'
            }`}
          >
            <ShieldCheck size={14} />
            Administrador
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-apple-lg rounded-apple-xl border border-gray-200/70">
          {error && (
            <div className="mb-5 p-3 rounded-apple bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}

          {activeTab === 'client' ? (
            /* Formulário Cliente: Acesso pelo CPF ou CNPJ cadastrado pelo ADM */
            <form onSubmit={handleClientLogin} className="space-y-5">
              <div>
                <Input
                  label="Seu CPF ou CNPJ"
                  type="text"
                  placeholder="Digite seu CPF ou CNPJ"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                  helperText="Acesse utilizando o documento cadastrado com a JGcode"
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" size="md" isLoading={loading}>
                  Acessar Meus Projetos
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-apple-secondary">
                  Ainda não é cliente ou precisa atualizar seus dados?{' '}
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noreferrer"
                    className="text-apple-blue font-medium hover:underline"
                  >
                    Fale com nosso suporte
                  </a>
                </p>
              </div>
            </form>
          ) : (
            /* Formulário Administrador: E-mail e Senha */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Input
                  label="E-mail Corporativo"
                  type="email"
                  placeholder="admin@jgcode.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" size="md" isLoading={loading}>
                  Entrar no Painel Admin
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Atalhos Rápidos para Demonstração */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-apple-secondary uppercase tracking-wider mb-2.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Acessos Rápidos de Demonstração</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('padaria')}
                className="w-full text-left px-3 py-2 rounded-apple-sm text-xs bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-apple-text block">Cliente: Pão de Ouro (CNPJ)</span>
                  <span className="text-[11px] text-apple-secondary">Possui 2 projetos e faturas pendentes</span>
                </div>
                <span className="text-apple-blue font-medium text-[11px]">Selecionar</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('roberto')}
                className="w-full text-left px-3 py-2 rounded-apple-sm text-xs bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-apple-text block">Cliente: Dr. Roberto (CPF)</span>
                  <span className="text-[11px] text-apple-secondary">Projeto de E-mail Pro e pagamento manual</span>
                </div>
                <span className="text-apple-blue font-medium text-[11px]">Selecionar</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="w-full text-left px-3 py-2 rounded-apple-sm text-xs bg-gray-50 hover:bg-purple-50/70 border border-gray-100 hover:border-purple-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-apple-text block">Administrador JGcode</span>
                  <span className="text-[11px] text-apple-secondary">Gestão de clientes, projetos e cobranças</span>
                </div>
                <span className="text-purple-600 font-medium text-[11px]">Selecionar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
