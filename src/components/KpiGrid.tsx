import React from 'react';
import { motion } from 'framer-motion';
import type { KpiCard } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cardHoverVariants } from '../animations/variants';
import { CARD_HOVER_TRANSITION } from '../animations/transitions';

import AnimatedNumber from './ui/AnimatedNumber';

interface KpiGridProps {
  cards: KpiCard[];
}

function KpiValueDisplay({ value }: { value: string | number }) {
  const isCurrency = typeof value === 'string' ? value.includes('₹') : false;

  return (
    <AnimatedNumber
      value={value}
      format={isCurrency ? 'compactCurrency' : 'number'}
      className="text-[23px] font-bold text-slate-900 tracking-tight leading-none"
    />
  );
}

function renderKpiIcon(id: string) {
  const iconCls = 'w-4 h-4';

  switch (id) {
    case 'total-players':
      return (
        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <svg className={iconCls} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case 'active-players':
      return (
        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <svg className={iconCls} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="15" cy="5" r="2.5" fill="#22C55E" stroke="#fff" strokeWidth="1" />
          </svg>
        </span>
      );
    case 'playing-now':
      return (
        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <svg className={iconCls} viewBox="0 0 20 20" fill="none">
            <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 10h2m1 0h2M10 9v1m0 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case 'total-deposits':
      return (
        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <svg className={iconCls} viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'total-withdrawals':
      return (
        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <svg className={iconCls} viewBox="0 0 20 20" fill="none">
            <path d="M16 10H4M8 14l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'net-flow':
    default:
      return (
        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <svg className={iconCls} viewBox="0 0 20 20" fill="none">
            <path d="M10 3v14M5 8l5-5 5 5M5 12l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
  }
}

export const KpiGrid: React.FC<KpiGridProps> = ({ cards }) => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5" aria-label="KPI Cards">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={cardHoverVariants}
          initial="rest"
          whileHover={reducedMotion ? undefined : 'hover'}
          transition={CARD_HOVER_TRANSITION}
          className="kpi-card bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-3 cursor-default"
        >
          {/* Card Header: Label & Icon */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 leading-tight">
              {card.label}
            </span>
            {renderKpiIcon(card.id)}
          </div>

          {/* Animated Value with GSAP CountUp */}
          <div>
            <KpiValueDisplay value={card.value} />
          </div>

          {/* Card Footer: Trends & Sub-labels */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {card.type === 'trend' && card.trend && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11.5px] font-semibold ${
                  card.trendUp
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                  <path
                    d={card.trendUp ? 'M2 9l4-6 4 6' : 'M2 3l4 6 4-6'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {card.trend}
              </span>
            )}

            {card.type === 'live' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}

            {card.type === 'pending' && card.trend && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold text-amber-800 bg-amber-50">
                {card.trend}
              </span>
            )}

            {card.sub && (
              <span className="text-[11.5px] text-slate-400 truncate">
                {card.sub}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default KpiGrid;
