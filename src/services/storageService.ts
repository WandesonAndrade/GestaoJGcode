import type { Client, Project, Payment, PaymentPlan, SystemUser } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'jgcode_clients',
  PROJECTS: 'jgcode_projects',
  PLANS: 'jgcode_plans',
  PAYMENTS: 'jgcode_payments',
  USERS: 'jgcode_users',
};

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'user-1',
    name: 'Wandeson Silva',
    email: 'admin@jgcode.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    phone: '(11) 99999-8888',
    password: 'admin123',
    createdAt: '2026-08-01T09:00:00Z',
    lastLoginAt: '2026-09-29T16:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Carolina Mendes',
    email: 'gestao@jgcode.com',
    role: 'PROJECT_MANAGER',
    status: 'ACTIVE',
    phone: '(11) 98888-2233',
    password: 'gestor123',
    createdAt: '2026-08-10T14:30:00Z',
    lastLoginAt: '2026-09-28T11:20:00Z',
  },
  {
    id: 'user-3',
    name: 'Lucas Ferreira',
    email: 'financeiro@jgcode.com',
    role: 'FINANCIAL',
    status: 'ACTIVE',
    phone: '(11) 97777-4455',
    password: 'fin123',
    createdAt: '2026-08-15T10:00:00Z',
    lastLoginAt: '2026-09-27T17:45:00Z',
  },
  {
    id: 'user-4',
    name: 'Mariana Souza',
    email: 'suporte@jgcode.com',
    role: 'SUPPORT',
    status: 'ACTIVE',
    phone: '(11) 96666-5566',
    password: 'suporte123',
    createdAt: '2026-08-20T08:15:00Z',
    lastLoginAt: '2026-09-26T15:10:00Z',
  },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Padaria & Confeitaria Pão de Ouro',
    companyName: 'Pão de Ouro Alimentos Ltda',
    cpfCnpj: '12.345.678/0001-90',
    email: 'contato@paodeouro.com.br',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1200 - São Paulo, SP',
    active: true,
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'Dr. Roberto Silva',
    companyName: 'Consultório Odontológico Silva',
    cpfCnpj: '123.456.789-00',
    email: 'roberto@drrobertosilva.com.br',
    phone: '(11) 97777-8888',
    address: 'Rua Bela Cintra, 450 - São Paulo, SP',
    active: true,
    createdAt: '2026-08-20T14:30:00Z',
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    clientId: 'cli-1',
    clientName: 'Padaria & Confeitaria Pão de Ouro',
    name: 'Perfil Google Meu Negócio & Presença Local',
    description: 'Criação, verificação e SEO do perfil no Google Maps, catálogo de fotos profissionais e integração do cardápio.',
    serviceType: 'GMB',
    publishedLink: 'https://maps.google.com/?cid=1029384756',
    publicationNotes: 'Perfil 100% otimizado com selo verificado e 15 avaliações iniciais.',
    status: 'ENTREGUE',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    technicalDetails: {
      deployPlatform: 'Google My Business',
      domainManagement: 'NAO_APLICA',
      database: 'Sem Banco / Site Estático',
      technicalNotes: 'Perfil com selo de verificação oficial pelo Google.',
    },
    createdAt: '2026-08-12T11:00:00Z',
  },
  {
    id: 'proj-2',
    clientId: 'cli-1',
    clientName: 'Padaria & Confeitaria Pão de Ouro',
    name: 'Site Institucional & Encomendas Online',
    description: 'Desenvolvimento de landing page moderna em React, cardápio responsivo e botão direto para WhatsApp.',
    serviceType: 'SITE',
    publishedLink: 'https://paodeouro.com.br',
    publicationNotes: 'Deploy na Vercel com certificado SSL e integração ao Analytics.',
    status: 'EM_DESENVOLVIMENTO',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    technicalDetails: {
      deployPlatform: 'Vercel',
      domainName: 'paodeouro.com.br',
      domainManagement: 'JGCODE_RESPONSAVEL',
      dnsProvider: 'Cloudflare',
      database: 'Firebase Firestore',
      emailProvider: 'Titan Mail',
      technicalNotes: 'Domínio anual renovado até 2027.',
    },
    createdAt: '2026-08-15T15:00:00Z',
  },
  {
    id: 'proj-3',
    clientId: 'cli-2',
    clientName: 'Dr. Roberto Silva',
    name: 'E-mail Corporativo & Domínio Profissional',
    description: 'Configuração do domínio @drrobertosilva.com.br, caixas de e-mail profissionais com proteção anti-spam e SPF/DKIM.',
    serviceType: 'EMAIL_PRO',
    publishedLink: 'https://mail.drrobertosilva.com.br',
    publicationNotes: 'Registros MX, SPF, DMARC e DKIM validados no Cloudflare.',
    status: 'SETUP_INICIAL',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    technicalDetails: {
      deployPlatform: 'Cloudflare Workers',
      domainName: 'drrobertosilva.com.br',
      domainManagement: 'CLIENTE_COM_ACESSO',
      dnsProvider: 'Cloudflare',
      emailProvider: 'Google Workspace',
      database: 'Sem Banco / Site Estático',
      technicalNotes: 'Cliente forneceu acesso do Registro.br para apontamento no Cloudflare.',
    },
    createdAt: '2026-08-22T09:00:00Z',
  },
];

