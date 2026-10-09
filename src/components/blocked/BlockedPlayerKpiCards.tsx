import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, AlertOctagon, Network } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface BlockedPlayerKpiCardsProps {
  blockedCount: number;
  totalFrozenAmount: number;
  criticalThreatsCount: number;
  avgRiskScore: number;
  clusters: string[];
  isLoading?: boolean;
}

export const BlockedPlayerKpiCards: React.FC<BlockedPlayerKpiCardsProps> = ({
  blockedCount,
  totalFrozenAmount,
  criticalThreatsCount,
  avgRiskScore,
  clusters,
  isLoading = false,
}) => {
  const cards = [
    {
      title: 'Isolated Accounts',
      value: isLoading ? '...' : <AnimatedNumber value={blockedCount} />,
      subtext: '100% Restricted from gameplay & cashout',
      icon: ShieldAlert,
      badgeText: 'Active Quarantine',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
      iconBg: 'bg-rose-50 text-rose-600',
      gradient: 'from-rose-500/10 via-transparent to-transparent',
    },
    {
      title: 'Total Frozen Escrow',
      value: isLoading ? '...' : <AnimatedNumber value={totalFrozenAmount} format="currency" />,
      subtext: 'Retained in anti-fraud custody reserve',
      icon: Lock,
      badgeText: 'Zero Outflow',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconBg: 'bg-amber-50 text-amber-600',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
    },
    {
      title: 'Critical Threat Severity',
      value: isLoading ? (
        '...'
      ) : (
        <>
          <AnimatedNumber value={criticalThreatsCount} /> Critical
        </>
      ),
      subtext: (
        <>
          Avg risk score: <AnimatedNumber value={avgRiskScore} decimals={0} />/100 (High Risk)
        </>
      ),
      icon: AlertOctagon,
      badgeText: 'Aml / Sybil',
      badgeColor: 'bg-red-50 text-red-700 border-red-200/80',
      iconBg: 'bg-red-50 text-red-600',
      gradient: 'from-red-500/10 via-transparent to-transparent',
    },
    {
      title: 'Multi-Account Clusters',
      value: isLoading ? (
        '...'
      ) : (
        <>
          <AnimatedNumber value={clusters.length} /> Geo Nodes
        </>
      ),
      subtext: clusters.length > 0 ? clusters.join(' • ') : 'No isolated clusters',
      icon: Network,
      badgeText: 'Device Fingerprint',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      iconBg: 'bg-indigo-50 text-indigo-600',
      gradient: 'from-indigo-500/10 via-transparent to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all"
          >
            {/* Ambient subtle linear gradient top border highlight */}
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.gradient}`}
            />

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                  {card.value}
                </div>
              </div>
              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 truncate max-w-[170px]" title={typeof card.subtext === 'string' ? card.subtext : undefined}>
                {card.subtext}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor} shrink-0 uppercase tracking-wider`}
              >
                {card.badgeText}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BlockedPlayerKpiCards;
