import type { ProjectStatus } from '../types';

export interface ProjectStatusInfo {
  status: ProjectStatus;
  label: string;
  shortLabel: string;
  description: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success';
  badgeColorClass: string;
  stepNumber: number;
}

export const PROJECT_STATUS_MAP: Record<ProjectStatus, ProjectStatusInfo> = {
  PROPOSTA: {
    status: 'PROPOSTA',
    label: 'Proposta Comercial',
    shortLabel: 'Proposta',
    description: 'Levantamento de escopo, negociação e aprovação inicial',
    badgeVariant: 'neutral',
    badgeColorClass: 'bg-purple-50 text-purple-700 border-purple-200/70',
    stepNumber: 1,
  },
  SETUP_INICIAL: {
    status: 'SETUP_INICIAL',
    label: 'Setup Inicial',
    shortLabel: 'Setup',
    description: 'Briefing, coleta de acessos, domínio, hospedagem e estrutura',
    badgeVariant: 'info',
    badgeColorClass: 'bg-sky-50 text-sky-700 border-sky-200/70',
    stepNumber: 2,
  },
  EM_DESENVOLVIMENTO: {
    status: 'EM_DESENVOLVIMENTO',
    label: 'Em Desenvolvimento',
    shortLabel: 'Desenvolvimento',
    description: 'Criação de código, design, integrações ou otimizações no ar',
    badgeVariant: 'info',
    badgeColorClass: 'bg-blue-50 text-blue-700 border-blue-200/70',
    stepNumber: 3,
  },
  FASE_FINAL: {
    status: 'FASE_FINAL',
    label: 'Fase Final / Revisão',
    shortLabel: 'Revisão Final',
    description: 'Validações com o cliente, ajustes finais e testes de homologação',
    badgeVariant: 'warning',
    badgeColorClass: 'bg-amber-50 text-amber-700 border-amber-200/70',
    stepNumber: 4,
  },
  ENTREGUE: {
    status: 'ENTREGUE',
    label: 'Entregue & Publicado',
    shortLabel: 'Entregue',
    description: 'Projeto finalizado com sucesso, publicado e em operação',
    badgeVariant: 'success',
    badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    stepNumber: 5,
  },
};

export const PROJECT_STATUSES: ProjectStatus[] = [
  'PROPOSTA',
  'SETUP_INICIAL',
  'EM_DESENVOLVIMENTO',
  'FASE_FINAL',
  'ENTREGUE',
];

export function getProjectStatusInfo(status: ProjectStatus): ProjectStatusInfo {
  return PROJECT_STATUS_MAP[status] || PROJECT_STATUS_MAP.EM_DESENVOLVIMENTO;
}
