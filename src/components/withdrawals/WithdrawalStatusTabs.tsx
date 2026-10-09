import React from 'react';
import { motion } from 'framer-motion';
import type { WithdrawalStatusTab } from '../../types/withdrawal';

interface WithdrawalStatusTabsProps {
  activeTab: WithdrawalStatusTab;
  onTabChange: (tab: WithdrawalStatusTab) => void;
  counts: Record<WithdrawalStatusTab, number>;
}

export const WithdrawalStatusTabs: React.FC<WithdrawalStatusTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs: Array<{ id: WithdrawalStatusTab; label: string; count: number; colorClass?: string }> = [
    { id: 'all', label: 'All Requests', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending, colorClass: 'text-amber-700 bg-amber-100' },
    { id: 'processing', label: 'Processing', count: counts.processing, colorClass: 'text-blue-700 bg-blue-100' },
    { id: 'paid', label: 'Paid / Settled', count: counts.paid, colorClass: 'text-emerald-700 bg-emerald-100' },
    { id: 'rejected', label: 'Rejected / Refunded', count: counts.rejected, colorClass: 'text-rose-700 bg-rose-100' },
    { id: 'compliance_review', label: 'Under Compliance', count: counts.compliance_review, colorClass: 'text-purple-700 bg-purple-100' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-1.5 shadow-2xs overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 z-10 ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="withdrawalStatusTabIndicator"
                  className="absolute inset-0 bg-blue-50/80 border border-blue-200 rounded-lg shadow-2xs"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span
                className={`relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : tab.colorClass || 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WithdrawalStatusTabs;
