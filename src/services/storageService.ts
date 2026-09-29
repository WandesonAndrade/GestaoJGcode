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

const INITIAL_CLIENTS: Client[] = [];
const INITIAL_PROJECTS: Project[] = [];
const INITIAL_PLANS: PaymentPlan[] = [];
const INITIAL_PAYMENTS: Payment[] = [];

export class StorageService {
  private static getItem<T>(key: string, defaultData: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      const parsed = JSON.parse(item);

      // Limpeza definitiva de resíduos dos clientes/projetos fakes antigos do protótipo
      if (key === STORAGE_KEYS.CLIENTS && Array.isArray(parsed) && parsed.some((c: any) => c.id === 'cli-1' || c.id === 'cli-2')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [] as unknown as T;
      }
      if (key === STORAGE_KEYS.PROJECTS && Array.isArray(parsed) && parsed.some((p: any) => p.id === 'proj-1' || p.id === 'proj-2' || p.id === 'proj-3')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [] as unknown as T;
      }
      if (key === STORAGE_KEYS.PAYMENTS && Array.isArray(parsed) && parsed.some((pay: any) => pay.id === 'pay-1' || pay.id === 'pay-2' || pay.id === 'pay-3' || pay.id === 'pay-4')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [] as unknown as T;
      }
      if (key === STORAGE_KEYS.PLANS && Array.isArray(parsed) && parsed.some((plan: any) => plan.id === 'plan-1' || plan.id === 'plan-2' || plan.id === 'plan-3')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [] as unknown as T;
      }

      return parsed;
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
