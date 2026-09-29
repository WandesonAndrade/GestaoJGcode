export type UserRole = 'admin' | 'client';

export type AdminRole = 'SUPER_ADMIN' | 'PROJECT_MANAGER' | 'FINANCIAL' | 'SUPPORT';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  phone?: string;
  password?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthUser {
  uid: string;
  email?: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole;
  clientId?: string;
  cpfCnpj?: string;
}

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  companyName?: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export type ServiceType = 'SITE' | 'SISTEMA' | 'GMB' | 'EMAIL_PRO' | 'CONSULTORIA' | 'OUTRO';

export type ProjectStatus =
  | 'PROPOSTA'
  | 'SETUP_INICIAL'
  | 'EM_DESENVOLVIMENTO'
  | 'FASE_FINAL'
  | 'ENTREGUE';

export type DomainManagementType =
  | 'JGCODE_RESPONSAVEL'
  | 'CLIENTE_COM_ACESSO'
  | 'CLIENTE_SEM_ACESSO'
  | 'NAO_APLICA';

export interface ProjectTechnicalDetails {
  deployPlatform?: string;
  domainName?: string;
  domainManagement?: DomainManagementType;
  dnsProvider?: string;
  database?: string;
  emailProvider?: string;
  technicalNotes?: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName?: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  publishedLink?: string;
  publicationNotes?: string;
  status: ProjectStatus;
  imageUrl?: string;
  technicalDetails?: ProjectTechnicalDetails;
  createdAt: string;
}

export type PaymentPlanType = 'AVISTA' | 'PARCELADO' | 'RECORRENTE';

export interface PaymentPlan {
  id: string;
  projectId: string;
  projectName?: string;
  clientId: string;
  type: PaymentPlanType;
  totalAmount: number;
  installments?: number; // Ex: 3 parcelas
  recurrenceIntervalDays?: number; // 30 dias para mensalidade
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'MANUAL';

export interface Payment {
  id: string;
  planId: string;
  projectId: string;
  projectName?: string;
  clientId: string;
  title: string;
  amount: number;
  installmentLabel?: string; // Ex: "1/3" ou "Mensalidade 09/2026"
  dueDate: string;
  status: PaymentStatus;
  paidAt?: string | null;
  gateway?: string; // Ex: 'mercadopago'
  gatewayId?: string;
  qrCode?: string; // URL da imagem do QR code ou svg
  qrCodeCopyPaste?: string; // Linha digitável PIX copia e cola
  createdAt: string;
}
