import React from 'react';
import type { ProjectTechnicalDetails } from '../../types';
import { DOMAIN_MANAGEMENT_LABELS } from '../../utils/technicalSpecs';
import { Globe, Server, Database, Mail, ShieldAlert, Cpu } from 'lucide-react';

interface ProjectTechDetailsBlockProps {
  tech?: ProjectTechnicalDetails;
  compact?: boolean;
}

export const ProjectTechDetailsBlock: React.FC<ProjectTechDetailsBlockProps> = ({
  tech,
  compact = false,
}) => {
  if (!tech || (!tech.deployPlatform && !tech.domainName && !tech.database && !tech.emailProvider)) {
    return null;
  }

  const domainLabel = tech.domainManagement ? DOMAIN_MANAGEMENT_LABELS[tech.domainManagement]?.label : null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {tech.deployPlatform && tech.deployPlatform !== 'Não se aplica' && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-apple-sm bg-gray-100 text-gray-700 font-medium">
            <Server size={11} className="text-apple-blue" />
            {tech.deployPlatform}
          </span>
        )}
        {tech.domainName && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-apple-sm bg-blue-50 text-blue-700 font-medium font-mono">
            <Globe size={11} className="text-apple-blue" />
            {tech.domainName}
          </span>
        )}
        {tech.database && tech.database !== 'Sem Banco / Site Estático' && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-apple-sm bg-emerald-50 text-emerald-700 font-medium">
            <Database size={11} className="text-emerald-600" />
            {tech.database}
          </span>
        )}
        {tech.emailProvider && tech.emailProvider !== 'Não se aplica' && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-apple-sm bg-purple-50 text-purple-700 font-medium">
            <Mail size={11} className="text-purple-600" />
            {tech.emailProvider}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50/90 rounded-apple p-3 border border-gray-100 space-y-2 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-apple-text text-[11px] uppercase tracking-wider pb-1 border-b border-gray-200/60">
        <Cpu size={13} className="text-apple-blue" />
        <span>Infraestrutura & Especificações</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-apple-secondary">
        {tech.deployPlatform && (
          <div className="flex items-center gap-1.5">
            <Server size={13} className="text-apple-blue shrink-0" />
            <span>
              Deploy: <strong className="text-apple-text">{tech.deployPlatform}</strong>
            </span>
          </div>
        )}

        {tech.database && (
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-emerald-600 shrink-0" />
            <span>
              Banco: <strong className="text-apple-text">{tech.database}</strong>
            </span>
          </div>
        )}

        {tech.domainName && (
          <div className="flex items-center gap-1.5 sm:col-span-2 font-mono">
            <Globe size={13} className="text-indigo-600 shrink-0" />
            <span>
              Domínio: <strong className="text-apple-text">{tech.domainName}</strong>
              {tech.dnsProvider && (
                <span className="text-[10px] text-gray-400 font-sans ml-1">
                  (DNS: {tech.dnsProvider})
                </span>
              )}
            </span>
          </div>
        )}

        {domainLabel && (
          <div className="flex items-start gap-1.5 sm:col-span-2 text-[11px]">
            <ShieldAlert size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <span className="text-gray-600">
              Gestão do Domínio: <strong className="text-apple-text">{domainLabel}</strong>
            </span>
          </div>
        )}

        {tech.emailProvider && tech.emailProvider !== 'Não se aplica' && (
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <Mail size={13} className="text-purple-600 shrink-0" />
            <span>
              E-mails: <strong className="text-apple-text">{tech.emailProvider}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