const INITIAL_PLANS: PaymentPlan[] = [
  {
    id: 'plan-1',
    projectId: 'proj-1',
    projectName: 'Perfil Google Meu Negócio & Presença Local',
    clientId: 'cli-1',
    type: 'RECORRENTE',
    totalAmount: 180.00,
    recurrenceIntervalDays: 30,
    createdAt: '2026-08-12T11:00:00Z',
  },
  {
    id: 'plan-2',
    projectId: 'proj-2',
    projectName: 'Site Institucional & Encomendas Online',
    clientId: 'cli-1',
    type: 'PARCELADO',
    totalAmount: 1500.00,
    installments: 3,
    createdAt: '2026-08-15T15:00:00Z',
  },
  {
    id: 'plan-3',
    projectId: 'proj-3',
    projectName: 'E-mail Corporativo & Domínio Profissional',
    clientId: 'cli-2',
    type: 'AVISTA',
    totalAmount: 390.00,
    createdAt: '2026-08-22T09:00:00Z',
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    planId: 'plan-1',
    projectId: 'proj-1',
    projectName: 'Perfil Google Meu Negócio & Presença Local',
    clientId: 'cli-1',
    title: 'Mensalidade Suporte & Monitoramento GMB',
    amount: 180.00,
    installmentLabel: 'Mensalidade Outubro/2026',
    dueDate: '2026-10-10',
    status: 'PENDING',
    createdAt: '2026-09-25T10:00:00Z',
  },
  {
    id: 'pay-2',
    planId: 'plan-2',
    projectId: 'proj-2',
    projectName: 'Site Institucional & Encomendas Online',
    clientId: 'cli-1',
    title: 'Desenvolvimento de Site Institucional',
    amount: 500.00,
    installmentLabel: 'Parcela 1 de 3',
    dueDate: '2026-09-15',
    status: 'PAID',
    paidAt: '2026-09-14T16:20:00Z',
    gateway: 'mercadopago',
    createdAt: '2026-08-15T15:00:00Z',
  },
  {
    id: 'pay-3',
    planId: 'plan-2',
    projectId: 'proj-2',
    projectName: 'Site Institucional & Encomendas Online',
    clientId: 'cli-1',
    title: 'Desenvolvimento de Site Institucional',
    amount: 500.00,
    installmentLabel: 'Parcela 2 de 3',
    dueDate: '2026-10-15',
    status: 'PENDING',
    createdAt: '2026-08-15T15:00:00Z',
  },
  {
    id: 'pay-4',
    planId: 'plan-3',
    projectId: 'proj-3',
    projectName: 'E-mail Corporativo & Domínio Profissional',
    clientId: 'cli-2',
    title: 'Setup e Configuração Domínio e E-mails',
    amount: 390.00,
    installmentLabel: 'Pagamento Único',
    dueDate: '2026-09-05',
    status: 'MANUAL',
    paidAt: '2026-09-04T11:00:00Z',
    createdAt: '2026-08-22T09:00:00Z',
  }
];

