import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/storageService';
import type { Project, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PixPaymentModal } from '../../components/payment/PixPaymentModal';
import { ProjectStatusBadge } from '../../components/project/ProjectStatusBadge';
import { ProjectProgressStepper } from '../../components/project/ProjectProgressStepper';
import { ProjectTechDetailsBlock } from '../../components/project/ProjectTechDetailsBlock';
import {
  ExternalLink,
  QrCode,
  CheckCircle2,
  Clock,
  LogOut,
  FolderKanban,
  CreditCard,
  Building,
  Check,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ClientDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'financial' | 'projects'>('financial');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  const loadData = () => {
    if (user?.clientId) {
      setProjects(StorageService.getProjects(user.clientId));
      setPayments(StorageService.getPayments(user.clientId));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const pendingPayments = payments
    .filter((p) => p.status === 'PENDING')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const paidPayments = payments
    .filter((p) => p.status === 'PAID' || p.status === 'MANUAL')
    .sort((a, b) => new Date(b.paidAt || b.dueDate).getTime() - new Date(a.paidAt || a.dueDate).getTime());

  const totalPending = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenPix = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPixModalOpen(true);
  };

  // Avaliação de proximidade do vencimento
  const getDueStatus = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Venceu há ${Math.abs(diffDays)} dia(s)`,
        isExpired: true,
        isWarning: true,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Vence hoje!',
        isExpired: false,
        isWarning: true,
      };
    } else if (diffDays <= 5) {
      return {
        label: `Vence em ${diffDays} dia(s)`,
        isExpired: false,
        isWarning: true,
      };
    }
    return {
      label: `Vencimento em ${formatDate(dueDateStr)}`,
      isExpired: false,
      isWarning: false,
    };
  };

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col">
      {/* Top Header - Apple Inspired */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-apple-sm bg-apple-text flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JG
            </div>
            <div>
              <span className="font-bold text-apple-text tracking-tight text-base sm:text-lg">
                Área do Cliente
              </span>
              <span className="hidden sm:inline-block text-xs text-apple-secondary ml-2 font-normal">
                JGcode Soluções Web
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-apple-text">{user?.name}</span>
              <span className="block text-[11px] text-apple-secondary font-mono">{user?.cpfCnpj}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Sair da conta"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ========================================================= */}
        {/* HERO FINANCEIRO & STATUS DA CONTA (Foco Total em Cobrança)*/}
        {/* ========================================================= */}
        <div className="bg-white rounded-apple-2xl p-6 sm:p-8 border border-gray-200/80 shadow-apple-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-apple-blue uppercase tracking-wider">
                  Portal de Pagamentos & Mensalidades
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck size={12} />
                  Pix Mercado Pago
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-text">
                Olá, {user?.name}
              </h1>

              <p className="text-xs sm:text-sm text-apple-secondary leading-relaxed">
                Consulte suas mensalidades, confira o que já foi liquidado e pague faturas em aberto via Pix instantâneo com baixa imediata.
              </p>
            </div>

            {/* Quadro de Resumo de Faturamento (Apple Card style) */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Card Pendente */}
              <div
                className={`p-4 rounded-apple-xl border text-center transition-all min-w-[140px] sm:min-w-[160px] ${
                  pendingPayments.length > 0
                    ? 'bg-amber-50/50 border-amber-200/80'
                    : 'bg-gray-50 border-gray-200/60'
                }`}
              >
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-apple-secondary">
                  A Pagar / Em Aberto
                </span>
                <span
                  className={`text-2xl font-bold tracking-tight block mt-1 ${
                    pendingPayments.length > 0 ? 'text-amber-600' : 'text-apple-text'
                  }`}
                >
                  {formatCurrency(totalPending)}
                </span>
                <span className="text-[11px] text-apple-secondary mt-0.5 block">
                  {pendingPayments.length > 0
                    ? `${pendingPayments.length} fatura(s) pendente(s)`
                    : 'Tudo quitado!'}
                </span>
              </div>

              {/* Card Quitado */}
              <div className="p-4 rounded-apple-xl border border-emerald-200/70 bg-emerald-50/30 text-center min-w-[140px] sm:min-w-[160px]">
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                  Total Já Quitado
                </span>
                <span className="text-2xl font-bold tracking-tight text-emerald-600 block mt-1">
                  {formatCurrency(totalPaid)}
                </span>
                <span className="text-[11px] text-emerald-600 mt-0.5 block">
                  {paidPayments.length} pagamento(s) confirmado(s)
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Pagamento Imediato (Se houver fatura pendente) */}
          {pendingPayments.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/40 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-5 rounded-b-apple-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Zap size={20} />
                </div>
                <div>
                  <span className="font-bold text-apple-text text-sm block">
                    Próxima fatura: {pendingPayments[0].title}
                  </span>
                  <span className="text-xs text-amber-700">
                    Valor de <strong>{formatCurrency(pendingPayments[0].amount)}</strong> • {getDueStatus(pendingPayments[0].dueDate).label}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenPix(pendingPayments[0])}
                className="py-2 px-4 shadow-apple-sm text-xs font-bold shrink-0"
              >
                <QrCode size={15} className="mr-1.5" />
                Pagar com Pix Agora
              </Button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* NAVEGAÇÃO DE ABAS: FINANCEIRO (FOCO) vs PROJETOS          */}
        {/* ========================================================= */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'financial'
                ? 'border-apple-blue text-apple-blue'
                : 'border-transparent text-apple-secondary hover:text-apple-text'
            }`}
          >
            <CreditCard size={16} />
            <span>Mensalidades & Pagamentos</span>
            {pendingPayments.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-apple-blue text-apple-blue'
                : 'border-transparent text-apple-secondary hover:text-apple-text'
            }`}
          >
            <FolderKanban size={16} />
            <span>Serviços & Projetos Contratados ({projects.length})</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* ABA 1: FINANCEIRO & MENSALIDADES (PAGAS E PENDENTES)       */}
        {/* ========================================================= */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* 1. MENSALIDADES PENDENTES / A PAGAR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-apple-text tracking-tight flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    Mensalidades Pendentes de Pagamento
                  </h2>
                  <p className="text-xs text-apple-secondary">
                    Clique em "Pagar com Pix" para abrir o QR Code e código Copia e Cola instantâneo.
                  </p>
                </div>
                <span className="text-xs font-semibold text-apple-secondary">
                  {pendingPayments.length} fatura(s)
                </span>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="bg-white rounded-apple-xl p-8 text-center border border-gray-200/70 shadow-apple-sm space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="font-bold text-apple-text text-base">Parabéns! Nenhuma mensalidade pendente</h3>
                  <p className="text-xs text-apple-secondary max-w-sm mx-auto">
                    Todas as suas faturas de suporte, hospedagem e serviços contratados estão devidamente quitadas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPayments.map((p) => {
                    const status = getDueStatus(p.dueDate);

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-apple-xl p-5 border border-amber-200/80 shadow-apple-sm hover:shadow-apple-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                                status.isWarning
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-50 text-apple-blue'
                              }`}
                            >
                              <Calendar size={11} />
                              {status.label}
                            </span>
                            <Badge variant="warning">Aguardando Pagamento</Badge>
                          </div>

                          <div>
                            <h3 className="font-bold text-apple-text text-base leading-snug">{p.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-apple-secondary mt-1">
                              <span>Ref: {p.installmentLabel || 'Mensalidade'}</span>
                              <span>•</span>
                              <span>{p.projectName || 'Serviço JGcode'}</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <span className="text-xs text-apple-secondary block">Valor da Cobrança:</span>
                            <span className="text-2xl font-bold text-apple-text tracking-tight">
                              {formatCurrency(p.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Botão de Ação Direta para o Pix */}
                        <div className="pt-3 border-t border-gray-100">
                          <Button
                            className="w-full text-xs font-bold py-2.5 shadow-sm"
                            onClick={() => handleOpenPix(p)}
                          >
                            <QrCode size={16} className="mr-2" />
                            Pagar com Pix (Copia e Cola / QR Code)
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. MENSALIDADES PAGAS / HISTÓRICO LIQUIDADO */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-apple-text tracking-tight flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Histórico de Mensalidades Pagas
                  </h2>
                  <p className="text-xs text-apple-secondary">
                    Comprovante de todas as faturas e parcelas já quitadas na JGcode.
                  </p>
                </div>
                <span className="text-xs font-semibold text-apple-secondary">
                  {paidPayments.length} quitada(s)
                </span>
              </div>

              {paidPayments.length === 0 ? (
                <div className="bg-white rounded-apple-xl p-8 text-center border border-gray-200/70 shadow-apple-sm text-xs text-apple-secondary">
                  Nenhum pagamento registrado ainda no seu histórico.
                </div>
              ) : (
                <div className="bg-white rounded-apple-xl border border-gray-200/70 overflow-hidden shadow-apple-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-apple-secondary uppercase tracking-wider text-[11px] font-semibold">
                        <tr>
                          <th className="py-3 px-4">Descrição da Mensalidade</th>
                          <th className="py-3 px-4">Projeto</th>
                          <th className="py-3 px-4">Data do Pagamento</th>
                          <th className="py-3 px-4">Valor Quitado</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paidPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-apple-text block">{p.title}</span>
                              {p.installmentLabel && (
                                <span className="text-[11px] text-apple-secondary">
                                  {p.installmentLabel}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-apple-secondary">
                              {p.projectName || '-'}
                            </td>
                            <td className="py-3.5 px-4 text-apple-secondary">
                              <span className="flex items-center gap-1 font-medium text-apple-text">
                                <Calendar size={13} className="text-emerald-600" />
                                {formatDate(p.paidAt || p.dueDate)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-apple-text">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <Check size={12} />
                                {p.status === 'MANUAL' ? 'Validado Manual' : 'Liquidado Pix'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: PROJETOS & SERVIÇOS CONTRATADOS                    */}
        {/* ========================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-apple-text tracking-tight">
                Seus Projetos & Serviços Contratados
              </h2>
              <p className="text-xs text-apple-secondary">
                Consulte o andamento das etapas de desenvolvimento, dados técnicos e links publicados.
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-apple-xl p-8 text-center border border-gray-100 shadow-apple-sm">
                <Building size={32} className="mx-auto text-gray-400 mb-2" />
                <h3 className="font-semibold text-apple-text text-sm">Nenhum projeto cadastrado</h3>
                <p className="text-xs text-apple-secondary">Seus projetos em desenvolvimento aparecerão aqui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-apple-xl overflow-hidden border border-gray-200/80 shadow-apple-sm flex flex-col justify-between"
                  >
                    {/* Imagem de Capa do Projeto */}
                    {proj.imageUrl && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        <img
                          src={proj.imageUrl}
                          alt={proj.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <Badge variant="info">{proj.serviceType}</Badge>
                          <ProjectStatusBadge status={proj.status} />
                        </div>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {!proj.imageUrl && (
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <Badge variant="info">{proj.serviceType}</Badge>
                            <ProjectStatusBadge status={proj.status} />
                          </div>
                        )}
                        <h3 className="font-bold text-apple-text text-base tracking-tight">{proj.name}</h3>
                        <p className="text-xs text-apple-secondary leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>

                        {/* Pipeline de Fases do Projeto */}
                        <div className="pt-2 bg-gray-50/80 p-3 rounded-apple border border-gray-100">
                          <span className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block mb-1">
                            Fase do Projeto:
                          </span>
                          <ProjectProgressStepper currentStatus={proj.status} compact={true} />
                        </div>
                      </div>

                      {/* Bloco de Infraestrutura Técnica e Domínio */}
                      <ProjectTechDetailsBlock tech={proj.technicalDetails} />

                      {/* Informações de Publicação */}
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        {proj.publicationNotes && (
                          <div className="bg-gray-50 rounded-apple p-2.5 text-xs text-gray-600">
                            <span className="font-semibold block text-apple-text mb-0.5">
                              Notas de Entrega:
                            </span>
                            {proj.publicationNotes}
                          </div>
                        )}

                        {proj.publishedLink ? (
                          <a
                            href={proj.publishedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-apple-text font-medium text-xs rounded-apple transition-colors"
                          >
                            <span>Acessar Projeto Publicado</span>
                            <ExternalLink size={13} className="ml-1.5 text-apple-blue" />
                          </a>
                        ) : (
                          <div className="text-center py-2 text-xs text-apple-secondary bg-gray-50 rounded-apple">
                            Projeto em fase de desenvolvimento
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pix Payment Modal (Mercado Pago) */}
      <PixPaymentModal
        payment={selectedPayment}
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        onPaymentSuccess={loadData}
      />
    </div>
  );
};
