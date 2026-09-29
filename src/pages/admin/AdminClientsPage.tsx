import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import type { Client, Project } from '../../types';
import { formatCpfCnpj } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Plus,
  ChevronRight,
  Search,
} from 'lucide-react';

export const AdminClientsPage: React.FC = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header da Página de Clientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-text">
              Clientes
            </h1>
            <span className="bg-gray-100 text-apple-text text-xs font-bold px-2.5 py-0.5 rounded-full">
              {clients.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-apple-secondary mt-1">
            Selecione um cliente para gerenciar projetos, infraestrutura técnica e faturamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-apple text-apple-text placeholder-gray-400 focus:outline-none focus:border-apple-blue w-56 sm:w-64 shadow-apple-sm"
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
                  <td colSpan={7} className="py-12 text-center text-xs text-apple-secondary space-y-2">
                    <Users size={32} className="mx-auto text-gray-300" />
                    <p className="font-semibold text-apple-text">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </p>
                    <p>
                      {searchTerm
                        ? 'Tente buscar com outro termo ou limpe o campo de busca.'
                        : 'Clique em "Cadastrar Cliente" para adicionar o primeiro.'}
                    </p>
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
