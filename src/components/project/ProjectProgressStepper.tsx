import React from 'react';
import type { ProjectStatus } from '../../types';
import { PROJECT_STATUSES, PROJECT_STATUS_MAP } from '../../utils/projectStatus';
import { Check } from 'lucide-react';

interface ProjectProgressStepperProps {
  currentStatus: ProjectStatus;
  compact?: boolean;
}

export const ProjectProgressStepper: React.FC<ProjectProgressStepperProps> = ({
  currentStatus,
  compact = false,
}) => {
  const currentStep = PROJECT_STATUS_MAP[currentStatus]?.stepNumber || 1;

  if (compact) {
    // Modo compacto para cartões pequenos
    const percentage = Math.round((currentStep / 5) * 100);
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[11px] text-apple-secondary">
          <span className="font-semibold text-apple-text">
            {PROJECT_STATUS_MAP[currentStatus]?.label}
          </span>
          <span className="font-mono">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-apple-blue h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Linha de Conexão de Fundo */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
        {/* Linha de Conexão Ativa */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-apple-blue rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        />

        {PROJECT_STATUSES.map((statusKey, index) => {
          const stepNum = index + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const info = PROJECT_STATUS_MAP[statusKey];

          return (
            <div key={statusKey} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-apple-blue text-white shadow-sm'
                    : isCurrent
                    ? 'bg-apple-blue text-white ring-4 ring-blue-100 shadow-apple-sm scale-110'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium transition-colors hidden sm:block ${
                  isCurrent
                    ? 'text-apple-text font-bold'
                    : isDone
                    ? 'text-apple-blue'
                    : 'text-gray-400'
                }`}
              >
                {info.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
