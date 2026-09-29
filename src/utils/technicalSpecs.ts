import type { DomainManagementType } from '../types';

export const DOMAIN_MANAGEMENT_LABELS: Record<DomainManagementType, { label: string; badgeVariant: 'info' | 'success' | 'warning' | 'neutral' }> = {
  JGCODE_RESPONSAVEL: {
    label: 'Registrado & Gerenciado pela JGcode',
    badgeVariant: 'success',
  },
  CLIENTE_COM_ACESSO: {
    label: 'Domínio do Cliente (Acesso Fornecido)',
    badgeVariant: 'info',
  },
  CLIENTE_SEM_ACESSO: {
    label: 'Gerenciado pelo Cliente (Passamos DNS)',
    badgeVariant: 'warning',
  },
  NAO_APLICA: {
    label: 'Não se aplica',
    badgeVariant: 'neutral',
  },
};

export const DEPLOY_PLATFORMS = [
  'Vercel',
  'Firebase Hosting',
  'Hostinger',
  'AWS',
  'DigitalOcean / VPS',
  'Google Cloud',
  'GitHub Pages',
  'Outro',
  'Não se aplica',
];

export const DATABASE_OPTIONS = [
  'Firebase Firestore',
  'PostgreSQL',
  'MySQL / MariaDB',
  'Supabase',
  'MongoDB',
  'SQLite',
  'Sem Banco / Site Estático',
  'Outro',
];

export const EMAIL_PROVIDERS = [
  'Titan Mail',
  'Google Workspace',
  'Zoho Mail',
  'Hostinger Webmail',
  'Microsoft 365',
  'Não se aplica',
  'Outro',
];

export const DNS_PROVIDERS = [
  'Cloudflare',
  'Registro.br',
  'Hostinger',
  'GoDaddy',
  'AWS Route 53',
  'Namecheap',
  'Outro',
];
