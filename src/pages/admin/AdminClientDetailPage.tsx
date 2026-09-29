import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import type { Client, Project, Payment, ServiceType, PaymentPlanType, ProjectStatus, DomainManagementType } from '../../types';
import { formatCurrency, formatDate, formatCpfCnpj } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { PixPaymentModal } from '../../components/payment/PixPaymentModal';
import { ProjectStatusBadge } from '../../components/project/ProjectStatusBadge';
import { ProjectProgressStepper } from '../../components/project/ProjectProgressStepper';
import { ProjectTechDetailsBlock } from '../../components/project/ProjectTechDetailsBlock';
import {
  DEPLOY_PLATFORMS,
  DATABASE_OPTIONS,
  EMAIL_PROVIDERS,
  DNS_PROVIDERS,
} from '../../utils/technicalSpecs';
import {
  ArrowLeft,
  User,
  FolderKanban,
  CreditCard,
  Plus,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Check,
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Calendar,
  Pencil,
} from 'lucide-react';

export const AdminClientDetailPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'projects' | 'finance'>('info');

  // Mensagem de feedback
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Form de edição cadastral
  const [editForm, setEditForm] = useState({
    name: '',
    companyName: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    address: '',
    active: true,
  });

  // Modal Novo Projeto & Forma de Pagamento
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    serviceType: 'SITE' as ServiceType,
    status: 'SETUP_INICIAL' as ProjectStatus,
    publishedLink: '',
    publicationNotes: '',
    imageUrl: '',
    // Infraestrutura Técnica e Domínio
    deployPlatform: 'Vercel',
    domainName: '',
    domainManagement: 'JGCODE_RESPONSAVEL' as DomainManagementType,
    dnsProvider: 'Cloudflare',
    database: 'Firebase Firestore',
    emailProvider: 'Titan Mail',
    // Forma de Pagamento
    paymentType: 'RECORRENTE' as PaymentPlanType,
    amount: '',
    installments: '3',
    dueDate: new Date().toISOString().split('T')[0],
  });

  // Modal Nova Cobrança Avulsa
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    projectId: '',
    title: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  // Modal Pix QR Code para visualização pelo Admin
  const [selectedPaymentForPix, setSelectedPaymentForPix] = useState<Payment | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  const loadData = () => {
    if (!clientId) return;
    const foundClient = StorageService.getClientById(clientId);
    if (!foundClient) {
      navigate('/admin');
      return;
    }
    setClient(foundClient);
    setEditForm({
      name: foundClient.name,
      companyName: foundClient.companyName || '',
      cpfCnpj: foundClient.cpfCnpj,
      email: foundClient.email,
      phone: foundClient.phone,
      address: foundClient.address || '',
      active: foundClient.active,
    });
    setProjects(StorageService.getProjects(clientId));
    setPayments(StorageService.getPayments(clientId));
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  // Atualizar Cadastro do Cliente
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    StorageService.saveClient({
      id: client.id,
      ...editForm,
    });

    setSaveSuccessMessage('Dados cadastrais atualizados com sucesso!');
    setTimeout(() => setSaveSuccessMessage(''), 4000);
    loadData();
  };

  // Abrir Modal para Criar Novo Projeto
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectForm({
      name: '',
      description: '',
      serviceType: 'SITE',
      status: 'SETUP_INICIAL',
      publishedLink: '',
      publicationNotes: '',
      imageUrl: '',
      deployPlatform: 'Vercel',
      domainName: '',
      domainManagement: 'JGCODE_RESPONSAVEL',
      dnsProvider: 'Cloudflare',
      database: 'Firebase Firestore',
      emailProvider: 'Titan Mail',
      paymentType: 'RECORRENTE',
      amount: '',
      installments: '3',
      dueDate: new Date().toISOString().split('T')[0],
    });
    setIsProjectModalOpen(true);
  };

  // Abrir Modal para Editar Projeto Existente
  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      name: proj.name,
      description: proj.description || '',
      serviceType: proj.serviceType,
      status: proj.status,
      publishedLink: proj.publishedLink || '',
      publicationNotes: proj.publicationNotes || '',
      imageUrl: proj.imageUrl || '',
      deployPlatform: proj.technicalDetails?.deployPlatform || 'Vercel',
      domainName: proj.technicalDetails?.domainName || '',
      domainManagement: proj.technicalDetails?.domainManagement || 'JGCODE_RESPONSAVEL',
      dnsProvider: proj.technicalDetails?.dnsProvider || 'Cloudflare',
      database: proj.technicalDetails?.database || 'Firebase Firestore',
      emailProvider: proj.technicalDetails?.emailProvider || 'Titan Mail',
      paymentType: 'RECORRENTE',
      amount: '',
      installments: '3',
      dueDate: new Date().toISOString().split('T')[0],
    });
    setIsProjectModalOpen(true);
  };

  // Cadastrar ou Editar Projeto com Forma de Pagamento
  const handleSaveProjectAndPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    // 1. Salvar ou Atualizar Projeto
    const targetProj = StorageService.saveProject({
      ...(editingProject ? { id: editingProject.id } : {}),
      clientId: client.id,
      clientName: client.name,
      name: projectForm.name,
      description: projectForm.description,
      serviceType: projectForm.serviceType,
      status: projectForm.status || 'SETUP_INICIAL',
      publishedLink: projectForm.publishedLink,
      publicationNotes: projectForm.publicationNotes,
      imageUrl:
        projectForm.imageUrl ||
        (editingProject?.imageUrl ||
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'),
      technicalDetails: {
        deployPlatform: projectForm.deployPlatform,
        domainName: projectForm.domainName,
        domainManagement: projectForm.domainManagement,
        dnsProvider: projectForm.dnsProvider,
        database: projectForm.database,
        emailProvider: projectForm.emailProvider,
        technicalNotes: projectForm.publicationNotes,
      },
    });

    // Se o nome do projeto mudou durante a edição, atualizar nome nos pagamentos associados
    if (editingProject && editingProject.name !== projectForm.name) {
      const allPays = StorageService.getPayments();
      const updatedPays = allPays.map((p) =>
        p.projectId === editingProject.id ? { ...p, projectName: projectForm.name } : p
      );
      localStorage.setItem('jgcode_payments', JSON.stringify(updatedPays));
    }

    // 2. Salvar Plano de Pagamento e Gerar Faturas correspondentes (apenas se valor for informado)
    const valAmount = parseFloat(projectForm.amount.replace(',', '.')) || 0;
    if (valAmount > 0) {
      const plan = StorageService.savePlan({
        clientId: client.id,
        projectId: targetProj.id,
        projectName: targetProj.name,
        type: projectForm.paymentType,
        totalAmount: valAmount,
        installments: projectForm.paymentType === 'PARCELADO' ? parseInt(projectForm.installments) : undefined,
      });

      const allPays = StorageService.getPayments();

      if (projectForm.paymentType === 'AVISTA') {
        allPays.unshift({
          id: `pay-${Date.now()}`,
          planId: plan.id,
          projectId: targetProj.id,
          projectName: targetProj.name,
          clientId: client.id,
          title: `Pagamento À Vista - ${targetProj.name}`,
          amount: valAmount,
          installmentLabel: 'Pagamento Único',
          dueDate: projectForm.dueDate,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      } else if (projectForm.paymentType === 'PARCELADO') {
        const numInstallments = parseInt(projectForm.installments) || 3;
        const installmentVal = valAmount / numInstallments;

        for (let i = 1; i <= numInstallments; i++) {
          const due = new Date(projectForm.dueDate);
          due.setMonth(due.getMonth() + (i - 1));
          allPays.unshift({
            id: `pay-${Date.now()}-${i}`,
            planId: plan.id,
            projectId: targetProj.id,
            projectName: targetProj.name,
            clientId: client.id,
            title: `Parcela ${i}/${numInstallments} - ${targetProj.name}`,
            amount: installmentVal,
            installmentLabel: `Parcela ${i} de ${numInstallments}`,
            dueDate: due.toISOString().split('T')[0],
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // RECORRENTE
        allPays.unshift({
          id: `pay-${Date.now()}`,
          planId: plan.id,
          projectId: targetProj.id,
          projectName: targetProj.name,
          clientId: client.id,
          title: `Mensalidade - ${targetProj.name}`,
          amount: valAmount,
          installmentLabel: 'Mensalidade',
          dueDate: projectForm.dueDate,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem('jgcode_payments', JSON.stringify(allPays));
    }

    setEditingProject(null);
    setIsProjectModalOpen(false);
    setSaveSuccessMessage(
      editingProject ? 'Projeto atualizado com sucesso!' : 'Projeto cadastrado com sucesso!'
    );
    setTimeout(() => setSaveSuccessMessage(''), 4000);
    loadData();
    setActiveTab('projects');
  };

  // Alterar Fase do Projeto
  const handleUpdateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
    StorageService.updateProjectStatus(projectId, newStatus);
    loadData();
  };

  // Criar Cobrança Avulsa
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const valAmount = parseFloat(invoiceForm.amount.replace(',', '.')) || 0;
    const proj = projects.find((p) => p.id === invoiceForm.projectId);
    const allPays = StorageService.getPayments();

    allPays.unshift({
      id: `pay-${Date.now()}`,
      planId: `plan-${Date.now()}`,
      projectId: invoiceForm.projectId || '',
      projectName: proj?.name || 'Serviço Avulso',
      clientId: client.id,
      title: invoiceForm.title,
      amount: valAmount,
      installmentLabel: 'Fatura Avulsa',
      dueDate: invoiceForm.dueDate,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem('jgcode_payments', JSON.stringify(allPays));
    setIsInvoiceModalOpen(false);
    setInvoiceForm({
      projectId: '',
      title: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
    });
    loadData();
  };

  // Baixa Manual
  const handleMarkPaymentManual = (paymentId: string) => {
    StorageService.markAsManual(paymentId);
    loadData();
  };

  if (!client) return null;

  // Cálculos Financeiros
  const totalBilled = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = payments
    .filter((p) => p.status === 'PAID' || p.status === 'MANUAL')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header / Breadcrumb - Apple Inspired */}
      <header className="sticky top-0 z-20 glass border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/clientes')}
              className="p-2 text-apple-secondary hover:text-apple-text hover:bg-gray-100 rounded-apple transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft size={16} />
              <span>Clientes</span>
            </button>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-apple-text tracking-tight text-sm sm:text-base">
                {client.name}
              </span>
              <Badge variant={client.active ? 'success' : 'neutral'}>
                {client.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-apple-secondary font-mono">{client.cpfCnpj}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Client Summary Header Card */}
        <div className="bg-white rounded-apple-xl p-6 border border-gray-200/80 shadow-apple-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-apple-text">{client.name}</h1>
              {client.companyName && (
                <span className="text-xs text-apple-secondary px-2 py-0.5 bg-gray-100 rounded-apple-sm font-medium">
                  {client.companyName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-apple-secondary pt-1">
              <span className="flex items-center gap-1 font-mono font-medium text-apple-text">
                <Building size={14} className="text-apple-blue" />
                {client.cpfCnpj}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={14} />
                {client.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {client.phone}
              </span>
              {client.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {client.address}
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
            <div className="bg-gray-50 px-4 py-2.5 rounded-apple text-center border border-gray-100">
              <span className="block text-[11px] uppercase tracking-wider text-apple-secondary font-semibold">
                Projetos
              </span>
              <span className="text-lg font-bold text-apple-text">{projects.length}</span>
            </div>
            <div className="bg-gray-50 px-4 py-2.5 rounded-apple text-center border border-gray-100">
              <span className="block text-[11px] uppercase tracking-wider text-apple-secondary font-semibold">
                Quitado
              </span>
              <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="bg-gray-50 px-4 py-2.5 rounded-apple text-center border border-gray-100">
              <span className="block text-[11px] uppercase tracking-wider text-apple-secondary font-semibold">
                Em Aberto
              </span>
              <span className="text-lg font-bold text-amber-600">{formatCurrency(totalPending)}</span>
            </div>
          </div>
        </div>

        {/* 3 Tabs de Gerenciamento do Cliente */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-5 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-apple-blue text-apple-blue'
                : 'border-transparent text-apple-secondary hover:text-apple-text'
            }`}
          >
            <User size={15} />
            <span>Informações de Cadastro</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-5 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-apple-blue text-apple-blue'
                : 'border-transparent text-apple-secondary hover:text-apple-text'
            }`}
          >
            <FolderKanban size={15} />
            <span>Gestão de Projetos ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3 px-5 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'finance'
                ? 'border-apple-blue text-apple-blue'
                : 'border-transparent text-apple-secondary hover:text-apple-text'
            }`}
          >
            <CreditCard size={15} />
            <span>Histórico Financeiro ({payments.length})</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* ABA 1: INFORMAÇÕES DE CADASTRO                            */}
        {/* ========================================================= */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-apple-xl p-6 border border-gray-200/80 shadow-apple-sm max-w-4xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-apple-text tracking-tight">
                Dados Cadastrais do Cliente
              </h2>
              <p className="text-xs text-apple-secondary">
                Essas informações identificam o cliente e são utilizadas para acesso à Área do Cliente.
              </p>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-apple text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do Responsável / Contato *"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <Input
                  label="Razão Social / Nome Fantasia"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="CPF ou CNPJ (Login de Acesso do Cliente) *"
                  required
                  value={editForm.cpfCnpj}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cpfCnpj: formatCpfCnpj(e.target.value) })
                  }
                  helperText="O cliente utiliza este documento para acessar sua área"
                />
                <Input
                  label="E-mail Principal *"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone / WhatsApp"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
                    Status da Conta
                  </label>
                  <select
                    value={editForm.active ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditForm({ ...editForm, active: e.target.value === 'true' })
                    }
                    className="w-full bg-white border border-gray-200 text-apple-text text-sm rounded-apple py-2.5 px-3 focus:outline-none focus:border-apple-blue"
                  >
                    <option value="true">Ativo (Acesso Liberado)</option>
                    <option value="false">Inativo (Acesso Bloqueado)</option>
                  </select>
                </div>
              </div>

              <Input
                label="Endereço Comercial"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />

              <div className="pt-2 text-xs text-apple-secondary">
                <p>
                  Data de cadastro no sistema: <strong className="text-apple-text">{formatDate(client.createdAt)}</strong>
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit">
                  <Save size={15} className="mr-1.5" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: GESTÃO DE PROJETOS & FORMA DE PAGAMENTO            */}
        {/* ========================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-apple-text tracking-tight">
                  Projetos & Serviços Contratados
                </h2>
                <p className="text-xs text-apple-secondary">
                  Cadastre novos projetos e vincule diretamente a forma de pagamento (À Vista, Parcelado ou Recorrente).
                </p>
              </div>
              <Button size="sm" onClick={handleOpenCreateProject}>
                <Plus size={14} className="mr-1.5" />
                Cadastrar Projeto & Pagamento
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-apple-xl p-8 text-center border border-gray-100 shadow-apple-sm space-y-3">
                <FolderKanban size={36} className="mx-auto text-gray-400" />
                <h3 className="font-semibold text-apple-text text-sm">Nenhum projeto cadastrado para este cliente</h3>
                <p className="text-xs text-apple-secondary max-w-sm mx-auto">
                  Clique no botão acima para cadastrar o primeiro serviço (Site, Google Meu Negócio, E-mail, etc.) junto com as condições de pagamento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj) => {
                  const projectPayments = payments.filter((p) => p.projectId === proj.id);
                  const projPaid = projectPayments
                    .filter((p) => p.status === 'PAID' || p.status === 'MANUAL')
                    .reduce((acc, curr) => acc + curr.amount, 0);

                  return (
                    <div
                      key={proj.id}
                      className="bg-white rounded-apple-xl border border-gray-200/80 overflow-hidden shadow-apple-sm flex flex-col justify-between"
                    >
                      {proj.imageUrl && (
                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                          <img
                            src={proj.imageUrl}
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            <Badge variant="info">{proj.serviceType}</Badge>
                            <ProjectStatusBadge status={proj.status} />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(proj)}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-apple-text text-xs font-semibold px-2.5 py-1 rounded-apple shadow-apple-sm flex items-center gap-1 transition-all backdrop-blur-sm cursor-pointer"
                            title="Editar Projeto"
                          >
                            <Pencil size={12} className="text-apple-blue" />
                            <span>Editar</span>
                          </button>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            {!proj.imageUrl ? (
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge variant="info">{proj.serviceType}</Badge>
                                <ProjectStatusBadge status={proj.status} />
                              </div>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2.5 hover:border-apple-blue hover:text-apple-blue ml-auto"
                              onClick={() => handleOpenEditProject(proj)}
                            >
                              <Pencil size={12} className="mr-1 text-apple-blue" />
                              Editar
                            </Button>
                          </div>
                          <h3 className="font-bold text-apple-text text-base">{proj.name}</h3>
                          <p className="text-xs text-apple-secondary leading-relaxed line-clamp-2">
                            {proj.description}
                          </p>

                          {/* Stepper de Progresso da Fase */}
                          <div className="pt-1">
                            <ProjectProgressStepper currentStatus={proj.status} compact={true} />
                          </div>
                        </div>

                        {/* Alterador Rápido de Fase pelo Administrador */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block shrink-0">
                              Fase Atual:
                            </label>
                            <select
                              value={proj.status}
                              onChange={(e) =>
                                handleUpdateProjectStatus(proj.id, e.target.value as ProjectStatus)
                              }
                              className="bg-gray-50 border border-gray-200 text-apple-text text-xs rounded-apple py-1 px-2 font-medium focus:outline-none focus:border-apple-blue"
                            >
                              <option value="PROPOSTA">1. Proposta Comercial</option>
                              <option value="SETUP_INICIAL">2. Setup Inicial</option>
                              <option value="EM_DESENVOLVIMENTO">3. Em Desenvolvimento</option>
                              <option value="FASE_FINAL">4. Fase Final / Revisão</option>
                              <option value="ENTREGUE">5. Entregue & Publicado</option>
                            </select>
                          </div>

                          {/* Bloco de Infraestrutura e Domínio */}
                          <ProjectTechDetailsBlock tech={proj.technicalDetails} />

                          {/* Informações de Publicação */}
                          {proj.publicationNotes && (
                            <div className="bg-gray-50 rounded-apple p-2.5 text-xs text-gray-600">
                              <span className="font-semibold block text-apple-text mb-0.5">
                                Notas Adicionais:
                              </span>
                              {proj.publicationNotes}
                            </div>
                          )}

                          {proj.publishedLink ? (
                            <a
                              href={proj.publishedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-semibold text-apple-blue hover:underline pt-1"
                            >
                              <span>Acessar Link Publicado</span>
                              <ExternalLink size={12} className="ml-1" />
                            </a>
                          ) : (
                            <span className="text-xs text-apple-secondary block pt-1">
                              Em fase de publicação
                            </span>
                          )}

                          <div className="pt-2 flex items-center justify-between text-xs text-apple-secondary border-t border-gray-100">
                            <span>Faturado: {formatCurrency(projPaid)}</span>
                            <span className="font-medium text-apple-text">
                              {projectPayments.length} cobrança(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: HISTÓRICO FINANCEIRO DO CLIENTE                    */}
        {/* ========================================================= */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-apple-text tracking-tight">
                  Extrato & Histórico Financeiro
                </h2>
                <p className="text-xs text-apple-secondary">
                  Histórico de todas as faturas, parcelas, pagamentos Pix e baixas manuais deste cliente.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsInvoiceModalOpen(true)}>
                <Plus size={14} className="mr-1.5" />
                Nova Fatura / Cobrança
              </Button>
            </div>

            {/* KPI Cards Financeiros do Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-apple-xl p-4 border border-gray-200/70 shadow-apple-sm">
                <span className="text-[11px] font-semibold text-apple-secondary uppercase tracking-wider block">
                  Total Faturado
                </span>
                <span className="text-xl font-bold text-apple-text mt-1 block">
                  {formatCurrency(totalBilled)}
                </span>
                <span className="text-[11px] text-apple-secondary">{payments.length} cobrança(s) no total</span>
              </div>

              <div className="bg-white rounded-apple-xl p-4 border border-emerald-200/70 shadow-apple-sm bg-emerald-50/20">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Total Quitado / Pago
                </span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">
                  {formatCurrency(totalPaid)}
                </span>
                <span className="text-[11px] text-emerald-600">Recebido via Pix ou Baixa Manual</span>
              </div>

              <div className="bg-white rounded-apple-xl p-4 border border-amber-200/70 shadow-apple-sm bg-amber-50/20">
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                  Total Pendente / Em Aberto
                </span>
                <span className="text-xl font-bold text-amber-600 mt-1 block">
                  {formatCurrency(totalPending)}
                </span>
                <span className="text-[11px] text-amber-600">Disponível para pagamento pelo cliente</span>
              </div>
            </div>

            {/* Tabela de Faturas */}
            <div className="bg-white rounded-apple-xl border border-gray-200/70 overflow-hidden shadow-apple-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-apple-secondary uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Descrição da Cobrança</th>
                      <th className="py-3 px-4">Projeto</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4">Valor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações do Administrador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-apple-secondary">
                          Nenhuma cobrança registrada para este cliente.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-apple-text">
                            {p.title}
                            {p.installmentLabel && (
                              <span className="block text-xs font-normal text-apple-secondary">
                                Ref: {p.installmentLabel}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-apple-secondary">{p.projectName || '-'}</td>
                          <td className="py-3.5 px-4 text-apple-secondary flex items-center gap-1 mt-3">
                            <Calendar size={13} />
                            {formatDate(p.dueDate)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-apple-text">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            {p.status === 'PAID' && <Badge variant="success">Pago (Pix MP)</Badge>}
                            {p.status === 'MANUAL' && <Badge variant="success">Pago Manual</Badge>}
                            {p.status === 'PENDING' && <Badge variant="warning">Pendente</Badge>}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {p.status === 'PENDING' ? (
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    setSelectedPaymentForPix(p);
                                    setIsPixModalOpen(true);
                                  }}
                                  title="Ver QR Code Pix"
                                >
                                  <QrCode size={13} className="mr-1 text-apple-blue" />
                                  Pix
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleMarkPaymentManual(p.id)}
                                >
                                  <Check size={13} className="mr-1 text-emerald-600" />
                                  Baixar Manual
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                                <CheckCircle2 size={13} /> Quitado em {formatDate(p.paidAt || p.dueDate)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Cadastrar ou Editar Projeto */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Editar Informações do Projeto' : 'Cadastrar Projeto & Forma de Pagamento'}
        subtitle={
          editingProject
            ? `Editando: ${editingProject.name} (Cliente: ${client.name})`
            : `Cliente: ${client.name}`
        }
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveProjectAndPlan} className="flex flex-col h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
            {/* Coluna 1: Dados do Serviço & Infraestrutura */}
            <div className="space-y-4">
              <div className="bg-blue-50/70 p-3 rounded-apple border border-blue-100 text-xs text-apple-text">
                <span className="font-semibold block text-apple-blue mb-0.5">
                  {editingProject ? 'Dados do Projeto & Infraestrutura' : 'Etapa 1: Dados do Serviço'}
                </span>
                {editingProject
                  ? 'Atualize os dados, escopo, status e configurações de infraestrutura'
                  : 'Preencha os dados do projeto publicado ou em andamento'}
              </div>

              <Input
                label="Nome do Projeto / Serviço *"
                required
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Ex: Otimização Google Meu Negócio ou Site Institucional"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
                    Tipo de Serviço *
                  </label>
                  <select
                    value={projectForm.serviceType}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, serviceType: e.target.value as ServiceType })
                    }
                    className="w-full bg-white border border-gray-200 text-apple-text text-sm rounded-apple py-2 px-3 focus:outline-none focus:border-apple-blue"
                  >
                    <option value="SITE">Website / Landing Page</option>
                    <option value="GMB">Google Meu Negócio</option>
                    <option value="EMAIL_PRO">E-mail Profissional</option>
                    <option value="SISTEMA">Sistema Web Personalizado</option>
                    <option value="CONSULTORIA">Consultoria Tecnológica</option>
                    <option value="OUTRO">Outro Serviço</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
                    Fase do Projeto *
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, status: e.target.value as ProjectStatus })
                    }
                    className="w-full bg-white border border-gray-200 text-apple-text text-sm rounded-apple py-2 px-3 focus:outline-none focus:border-apple-blue font-medium"
                  >
                    <option value="PROPOSTA">1. Proposta Comercial</option>
                    <option value="SETUP_INICIAL">2. Setup Inicial</option>
                    <option value="EM_DESENVOLVIMENTO">3. Em Desenvolvimento</option>
                    <option value="FASE_FINAL">4. Fase Final / Revisão</option>
                    <option value="ENTREGUE">5. Entregue & Publicado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
                  Descrição do Escopo
                </label>
                <textarea
                  rows={2}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Descreva o que está incluso no serviço..."
                  className="w-full bg-white border border-gray-200 text-apple-text text-sm rounded-apple p-2.5 focus:outline-none focus:border-apple-blue resize-none"
                />
              </div>

              {/* Bloco de Infraestrutura Técnica & Domínio */}
              <div className="bg-gray-50/80 p-3.5 rounded-apple border border-gray-200/80 space-y-3">
                <span className="text-[11px] font-bold text-apple-text uppercase tracking-wider block">
                  Infraestrutura, Deploy & Domínio
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-semibold text-apple-secondary">
                      Onde foi feito o Deploy?
                    </label>
                    <select
                      value={projectForm.deployPlatform}
                      onChange={(e) => setProjectForm({ ...projectForm, deployPlatform: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-apple-text text-xs rounded-apple py-2 px-2.5 focus:outline-none focus:border-apple-blue"
                    >
                      {DEPLOY_PLATFORMS.map((plat) => (
                        <option key={plat} value={plat}>
                          {plat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-semibold text-apple-secondary">
                      Banco de Dados
                    </label>
                    <select
                      value={projectForm.database}
                      onChange={(e) => setProjectForm({ ...projectForm, database: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-apple-text text-xs rounded-apple py-2 px-2.5 focus:outline-none focus:border-apple-blue"
                    >
                      {DATABASE_OPTIONS.map((db) => (
                        <option key={db} value={db}>
                          {db}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nome do Domínio"
                    value={projectForm.domainName}
                    onChange={(e) => setProjectForm({ ...projectForm, domainName: e.target.value })}
                    placeholder="Ex: paodeouro.com.br"
                    className="text-xs py-1.5"
                  />

                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-semibold text-apple-secondary">
                      Gestão do Domínio *
                    </label>
                    <select
                      value={projectForm.domainManagement}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          domainManagement: e.target.value as DomainManagementType,
                        })
                      }
                      className="w-full bg-white border border-gray-200 text-apple-text text-xs rounded-apple py-2 px-2.5 focus:outline-none focus:border-apple-blue"
                    >
                      <option value="JGCODE_RESPONSAVEL">Registrado pela JGcode (Nossa Responsabilidade)</option>
                      <option value="CLIENTE_COM_ACESSO">Cliente possui e forneceu acessos (DNS)</option>
                      <option value="CLIENTE_SEM_ACESSO">Cliente gerencia (Passamos apontamentos)</option>
                      <option value="NAO_APLICA">Não se aplica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-semibold text-apple-secondary">
                      Provedor de DNS
                    </label>
                    <select
                      value={projectForm.dnsProvider}
                      onChange={(e) => setProjectForm({ ...projectForm, dnsProvider: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-apple-text text-xs rounded-apple py-2 px-2.5 focus:outline-none focus:border-apple-blue"
                    >
                      {DNS_PROVIDERS.map((dns) => (
                        <option key={dns} value={dns}>
                          {dns}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-semibold text-apple-secondary">
                      Serviço de E-mail
                    </label>
                    <select
                      value={projectForm.emailProvider}
                      onChange={(e) => setProjectForm({ ...projectForm, emailProvider: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-apple-text text-xs rounded-apple py-2 px-2.5 focus:outline-none focus:border-apple-blue"
                    >
                      {EMAIL_PROVIDERS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  label="Link do Projeto Publicado (URL)"
                  value={projectForm.publishedLink}
                  onChange={(e) => setProjectForm({ ...projectForm, publishedLink: e.target.value })}
                  placeholder="https://maps.google.com/... ou site"
                />
                <Input
                  label="Notas de Publicação / Detalhes de Entrega"
                  value={projectForm.publicationNotes}
                  onChange={(e) => setProjectForm({ ...projectForm, publicationNotes: e.target.value })}
                  placeholder="Ex: Verificado com 45 fotos ou DNS apontado no Cloudflare"
                />
              </div>
            </div>

            {/* Coluna 2: Forma de Pagamento */}
            <div className="space-y-3.5">
              <div className="bg-emerald-50/70 p-3 rounded-apple border border-emerald-100 text-xs text-apple-text">
                <span className="font-semibold block text-emerald-700 mb-0.5">
                  {editingProject ? 'Cobrança do Projeto (Opcional ao Editar)' : 'Etapa 2: Forma de Pagamento do Projeto'}
                </span>
                {editingProject
                  ? 'Deixe o valor em branco para manter as faturas existentes sem gerar novas cobranças.'
                  : 'Defina as faturas que serão geradas para este cliente'}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
                  Modalidade de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['AVISTA', 'PARCELADO', 'RECORRENTE'] as PaymentPlanType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setProjectForm({ ...projectForm, paymentType: t })}
                      className={`py-2 px-1 text-xs font-semibold rounded-apple border transition-all text-center ${
                        projectForm.paymentType === t
                          ? 'border-apple-blue bg-blue-50/70 text-apple-blue shadow-sm'
                          : 'border-gray-200 bg-white text-apple-secondary hover:border-gray-300'
                      }`}
                    >
                      {t === 'AVISTA' && 'À Vista'}
                      {t === 'PARCELADO' && 'Parcelado'}
                      {t === 'RECORRENTE' && 'Recorrente'}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label={editingProject ? 'Gerar Nova Cobrança (R$) - Opcional' : 'Valor Total / Mensal (R$) *'}
                required={!editingProject}
                value={projectForm.amount}
                onChange={(e) => setProjectForm({ ...projectForm, amount: e.target.value })}
                placeholder={editingProject ? 'Deixe em branco para não gerar novas faturas' : 'Ex: 250,00 ou 1500,00'}
              />

              {projectForm.paymentType === 'PARCELADO' ? (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Qtd. de Parcelas"
                    type="number"
                    min="2"
                    max="24"
                    value={projectForm.installments}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, installments: e.target.value })
                    }
                  />
                  <Input
                    label="1º Vencimento"
                    type="date"
                    value={projectForm.dueDate}
                    onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                  />
                </div>
              ) : (
                <Input
                  label="Data de Vencimento"
                  type="date"
                  value={projectForm.dueDate}
                  onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                />
              )}

              {/* Box de Resumo Automático da Condição de Pagamento */}
              <div className="p-3 bg-gray-50 rounded-apple border border-gray-200/80 text-xs space-y-1">
                <span className="font-semibold text-apple-text block">Resumo Financeiro:</span>
                {editingProject && !projectForm.amount ? (
                  <p className="text-apple-secondary">
                    As faturas existentes deste projeto serão preservadas. Nenhuma nova cobrança será criada.
                  </p>
                ) : (
                  <>
                    {projectForm.paymentType === 'AVISTA' && (
                      <p className="text-apple-secondary">
                        Gera cobrança única de <strong className="text-apple-text">{projectForm.amount ? `R$ ${projectForm.amount}` : 'R$ 0,00'}</strong> no vencimento.
                      </p>
                    )}
                    {projectForm.paymentType === 'PARCELADO' && (
                      <p className="text-apple-secondary">
                        Gera <strong className="text-apple-text">{projectForm.installments || 3} parcelas mensais</strong> calculadas automaticamente.
                      </p>
                    )}
                    {projectForm.paymentType === 'RECORRENTE' && (
                      <p className="text-apple-secondary">
                        Gera cobrança mensal recorrente de <strong className="text-apple-text">{projectForm.amount ? `R$ ${projectForm.amount}` : 'R$ 0,00'}</strong> para suporte contínuo.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Ações Fixa no Rodapé (Nunca fica cortada) */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md -mx-5 -mb-4 px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2.5 z-10 shrink-0">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsProjectModalOpen(false);
                setEditingProject(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingProject ? 'Salvar Alterações do Projeto' : 'Cadastrar Projeto & Gerar Cobrança'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Nova Fatura Avulsa */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Gerar Cobrança / Fatura Avulsa"
        subtitle={`Cliente: ${client.name}`}
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4">
          <Input
            label="Título da Cobrança *"
            required
            value={invoiceForm.title}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
            placeholder="Ex: Suporte Extra ou Manutenção de Domínio"
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-apple-secondary">
              Vincular a um Projeto (Opcional)
            </label>
            <select
              value={invoiceForm.projectId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })}
              className="w-full bg-white border border-gray-200 text-apple-text text-sm rounded-apple py-2.5 px-3 focus:outline-none focus:border-apple-blue"
            >
              <option value="">Nenhum (Cobrança Avulsa)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Valor (R$) *"
              required
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              placeholder="Ex: 150,00"
            />
            <Input
              label="Data de Vencimento *"
              type="date"
              required
              value={invoiceForm.dueDate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Gerar Cobrança</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Pix QR Code */}
      <PixPaymentModal
        payment={selectedPaymentForPix}
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        onPaymentSuccess={loadData}
      />
    </div>
  );
};
