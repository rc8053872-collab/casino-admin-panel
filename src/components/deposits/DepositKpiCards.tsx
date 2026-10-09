import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Clock3, CalendarDays } from 'lucide-react';
import type { DepositStats } from '../../types/deposit';
import { cardHoverVariants } from '../../animations/variants';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface DepositKpiCardsProps {
  stats: DepositStats;
}

export const DepositKpiCards: React.FC<DepositKpiCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
    <MetricCard title="Approved deposits · last 30 days" icon={<Coins className="w-4 h-4" />} amount={stats.totalMonthVolume} count={stats.totalMonthCount} />
    <MetricCard title="Approved deposits · today" icon={<CalendarDays className="w-4 h-4" />} amount={stats.todayVolume} count={stats.todayCount} />
    <MetricCard title="Approved deposits · last hour" icon={<Clock3 className="w-4 h-4" />} amount={stats.lastHourVolume} count={stats.lastHourCount} />
  </div>
);

function MetricCard({ title, icon, amount, count }: { title: string; icon: React.ReactNode; amount: number; count: number }) {
  return (
    <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover" className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <span>{title}</span>
        <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
        <AnimatedNumber value={amount} format="currency" />
      </div>
      <div className="mt-1 text-[11px] text-slate-500"><AnimatedNumber value={count} /> completed transactions</div>
    </motion.div>
  );
}

export default DepositKpiCards;
