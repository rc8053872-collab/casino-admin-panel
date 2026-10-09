import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Coins, Zap, ShieldCheck } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface LiveGamesKpiCardsProps {
  liveGamesCount: number;
  totalPlayers: number;
  totalPot: number;
  avgPing: number;
  totalCapacity: number;
  isLoading?: boolean;
  activeSort?: string;
  onSelectSort?: (sortType: string) => void;
}

export const LiveGamesKpiCards: React.FC<LiveGamesKpiCardsProps> = ({
  liveGamesCount,
  totalPlayers,
  totalPot,
  avgPing,
  totalCapacity,
  isLoading = false,
  activeSort = 'pot_desc',
  onSelectSort,
}) => {
  const occupancyPercent =
    totalCapacity > 0 ? Math.round((totalPlayers / totalCapacity) * 100) : 0;

  const cards = [
    {
      id: 'arenas',
      sortTarget: 'all',
      title: 'Active Arenas',
      value: isLoading ? '...' : (
        <>
          <AnimatedNumber value={liveGamesCount} /> Live
        </>
      ),
      subtext: '100% Server node cluster operational',
      icon: Gamepad2,
      badgeText: 'Live Dispatch',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
      actionHint: 'Click to view all arenas',
      isActive: false,
    },
    {
      id: 'players',
      sortTarget: 'players_desc',
      title: 'Concurrent Players',
      value: isLoading ? '...' : <AnimatedNumber value={totalPlayers} />,
      subtext: (
        <>
          <AnimatedNumber value={occupancyPercent} suffix="%" /> Seat capacity utilization
        </>
      ),
      icon: Users,
      badgeText: (
        <>
          <AnimatedNumber value={totalCapacity} /> Max Seats
        </>
      ),
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
      iconBg: 'bg-blue-50 text-blue-600',
      gradient: 'from-blue-500/10 via-transparent to-transparent',
      actionHint: 'Click to sort by players',
      isActive: activeSort === 'players_desc',
    },
    {
      id: 'pot',
      sortTarget: 'pot_desc',
      title: 'Total Live Pot Escrow',
      value: isLoading ? '...' : <AnimatedNumber value={totalPot} format="currency" />,
      subtext: 'Real-time multi-table stakes in play',
      icon: Coins,
      badgeText: 'Active Stakes',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconBg: 'bg-amber-50 text-amber-600',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
      actionHint: 'Click to sort by highest pot',
      isActive: activeSort === 'pot_desc',
    },
    {
      id: 'ping',
      sortTarget: 'ping_asc',
      title: 'Telemetry & Latency',
      value: isLoading ? '...' : (
        <>
          <AnimatedNumber value={avgPing} decimals={1} suffix=" ms" />
        </>
      ),
      subtext: 'Ultra-low packet roundtrip latency',
      icon: Zap,
      badgeText: 'Provable RNG OK',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      iconBg: 'bg-indigo-50 text-indigo-600',
      gradient: 'from-indigo-500/10 via-transparent to-transparent',
      actionHint: 'Click to sort by lowest ping',
      isActive: activeSort === 'ping_asc',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            onClick={() => onSelectSort && onSelectSort(card.sortTarget)}
            className={`relative overflow-hidden bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
              card.isActive
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
            title={card.actionHint}
          >
            {/* Top subtle highlight */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.gradient}`} />

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                  {card.title}
                </span>
                <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                  {card.value}
                </div>
              </div>
              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 truncate max-w-[170px]">
                {card.subtext}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor} shrink-0 uppercase tracking-wider flex items-center gap-1`}
              >
                {card.id === 'ping' && <ShieldCheck className="w-3 h-3 text-indigo-600" />}
                <span>{card.badgeText}</span>
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LiveGamesKpiCards;
