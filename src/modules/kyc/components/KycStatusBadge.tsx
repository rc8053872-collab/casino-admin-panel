import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { KycStatus } from '../types/kyc.types';

interface KycStatusBadgeProps {
  status: KycStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const KycStatusBadge: React.FC<KycStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const config = (() => {
    switch (normalized) {
      case 'VERIFIED':
        return {
          label: 'Verified',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200/90',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'PENDING':
        return {
          label: 'Pending',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200/90',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          border: 'border-sky-200/90',
          dot: 'bg-sky-500 animate-pulse',
          icon: Clock,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200/90',
          dot: 'bg-rose-500',
          icon: XCircle,
        };
      case 'NEEDS_INFORMATION':
        return {
          label: 'Needs Info',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200/90',
          dot: 'bg-purple-500',
          icon: HelpCircle,
        };
      default:
        return {
          label: 'Not Started',
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
          icon: AlertTriangle,
        };
    }
  })();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  }[size];

  const IconComp = config.icon;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} select-none transition-colors`}
    >
      {showIcon ? (
        <IconComp className="w-3 h-3 shrink-0" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default KycStatusBadge;
