import React from 'react';
import { motion } from 'framer-motion';

export type HistoryStatusTab = 'all' | 'completed' | 'cancelled' | 'abandoned' | 'disputed';

interface HistoryStatusTabsProps {
  activeTab: HistoryStatusTab;
  tabCounts: {
    all: number;
    completed: number;
    cancelled: number;
    abandoned: number;
    disputed: number;
  };
  onTabChange: (tab: HistoryStatusTab) => void;
}

export const HistoryStatusTabs: React.FC<HistoryStatusTabsProps> = ({
  activeTab,
  tabCounts,
  onTabChange,
}) => {
  const tabs = [
    { id: 'all' as HistoryStatusTab, label: 'All Games', count: tabCounts.all },
    { id: 'completed' as HistoryStatusTab, label: 'Completed', count: tabCounts.completed },
    { id: 'cancelled' as HistoryStatusTab, label: 'Cancelled', count: tabCounts.cancelled },
    { id: 'abandoned' as HistoryStatusTab, label: 'Abandoned', count: tabCounts.abandoned },
    { id: 'disputed' as HistoryStatusTab, label: 'Disputed', count: tabCounts.disputed },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
      <div className="relative flex items-center p-1 bg-slate-100/80 rounded-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors z-10 ${
                isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="historyStatusTabIndicator"
                  className="absolute inset-0 bg-white rounded-lg shadow-xs"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : tab.id === 'disputed' && tab.count > 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count.toLocaleString('en-IN')}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryStatusTabs;
