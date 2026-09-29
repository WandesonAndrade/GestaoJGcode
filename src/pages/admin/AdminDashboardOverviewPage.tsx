import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import type { Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { PixPaymentModal } from '../../components/payment/PixPaymentModal';
import { ProjectStatusBadge } from '../../components/project/ProjectStatusBadge';
import {
  Users,
  FolderKanban,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Clock,
  QrCode,
  ChevronRight,
  PieChart,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

// Cores Oficiais Apple para o Gráfico Donut de Serviços
const SERVICE_COLORS: Record<string, { label: string; color: string }> = {
  SITE: { label: 'Websites & Landing Pages', color: '#0071e3' }, // Apple Blue
  GMB: { label: 'Google Meu Negócio', color: '#34c759' }, // Apple Emerald
  EMAIL_PRO: { label: 'E-mails Profissionais', color: '#5856d6' }, // Apple Indigo
  SISTEMA: { label: 'Sistemas Web', color: '#ff9500' }, // Apple Orange
  CONSULTORIA: { label: 'Consultoria Tech', color: '#af52de' }, // Apple Violet
  OUTRO: { label: 'Outros Serviços', color: '#8e8e93' }, // Apple Gray
};

interface MonthData {
  label: string;
  yearMonth: string;
  paid: number;
  pending: number;
  total: number;
}

export const AdminDashboardOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const clients = StorageService.getClients();
  const projects = StorageService.getProjects();
  const payments = StorageService.getPayments();

  // Pix Modal para visualização rápida no dashboard
  const [selectedPaymentForPix, setSelectedPaymentForPix] = useState<Payment | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  // Mês com hover no gráfico de barras
  const [hoveredMonth, setHoveredMonth] = useState<MonthData | null>(null);

  // Cálculos Financeiros
  const paidPayments = payments.filter((p) => p.status === 'PAID' || p.status === 'MANUAL');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');

  const totalPaid = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Faturas Próximas do Vencimento
  const upcomingInvoices = [...pendingPayments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Projetos em Andamento
  const activeProjects = projects
    .filter((p) => p.status !== 'ENTREGUE')
    .slice(0, 4);

  // 1. Dados para o Gráfico de Barras Mensal (Janela de 6 meses)
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const monthlyRevenue: MonthData[] = [];

  for (let i = -2; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = monthNames[d.getMonth()];

    let paid = 0;
    let pending = 0;

    payments.forEach((p) => {
      if (p.dueDate && p.dueDate.startsWith(yearMonth)) {
        if (p.status === 'PAID' || p.status === 'MANUAL') {
          paid += p.amount;
        } else if (p.status === 'PENDING') {
          pending += p.amount;
        }
      }
    });

    monthlyRevenue.push({
      label,
      yearMonth,
      paid,
      pending,
      total: paid + pending,
    });
  }

  const maxMonthValue = Math.max(...monthlyRevenue.map((m) => Math.max(m.paid, m.pending)), 500);

  // 2. Dados para o Gráfico Donut (Rosca Apple)
  const serviceTypeCounts: Record<string, number> = {};
  projects.forEach((p) => {
    serviceTypeCounts[p.serviceType] = (serviceTypeCounts[p.serviceType] || 0) + 1;
  });

  const totalServices = projects.length;
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  let accumulatedPercent = 0;
  const donutSegments = Object.entries(serviceTypeCounts).map(([type, count]) => {
    const percent = totalServices > 0 ? count / totalServices : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    const config = SERVICE_COLORS[type] || { label: type, color: '#0071e3' };

    return {
      type,
      label: config.label,
      count,
      percentage: Math.round(percent * 100),
      color: config.color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="p-3 sm:p-4 lg:p-5 h-full lg:h-screen lg:max-h-screen flex flex-col justify-between overflow-y-auto lg:overflow-hidden gap-3 max-w-[1600px] mx-auto">
      {/* 1. Header Compacto Alinhado */}
      <div className="flex items-center justify-between gap-3 shrink-0 h-9">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-text">
            Dashboard
          </h1>
          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operação Ativa
          </span>
          <span className="hidden md:inline-block text-xs text-apple-secondary">
            • Visão analítica em tempo real
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/admin/usuarios')}
            className="py-1 px-3 text-xs h-8 hidden sm:inline-flex"
          >
            <ShieldCheck size={13} className="mr-1.5 text-indigo-600" />
            Equipe ({StorageService.getUsers().length})
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/clientes')} className="py-1 px-3 text-xs h-8">
            <Users size={13} className="mr-1.5" />
            Ver Clientes ({clients.length})
          </Button>
        </div>
      </div>

      {/* 2. Top Row: 4 Cards de Indicadores com Altura e Alinhamento Idênticos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {/* Receita Recebida */}
        <div className="bg-white rounded-apple-xl p-3.5 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-apple-secondary uppercase tracking-wider block truncate">
              Receita Recebida
            </span>
            <span className="text-lg sm:text-xl font-bold text-apple-text tracking-tight block mt-0.5 truncate">
              {formatCurrency(totalPaid)}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={11} /> {paidPayments.length} liquidados
            </span>
          </div>
          <div className="w-9 h-9 rounded-apple bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ml-2">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Faturas em Aberto */}
        <div className="bg-white rounded-apple-xl p-3.5 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-apple-secondary uppercase tracking-wider block truncate">
              A Receber / Aberto
            </span>
            <span className="text-lg sm:text-xl font-bold text-amber-600 tracking-tight block mt-0.5 truncate">
              {formatCurrency(totalPending)}
            </span>
            <span className="text-[10px] text-amber-600 font-medium inline-flex items-center gap-0.5 mt-0.5">
              <Clock size={11} /> {pendingPayments.length} faturas Pix
            </span>
          </div>
          <div className="w-9 h-9 rounded-apple bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 ml-2">
            <CreditCard size={18} />
          </div>
        </div>

        {/* Clientes Cadastrados */}
        <div className="bg-white rounded-apple-xl p-3.5 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-apple-secondary uppercase tracking-wider block truncate">
              Clientes Ativos
            </span>
            <span className="text-lg sm:text-xl font-bold text-apple-text tracking-tight block mt-0.5 truncate">
              {clients.length}
            </span>
            <span className="text-[10px] text-apple-secondary block truncate mt-0.5">
              {clients.filter((c) => c.active).length} com login liberado
            </span>
          </div>
          <div className="w-9 h-9 rounded-apple bg-blue-50 text-apple-blue flex items-center justify-center shrink-0 ml-2">
            <Users size={18} />
          </div>
        </div>

        {/* Projetos & Contratos */}
        <div className="bg-white rounded-apple-xl p-3.5 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-apple-secondary uppercase tracking-wider block truncate">
              Projetos & Contratos
            </span>
            <span className="text-lg sm:text-xl font-bold text-apple-text tracking-tight block mt-0.5 truncate">
              {projects.length}
            </span>
            <span className="text-[10px] text-indigo-600 font-medium block truncate mt-0.5">
              {projects.filter((p) => p.status === 'ENTREGUE').length} entregue(s)
            </span>
          </div>
          <div className="w-9 h-9 rounded-apple bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 ml-2">
            <FolderKanban size={18} />
          </div>
        </div>
      </div>

      {/* 3. Grid Principal em 4 Quadrantes Perfeitamente Alinhados (2x2) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-3.5">
        {/* ========================================================= */}
        {/* QUADRANTE 1: GRÁFICO DE BARRAS DE RECEITA MENSAL (Top-L)  */}
        {/* ========================================================= */}
        <div className="bg-white rounded-apple-xl p-4 border border-gray-200/70 shadow-apple-sm flex flex-col justify-between overflow-hidden">
          {/* Header do Gráfico */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-apple-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 size={14} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-apple-text tracking-tight uppercase">
                  Evolução da Receita Mensal
                </h2>
                <span className="text-[10px] text-apple-secondary">
                  {hoveredMonth
                    ? `${hoveredMonth.label}: Quitado ${formatCurrency(hoveredMonth.paid)} • Aberto ${formatCurrency(hoveredMonth.pending)}`
                    : 'Recebimentos realizados vs. faturas previstas'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-apple-secondary">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Quitado</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-apple-secondary">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Aberto</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras Duplas / Mês a Mês */}
          <div className="my-auto py-2">
            <div className="h-28 flex items-end justify-between gap-2 px-2 border-b border-gray-100 pb-1">
              {monthlyRevenue.map((month) => {
                const paidHeight = maxMonthValue > 0 ? (month.paid / maxMonthValue) * 80 : 0;
                const pendingHeight = maxMonthValue > 0 ? (month.pending / maxMonthValue) * 80 : 0;
                const isCurrentMonth = month.yearMonth === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                return (
                  <div
                    key={month.yearMonth}
                    onMouseEnter={() => setHoveredMonth(month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    {/* Barras Lado a Lado */}
                    <div className="w-full flex items-end justify-center gap-1 h-[80px]">
                      {/* Barra Quitado (Verde) */}
                      <div
                        style={{ height: `${Math.max(paidHeight, 4)}px` }}
                        className={`w-3 sm:w-3.5 rounded-t-sm transition-all duration-300 ${
                          month.paid > 0
                            ? 'bg-emerald-500 group-hover:bg-emerald-600 shadow-sm'
                            : 'bg-gray-100'
                        }`}
                        title={`${month.label} - Quitado: ${formatCurrency(month.paid)}`}
                      />

                      {/* Barra Pendente (Âmbar) */}
                      <div
                        style={{ height: `${Math.max(pendingHeight, 4)}px` }}
                        className={`w-3 sm:w-3.5 rounded-t-sm transition-all duration-300 ${
                          month.pending > 0
                            ? 'bg-amber-400 group-hover:bg-amber-500 shadow-sm'
                            : 'bg-gray-100'
                        }`}
                        title={`${month.label} - A Receber: ${formatCurrency(month.pending)}`}
                      />
                    </div>

                    {/* Rótulo do Mês */}
                    <span
                      className={`text-[10px] mt-1.5 transition-colors ${
                        isCurrentMonth
                          ? 'font-bold text-apple-blue bg-blue-50 px-1 rounded-sm'
                          : 'font-semibold text-apple-secondary group-hover:text-apple-text'
                      }`}
                    >
                      {month.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Informativo Alinhado */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-apple-secondary">
            <span>Total Acumulado Quitado: <strong className="text-emerald-600 font-semibold">{formatCurrency(totalPaid)}</strong></span>
            <span>Previsto a Liquidar: <strong className="text-amber-600 font-semibold">{formatCurrency(totalPending)}</strong></span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* QUADRANTE 2: GRÁFICO DONUT ESTILO APPLE (Top-Right)       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-apple-xl p-4 border border-gray-200/70 shadow-apple-sm flex flex-col justify-between overflow-hidden">
          {/* Header do Card */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-apple-sm bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PieChart size={14} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-apple-text tracking-tight uppercase">
                  Distribuição de Serviços
                </h2>
                <span className="text-[10px] text-apple-secondary">Participação por modalidade</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-gray-100 text-apple-text px-2 py-0.5 rounded-full">
              {totalServices} contrato(s)
            </span>
          </div>

          {/* Área Central: Donut SVG + Legenda Estruturada */}
          <div className="my-auto py-1 flex items-center justify-between gap-4">
            {/* Gráfico Donut Circular SVG estilo Apple */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 100 100">
                {/* Trilha de fundo cinza */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f3f4f6"
                  strokeWidth="14"
                />

                {/* Segmentos de Serviços */}
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.type}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700 ease-out hover:opacity-85"
                  />
                ))}
              </svg>

              {/* Informação Centralizada dentro da Rosca */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-apple-text">
                  {totalServices}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-apple-secondary font-semibold">
                  Serviços
                </span>
              </div>
            </div>

            {/* Legenda do Donut */}
            <div className="flex-1 space-y-1.5 overflow-hidden">
              {donutSegments.length === 0 ? (
                <p className="text-xs text-apple-secondary text-center py-2">
                  Nenhum serviço registrado.
                </p>
              ) : (
                donutSegments.map((seg) => (
                  <div key={seg.type} className="flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-medium text-apple-text truncate">
                        {seg.label}
                      </span>
                    </div>
                    <span className="font-bold text-apple-secondary shrink-0 font-mono text-[10px]">
                      {seg.count} ({seg.percentage}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer do Card com Atalho */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-apple-secondary">
            <span>Soluções ativas na JGcode</span>
            <button
              onClick={() => navigate('/admin/clientes')}
              className="font-semibold text-apple-blue hover:underline flex items-center gap-1"
            >
              <span>Gerenciar projetos</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* QUADRANTE 3: PRÓXIMOS VENCIMENTOS (Bottom-Left)           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-apple-xl p-4 border border-gray-200/70 shadow-apple-sm flex flex-col justify-between overflow-hidden">
          {/* Header do Card */}
          <div className="flex items-center justify-between shrink-0 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-apple-sm bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={14} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-apple-text tracking-tight uppercase">
                  Próximos Vencimentos
                </h2>
                <span className="text-[10px] text-apple-secondary">Faturas em aberto a liquidar</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
              {pendingPayments.length} pendente(s)
            </span>
          </div>

          {/* Lista Estruturada de Vencimentos */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100 my-1">
            {upcomingInvoices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-apple-secondary py-3">
                <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                <span className="font-semibold text-apple-text">Tudo em dia!</span>
                <span>Nenhuma fatura pendente próxima de vencer.</span>
              </div>
            ) : (
              upcomingInvoices.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId);
                const clientDisplayName = client?.companyName
                  ? `${client.name} • ${client.companyName}`
                  : (client?.name || inv.projectName || 'Cliente');

                return (
                  <div
                    key={inv.id}
                    className="py-2 px-1 flex items-center justify-between gap-3 hover:bg-gray-50/80 rounded-apple transition-colors"
                  >
                    {/* Informações da Cobrança */}
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-apple-text truncate block">
                        {clientDisplayName}
                      </span>
                      <span className="text-[10px] text-apple-secondary block truncate mt-0.5">
                        Venc: <strong className="text-apple-text font-semibold">{formatDate(inv.dueDate)}</strong>
                        <span className="text-gray-300 mx-1.5">•</span>
                        {inv.title}
                      </span>
                    </div>

                    {/* Valor e Ações Rápidas Alinhadas */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-xs sm:text-sm text-apple-text tracking-tight min-w-[70px] text-right">
                        {formatCurrency(inv.amount)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPaymentForPix(inv);
                          setIsPixModalOpen(true);
                        }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-apple-blue rounded-apple transition-colors"
                        title="Ver QR Code Pix"
                      >
                        <QrCode size={13} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/clientes/${inv.clientId}`)}
                        className="p-1.5 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-apple transition-colors"
                        title="Abrir Cliente"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* QUADRANTE 4: PROJETOS EM PRODUÇÃO (Bottom-Right)          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-apple-xl p-4 border border-gray-200/70 shadow-apple-sm flex flex-col justify-between overflow-hidden">
          {/* Header do Card */}
          <div className="flex items-center justify-between shrink-0 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-apple-sm bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderKanban size={14} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-apple-text tracking-tight uppercase">
                  Projetos em Produção
                </h2>
                <span className="text-[10px] text-apple-secondary">Serviços com entregas ativas</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              {activeProjects.length} ativo(s)
            </span>
          </div>

          {/* Lista Estruturada de Projetos */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100 my-1">
            {activeProjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-apple-secondary py-3">
                <CheckCircle2 size={20} className="text-indigo-500 mb-1" />
                <span className="font-semibold text-apple-text">Nenhum projeto pendente</span>
                <span>Todos os projetos cadastrados foram entregues.</span>
              </div>
            ) : (
              activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/admin/clientes/${proj.clientId}`)}
                  className="py-2 px-1 flex items-center justify-between gap-3 hover:bg-gray-50/80 rounded-apple transition-colors cursor-pointer group"
                >
                  {/* Nome do Projeto e Cliente */}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-apple-text group-hover:text-apple-blue transition-colors truncate block">
                      {proj.name}
                    </span>
                    <span className="text-[10px] text-apple-secondary truncate block mt-0.5">
                      Cliente: {proj.clientName}
                    </span>
                  </div>

                  {/* Status Badge e Seta Alinhada com o Quadrante Esquerdo */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ProjectStatusBadge status={proj.status} />
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-apple-blue transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Pix QR Code */}
      <PixPaymentModal
        payment={selectedPaymentForPix}
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        onPaymentSuccess={() => {}}
      />
    </div>
  );
};
