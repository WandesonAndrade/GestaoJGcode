import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/storageService';
import type { Client, Project, Payment } from '../../types';
import { formatCurrency, formatCpfCnpj } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  FolderKanban,
  CreditCard,
  Plus,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Search,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Novo Cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    companyName: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    address: '',
  });

  const loadAllData = () => {
    setClients(StorageService.getClients());
    setProjects(StorageService.getProjects());
    setPayments(StorageService.getPayments());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = StorageService.saveClient({
      ...clientForm,
      active: true,
    });
    setClientForm({ name: '', companyName: '', cpfCnpj: '', email: '', phone: '', address: '' });
    setIsClientModalOpen(false);
    loadAllData();
    navigate(`/admin/clientes/${newClient.id}`);
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'PAID' || p.status === 'MANUAL')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.companyName && c.companyName.toLowerCase().includes(term)) ||
      c.cpfCnpj.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col">
      {/* Header Admin */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-apple-sm bg-apple-text flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JG
            </div>
            <div>
              <span className="font-bold text-apple-text tracking-tight text-base sm:text-lg">
                Painel Administrativo
              </span>
              <span className="hidden sm:inline-block text-xs text-apple-secondary ml-2 font-normal">
                JGcode Gestão & Cobrança
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-apple-text">{user?.name}</span>
              <span className="block text-[11px] text-apple-secondary">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Cards (Apple aesthetic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-apple-xl p-5 border border-gray-200/70 shadow-apple-sm">
            <div className="flex items-center justify-between text-apple-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total de Clientes</span>
              <Users size={16} className="text-apple-blue" />
            </div>
            <div className="text-2xl font-bold text-apple-text tracking-tight">{clients.length}</div>
            <span className="text-[11px] text-apple-secondary mt-1 block">Cadastrados no sistema</span>
          </div>

          <div className="bg-white rounded-apple-xl p-5 border border-gray-200/70 shadow-apple-sm">
            <div className="flex items-center justify-between text-apple-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Projetos Totais</span>
              <FolderKanban size={16} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-apple-text tracking-tight">{projects.length}</div>
            <span className="text-[11px] text-apple-secondary mt-1 block">Distribuídos entre clientes</span>
          </div>

          <div className="bg-white rounded-apple-xl p-5 border border-gray-200/70 shadow-apple-sm">
            <div className="flex items-center justify-between text-apple-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Recebido (Total)</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-apple-text tracking-tight">
              {formatCurrency(totalRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Mercado Pago & Manual</span>
          </div>

          <div className="bg-white rounded-apple-xl p-5 border border-gray-200/70 shadow-apple-sm">
            <div className="flex items-center justify-between text-apple-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              <span>A Receber / Aberto</span>
              <CreditCard size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-apple-text tracking-tight">
              {formatCurrency(pendingRevenue)}
            </div>
            <span className="text-[11px] text-amber-600 font-medium mt-1 block">Faturas pendentes Pix</span>
          </div>
        </div>

        {/* Section Header & Client Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-apple-text tracking-tight">
              Clientes Cadastrados
            </h2>
            <p className="text-xs text-apple-secondary">
              Selecione um cliente para gerenciar dados cadastrais, projetos técnicos e histórico financeiro.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-apple text-apple-text placeholder-gray-400 focus:outline-none focus:border-apple-blue w-48 sm:w-56"
              />
            </div>
            <Button size="sm" onClick={() => setIsClientModalOpen(true)}>
              <Plus size={14} className="mr-1.5" />
              Cadastrar Cliente
            </Button>
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-white rounded-apple-xl border border-gray-200/70 overflow-hidden shadow-apple-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-apple-secondary uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Nome / Razão Social</th>
                  <th className="py-3 px-4">CPF / CNPJ</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Projetos</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-apple-secondary">
                      {searchTerm
                        ? 'Nenhum cliente encontrado com esse termo de busca.'
                        : 'Nenhum cliente cadastrado no momento.'}
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((cli) => {
                    const clientProjects = projects.filter((p) => p.clientId === cli.id);
                    return (
                      <tr
                        key={cli.id}
                        onClick={() => navigate(`/admin/clientes/${cli.id}`)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-apple-text group-hover:text-apple-blue transition-colors">
                          {cli.name}
                          {cli.companyName && (
                            <span className="block text-xs font-normal text-apple-secondary">
                              {cli.companyName}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-apple-text">{cli.cpfCnpj}</td>
                        <td className="py-3.5 px-4 text-apple-secondary">{cli.email}</td>
                        <td className="py-3.5 px-4 text-apple-secondary">{cli.phone}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={cli.active ? 'success' : 'neutral'}>
                            {cli.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-apple-secondary">
                          <span className="bg-gray-100 text-apple-text px-2 py-0.5 rounded-full text-xs font-semibold">
                            {clientProjects.length} projeto(s)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-apple-blue group-hover:translate-x-1 transition-transform">
                            <span>Gerenciar Cliente</span>
                            <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Novo Cliente */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Cadastrar Novo Cliente"
        subtitle="Informe CPF ou CNPJ para permitir acesso à área do cliente"
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <Input
            label="Nome do Responsável *"
            required
            value={clientForm.name}
            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
            placeholder="Ex: João Silva ou Maria Souza"
          />
          <Input
            label="Razão Social / Nome Fantasia (Opcional)"
            value={clientForm.companyName}
            onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
            placeholder="Ex: JG Consultoria Ltda"
          />
          <Input
            label="CPF ou CNPJ (Usado no Login do Cliente) *"
            required
            value={clientForm.cpfCnpj}
            onChange={(e) => setClientForm({ ...clientForm, cpfCnpj: formatCpfCnpj(e.target.value) })}
            placeholder="Digite o CPF ou CNPJ"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail *"
              type="email"
              required
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              placeholder="cliente@email.com"
            />
            <Input
              label="Telefone / WhatsApp"
              value={clientForm.phone}
              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input
            label="Endereço Comercial"
            value={clientForm.address}
            onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
            placeholder="Cidade, Estado"
          />
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsClientModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar e Abrir Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
