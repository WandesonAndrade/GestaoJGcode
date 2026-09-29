import React from 'react';
import type { ProjectStatus } from '../../types';
import { getProjectStatusInfo } from '../../utils/projectStatus';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  showDot?: boolean;
  className?: string;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
}) => {
  const info = getProjectStatusInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-tight ${info.badgeColorClass} ${className}`}
      title={info.description}
    >
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      <span>{info.label}</span>
    </span>
  );
};
