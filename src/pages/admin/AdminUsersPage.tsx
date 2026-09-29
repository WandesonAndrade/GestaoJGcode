import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import type { SystemUser, AdminRole, UserStatus } from '../../types';
import { formatDateTime, formatPhone } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  FolderKanban,
  CreditCard,
  Headphones,
  UserCheck,
  Clock,
} from 'lucide-react';

const ROLE_INFO: Record<
  AdminRole,
  {
    label: string;
    description: string;
    badgeClass: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  SUPER_ADMIN: {
    label: 'Administrador Geral',
    description: 'Acesso total a clientes, finanças, configurações e equipe',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    icon: ShieldCheck,
  },
  PROJECT_MANAGER: {
    label: 'Gestor de Projetos',
    description: 'Gerencia escopo, status de desenvolvimento e entregas',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    icon: FolderKanban,
  },
  FINANCIAL: {
    label: 'Financeiro',
    description: 'Controle de planos, cobranças PIX e histórico de pagamentos',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    icon: CreditCard,
  },
  SUPPORT: {
    label: 'Suporte & Atendimento',
    description: 'Acompanhamento de demandas e consulta aos clientes',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    icon: Headphones,
  },
};

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Carregar Usuários
  const loadUsers = () => {
    setUsers(StorageService.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --- MODAL DE CRIAR / EDITAR USUÁRIO ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PROJECT_MANAGER' as AdminRole,
    status: 'ACTIVE' as UserStatus,
    password: '',
  });

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setShowPasswordInForm(false);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'PROJECT_MANAGER',
      status: 'ACTIVE',
      password: '',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (targetUser: SystemUser) => {
    setEditingUserId(targetUser.id);
    setShowPasswordInForm(false);
    setUserForm({
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone || '',
      role: targetUser.role,
      status: targetUser.status,
      password: targetUser.password || '',
    });
    setIsUserModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleGeneratePasswordForForm = () => {
    const pass = generateRandomPassword();
    setUserForm((prev) => ({ ...prev, password: pass }));
    setShowPasswordInForm(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.name.trim()) {
      showToast('Por favor, informe o nome do usuário.', 'error');
      return;
    }

    if (!userForm.email.trim() || !userForm.email.includes('@')) {
      showToast('Por favor, informe um e-mail corporativo válido.', 'error');
      return;
    }

    // Verificar e-mail duplicado
    const existing = StorageService.findUserByEmail(userForm.email);
    if (existing && existing.id !== editingUserId) {
      showToast('Já existe um usuário cadastrado com este e-mail.', 'error');
      return;
    }

    // Senha obrigatória para novo usuário
    if (!editingUserId && (!userForm.password || userForm.password.length < 6)) {
      showToast('A senha inicial deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    if (editingUserId) {
      StorageService.saveUser({
        id: editingUserId,
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone.trim(),
        role: userForm.role,
        status: userForm.status,
        password: userForm.password || undefined,
      });
      showToast('Usuário atualizado com sucesso!');
    } else {
      StorageService.saveUser({
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone.trim(),
        role: userForm.role,
        status: userForm.status,
        password: userForm.password,
      });
      showToast('Novo usuário criado com sucesso!');
    }

    setIsUserModalOpen(false);
    loadUsers();
  };

  // --- MODAL DE REDEFINIÇÃO DE SENHA ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleOpenPasswordModal = (targetUser: SystemUser) => {
    setTargetPasswordUser(targetUser);
    setNewPassword('');
    setShowNewPassword(false);
    setPasswordCopied(false);
    setIsPasswordModalOpen(true);
  };

  const handleGeneratePasswordForModal = () => {
    const pass = generateRandomPassword();
    setNewPassword(pass);
    setShowNewPassword(true);
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPasswordUser) return;

    if (!newPassword || newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    StorageService.updateUserPassword(targetPasswordUser.id, newPassword);
    showToast(`Senha de ${targetPasswordUser.name} redefinida com sucesso!`);
    setIsPasswordModalOpen(false);
    loadUsers();
  };

  // --- MODAL DE EXCLUSÃO ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetDeleteUser, setTargetDeleteUser] = useState<SystemUser | null>(null);

  const handleOpenDeleteModal = (targetUser: SystemUser) => {
    if (currentUser?.uid === targetUser.id) {
      showToast('Você não pode excluir o seu próprio usuário logado.', 'error');
      return;
    }
    setTargetDeleteUser(targetUser);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!targetDeleteUser) return;

    const res = StorageService.deleteUser(targetDeleteUser.id);
    if (res.success) {
      showToast(`Usuário ${targetDeleteUser.name} excluído.`);
      setIsDeleteModalOpen(false);
      loadUsers();
    } else {
      showToast(res.message || 'Erro ao excluir usuário.', 'error');
    }
  };

  // Alternar Status Ativo / Inativo
  const handleToggleStatus = (targetUser: SystemUser) => {
    if (currentUser?.uid === targetUser.id && targetUser.status === 'ACTIVE') {
      showToast('Você não pode inativar o seu próprio usuário.', 'error');
      return;
    }

    const res = StorageService.toggleUserStatus(targetUser.id);
    if (res.success && res.user) {
      const statusLabel = res.user.status === 'ACTIVE' ? 'ativado' : 'inativado';
      showToast(`Usuário ${res.user.name} foi ${statusLabel}.`);
      loadUsers();
    } else {
      showToast(res.message || 'Erro ao alterar status.', 'error');
    }
  };

  // Filtros
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm));

      const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRoleFilter, selectedStatusFilter]);

  // Contadores para métricas
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const superAdminsCount = users.filter((u) => u.role === 'SUPER_ADMIN').length;
  const teamMembersCount = users.filter((u) => u.role !== 'SUPER_ADMIN').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-apple-lg shadow-apple-lg border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-300" />
          ) : (
            <AlertTriangle size={16} className="text-rose-300" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-text">
              Gestão de Usuários
            </h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {totalUsers} {totalUsers === 1 ? 'membro' : 'membros'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-apple-secondary mt-1">
            Controle de acesso da equipe JGcode, níveis de permissão e credenciais corporativas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus size={15} className="mr-1.5" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white rounded-apple-lg p-4 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block">
              Total da Equipe
            </span>
            <span className="text-2xl font-bold text-apple-text mt-1 block">
              {totalUsers}
            </span>
          </div>
          <div className="w-10 h-10 rounded-apple bg-gray-100 text-gray-700 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        {/* Ativos */}
        <div className="bg-white rounded-apple-lg p-4 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block">
              Acessos Ativos
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">
                {activeUsers}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-apple bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white rounded-apple-lg p-4 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block">
              Admins Gerais
            </span>
            <span className="text-2xl font-bold text-indigo-700 mt-1 block">
              {superAdminsCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-apple bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Operação & Gestão */}
        <div className="bg-white rounded-apple-lg p-4 border border-gray-200/70 shadow-apple-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block">
              Gestão & Operação
            </span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block">
              {teamMembersCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-apple bg-blue-50 text-blue-700 flex items-center justify-center">
            <FolderKanban size={20} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-3.5 sm:p-4 rounded-apple-lg border border-gray-200/70 shadow-apple-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-apple text-apple-text placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro de Cargo */}
          <div className="flex items-center gap-1.5 text-xs text-apple-secondary">
            <span className="text-[11px] font-medium hidden sm:inline">Perfil:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-apple text-apple-text focus:outline-none focus:border-indigo-600 font-medium"
            >
              <option value="ALL">Todos os Perfis</option>
              <option value="SUPER_ADMIN">Administrador Geral</option>
              <option value="PROJECT_MANAGER">Gestor de Projetos</option>
              <option value="FINANCIAL">Financeiro</option>
              <option value="SUPPORT">Suporte & Atendimento</option>
            </select>
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-1.5 text-xs text-apple-secondary">
            <span className="text-[11px] font-medium hidden sm:inline">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-apple text-apple-text focus:outline-none focus:border-indigo-600 font-medium"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Apenas Ativos</option>
              <option value="INACTIVE">Apenas Inativos</option>
            </select>
          </div>

          {(searchTerm || selectedRoleFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRoleFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded transition-colors"
            >
              Redefinir Filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-apple-xl border border-gray-200/70 shadow-apple-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-bold text-apple-text">Nenhum usuário encontrado</h3>
            <p className="text-xs text-apple-secondary mt-1 max-w-sm mx-auto">
              Nenhum membro da equipe corresponde aos critérios de busca selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-apple-secondary font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Membro da Equipe</th>
                  <th className="py-3 px-4">Nível de Acesso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 hidden md:table-cell">Último Login</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Criado em</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((item) => {
                  const roleConfig = ROLE_INFO[item.role] || ROLE_INFO.PROJECT_MANAGER;
                  const RoleIcon = roleConfig.icon;
                  const isCurrent = currentUser?.uid === item.id || currentUser?.email === item.email;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Usuário: Avatar + Nome + Contato */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-apple-sm shrink-0 uppercase tracking-tight">
                            {item.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-apple-text text-sm">
                                {item.name}
                              </span>
                              {isCurrent && (
                                <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-apple-secondary text-[11px]">
                              <span className="inline-flex items-center gap-1">
                                <Mail size={11} className="text-gray-400" />
                                {item.email}
                              </span>
                              {item.phone && (
                                <span className="inline-flex items-center gap-1">
                                  <Phone size={11} className="text-gray-400" />
                                  {formatPhone(item.phone)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cargo / Nível */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-tight shadow-2xs whitespace-nowrap bg-white">
                          <span className={`p-1 rounded-full ${roleConfig.badgeClass}`}>
                            <RoleIcon size={12} />
                          </span>
                          <span className="text-apple-text">{roleConfig.label}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={isCurrent && item.status === 'ACTIVE'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          } ${isCurrent && item.status === 'ACTIVE' ? 'opacity-80 cursor-default' : ''}`}
                          title={
                            isCurrent && item.status === 'ACTIVE'
                              ? 'Você não pode desativar seu próprio acesso'
                              : `Clique para ${item.status === 'ACTIVE' ? 'desativar' : 'ativar'}`
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          <span>{item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span>
                        </button>
                      </td>

                      {/* Último Login */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-apple-secondary text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
                          <span>{formatDateTime(item.lastLoginAt)}</span>
                        </div>
                      </td>

                      {/* Criado em */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-apple-secondary text-[11px]">
                        {formatDateTime(item.createdAt)}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Redefinir Senha */}
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(item)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-apple transition-colors"
                            title="Redefinir Senha"
                          >
                            <KeyRound size={15} />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-gray-400 hover:text-apple-text hover:bg-gray-100 rounded-apple transition-colors"
                            title="Editar Dados do Usuário"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(item)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-apple transition-colors ${
                              isCurrent
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isCurrent ? 'Você não pode excluir a si mesmo' : 'Excluir Usuário'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR / EDITAR USUÁRIO                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUserId ? 'Editar Usuário da Equipe' : 'Cadastrar Novo Usuário'}
        subtitle="Defina o perfil de acesso e as credenciais corporativas do membro da equipe."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Ana Clara Santos"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail Corporativo *"
              type="email"
              placeholder="nome@jgcode.com"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98765-4321"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            />
          </div>

          {/* Seleção de Perfil / Cargo com Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary mb-2">
              Nível de Acesso / Perfil *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(ROLE_INFO) as AdminRole[]).map((r) => {
                const info = ROLE_INFO[r];
                const Icon = info.icon;
                const isSelected = userForm.role === r;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserForm({ ...userForm, role: r })}
                    className={`p-3 rounded-apple border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-apple-text">
                        {info.label}
                      </span>
                      <span className="block text-[11px] text-apple-secondary mt-0.5 leading-snug">
                        {info.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senha (obrigatória para novo, opcional para edição) */}
          <div className="bg-gray-50/70 p-3.5 rounded-apple border border-gray-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-apple-text">
                {editingUserId ? 'Alterar Senha de Acesso (Opcional)' : 'Senha de Acesso Inicial *'}
              </label>
              <button
                type="button"
                onClick={handleGeneratePasswordForForm}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Sparkles size={12} />
                Gerar Senha Segura
              </button>
            </div>

            <div className="relative">
              <input
                type={showPasswordInForm ? 'text' : 'password'}
                placeholder={
                  editingUserId
                    ? 'Deixe em branco para manter a senha atual'
                    : 'Mínimo de 6 caracteres'
                }
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-apple py-2 pl-3.5 pr-10 text-xs text-apple-text focus:outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswordInForm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {editingUserId && (
              <p className="text-[11px] text-apple-secondary">
                Preencha apenas se quiser substituir a senha existente deste usuário.
              </p>
            )}
          </div>

          {/* Status Inicial */}
          <div className="flex items-center justify-between p-3 rounded-apple bg-gray-50 border border-gray-200">
            <div>
              <span className="text-xs font-semibold text-apple-text block">
                Status da Conta
              </span>
              <span className="text-[11px] text-apple-secondary block">
                Contas inativas não conseguem realizar login no painel administrativo.
              </span>
            </div>
            <select
              value={userForm.status}
              onChange={(e) => setUserForm({ ...userForm, status: e.target.value as UserStatus })}
              className="py-1 px-2.5 text-xs bg-white border border-gray-200 rounded-apple text-apple-text font-semibold focus:outline-none focus:border-indigo-600"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUserModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: REDEFINIR SENHA                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Redefinir Senha de Acesso"
        subtitle={`Atualize as credenciais de ${targetPasswordUser?.name || 'usuário'}.`}
        maxWidth="md"
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          <div className="p-3 bg-indigo-50/60 rounded-apple border border-indigo-100 flex items-start gap-2.5">
            <KeyRound size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <span className="font-semibold block">{targetPasswordUser?.name}</span>
              <span className="text-[11px] text-indigo-700 font-mono">
                {targetPasswordUser?.email}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-apple-text">
                Nova Senha de Acesso *
              </label>
              <button
                type="button"
                onClick={handleGeneratePasswordForModal}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Sparkles size={12} />
                Gerar Senha Aleatória
              </button>
            </div>

            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Digite a nova senha (mínimo 6 dígitos)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-apple py-2.5 pl-3.5 pr-20 text-xs text-apple-text font-mono focus:outline-none focus:border-indigo-600 shadow-2xs"
                required
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                {newPassword && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                    title="Copiar Senha"
                  >
                    {passwordCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title={showNewPassword ? 'Ocultar' : 'Exibir'}
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {passwordCopied && (
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                Senha copiada para a área de transferência!
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Confirmar Nova Senha
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR EXCLUSÃO DE USUÁRIO                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-apple border border-rose-100">
            <ShieldAlert size={24} className="shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">Atenção</span>
              <span>Esta operação removerá o acesso deste membro permanentemente.</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-apple border border-gray-200/80 text-xs">
            <span className="text-apple-secondary block text-[11px]">Usuário a ser removido:</span>
            <span className="font-bold text-apple-text block mt-0.5">
              {targetDeleteUser?.name}
            </span>
            <span className="text-apple-secondary font-mono text-[11px] block">
              {targetDeleteUser?.email}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Excluir Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