export class StorageService {
  private static getItem<T>(key: string, defaultData: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(item);
    } catch {
      return defaultData;
    }
  }

  private static setItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar no storage:', e);
    }
  }

  // --- CLIENTS ---
  static getClients(): Client[] {
    return this.getItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  static findClientByCpfCnpj(cpfCnpj: string): Client | undefined {
    const clean = cpfCnpj.replace(/\D/g, '');
    return this.getClients().find(
      (c) => c.cpfCnpj.replace(/\D/g, '') === clean
    );
  }

  static getClientById(id: string): Client | undefined {
    return this.getClients().find((c) => c.id === id);
  }

  static saveClient(clientData: Omit<Client, 'id' | 'createdAt'> & { id?: string }): Client {
    const clients = this.getClients();
    if (clientData.id) {
      const index = clients.findIndex((c) => c.id === clientData.id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...clientData };
        this.setItem(STORAGE_KEYS.CLIENTS, clients);
        return clients[index];
      }
    }

    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    clients.unshift(newClient);
    this.setItem(STORAGE_KEYS.CLIENTS, clients);
    return newClient;
  }

  // --- PROJECTS ---
  static getProjects(clientId?: string): Project[] {
    const projects = this.getItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    if (clientId) {
      return projects.filter((p) => p.clientId === clientId);
    }
    return projects;
  }

  static saveProject(projectData: Omit<Project, 'id' | 'createdAt'> & { id?: string }): Project {
    const projects = this.getProjects();
    const clients = this.getClients();
    const client = clients.find((c) => c.id === projectData.clientId);

    if (projectData.id) {
      const index = projects.findIndex((p) => p.id === projectData.id);
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          ...projectData,
          clientName: client?.name || projects[index].clientName,
        };
        this.setItem(STORAGE_KEYS.PROJECTS, projects);
        return projects[index];
      }
    }

    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      clientName: client?.name || 'Cliente JGcode',
      createdAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }

  static updateProjectStatus(projectId: string, newStatus: Project['status']): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      status: newStatus,
    };
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  }

  // --- PAYMENT PLANS ---
  static getPlans(projectId?: string): PaymentPlan[] {
    const plans = this.getItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    if (projectId) {
      return plans.filter((p) => p.projectId === projectId);
    }
    return plans;
  }

  static savePlan(planData: Omit<PaymentPlan, 'id' | 'createdAt'> & { id?: string }): PaymentPlan {
    const plans = this.getPlans();
    const newPlan: PaymentPlan = {
      ...planData,
      id: planData.id || `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    plans.unshift(newPlan);
    this.setItem(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  }

  // --- PAYMENTS ---
  static getPayments(clientId?: string): Payment[] {
    const payments = this.getItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (clientId) {
      return payments.filter((p) => p.clientId === clientId);
    }
    return payments;
  }

  static markAsManual(paymentId: string): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === paymentId);
    if (index === -1) return null;

    payments[index] = {
      ...payments[index],
      status: 'MANUAL',
      paidAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    return payments[index];
  }

  static markAsPaid(paymentId: string, gatewayId?: string): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === paymentId);
    if (index === -1) return null;

    payments[index] = {
      ...payments[index],
      status: 'PAID',
      paidAt: new Date().toISOString(),
      gateway: 'mercadopago',
      gatewayId: gatewayId || `mp-${Date.now()}`,
    };
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    return payments[index];
  }

  static attachQRCode(paymentId: string, qrCode: string, copyPaste: string): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === paymentId);
    if (index === -1) return null;

    payments[index] = {
      ...payments[index],
      qrCode,
      qrCodeCopyPaste: copyPaste,
    };
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    return payments[index];
  }

  // --- SYSTEM USERS ---
  static getUsers(): SystemUser[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getUserById(id: string): SystemUser | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static findUserByEmail(email: string): SystemUser | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return this.getUsers().find((u) => u.email.trim().toLowerCase() === cleanEmail);
  }

  static saveUser(userData: Omit<SystemUser, 'id' | 'createdAt'> & { id?: string }): SystemUser {
    const users = this.getUsers();
    if (userData.id) {
      const index = users.findIndex((u) => u.id === userData.id);
      if (index !== -1) {
        users[index] = {
          ...users[index],
          ...userData,
          email: userData.email.trim().toLowerCase(),
        };
        this.setItem(STORAGE_KEYS.USERS, users);
        return users[index];
      }
    }

    const newUser: SystemUser = {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  static deleteUser(id: string): { success: boolean; message?: string } {
    const users = this.getUsers();
    const userToDelete = users.find((u) => u.id === id);

    if (!userToDelete) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    // Proteger para nunca deletar o último Super Admin
    if (userToDelete.role === 'SUPER_ADMIN') {
      const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');
      if (superAdmins.length <= 1) {
        return { success: false, message: 'Não é possível excluir o único Administrador Geral do sistema.' };
      }
    }

    const filtered = users.filter((u) => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, filtered);
    return { success: true };
  }

  static toggleUserStatus(id: string): { success: boolean; user?: SystemUser; message?: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const currentStatus = users[index].status;
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Evitar desativar o único Super Admin ativo
    if (users[index].role === 'SUPER_ADMIN' && newStatus === 'INACTIVE') {
      const activeSuperAdmins = users.filter((u) => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE');
      if (activeSuperAdmins.length <= 1) {
        return { success: false, message: 'Não é possível desativar o único Administrador Geral ativo do sistema.' };
      }
    }

    users[index] = {
      ...users[index],
      status: newStatus,
    };
    this.setItem(STORAGE_KEYS.USERS, users);
    return { success: true, user: users[index] };
  }

  static updateUserPassword(id: string, newPass: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    users[index] = {
      ...users[index],
      password: newPass,
    };
    this.setItem(STORAGE_KEYS.USERS, users);
    return true;
  }

  static updateUserLastLogin(id: string): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return;

    users[index] = {
      ...users[index],
      lastLoginAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.USERS, users);
  }
}
