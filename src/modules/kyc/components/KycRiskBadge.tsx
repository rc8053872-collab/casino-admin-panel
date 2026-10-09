import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { RiskLevel } from '../types/kyc.types';

interface KycRiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export const KycRiskBadge: React.FC<KycRiskBadgeProps> = ({
  level,
  score,
  showScore = false,
  size = 'md',
}) => {
  const norm = level.toUpperCase();

  const config = (() => {
    switch (norm) {
      case 'LOW':
        return {
          label: 'Low',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200/80',
          icon: ShieldCheck,
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200/80',
          icon: AlertTriangle,
        };
      case 'HIGH':
      default:
        return {
          label: 'High',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200/80',
          icon: ShieldAlert,
        };
    }
  })();

  const sizeCls = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-[11px] px-2.5 py-1 gap-1.5';
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border ${config.bg} ${config.text} ${config.border} ${sizeCls}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label} Risk</span>
      {showScore && score !== undefined && (
        <span className="font-mono opacity-80 font-normal">({score})</span>
      )}
    </span>
  );
};

export default KycRiskBadge;
