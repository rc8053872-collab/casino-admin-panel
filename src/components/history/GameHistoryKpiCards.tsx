import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Layers, Coins, Percent, AlertOctagon, Clock } from 'lucide-react';
import type { GameHistoryStats } from '../../types/gameHistory';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface GameHistoryKpiCardsProps {
  stats?: GameHistoryStats;
}

function KpiCardItem({
  label,
  value,
  format = 'number',
  prefix,
  suffix,
  labelProp,
  decimals,
  sub,
  highlight = false,
  badgeText,
  badgeType = 'neutral',
  icon: Icon,
}: {
  label: string;
  value: number | string;
  format?: 'number' | 'currency' | 'compactCurrency' | 'compactNumber' | 'percent';
  prefix?: string;
  suffix?: string;
  labelProp?: string;
  decimals?: number;
  sub: React.ReactNode;
  highlight?: boolean;
  badgeText?: React.ReactNode;
  badgeType?: 'green' | 'amber' | 'red' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all hover:shadow-xs space-y-2 relative overflow-hidden ${
        highlight
          ? 'border-blue-300 ring-1 ring-blue-500/10'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            highlight ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
          <AnimatedNumber
            value={value}
            format={format}
            prefix={prefix}
            suffix={suffix}
            label={labelProp}
            decimals={decimals}
          />
        </div>

        {badgeText && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              badgeType === 'green'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : badgeType === 'red'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : badgeType === 'amber'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

export const GameHistoryKpiCards: React.FC<GameHistoryKpiCardsProps> = ({ stats }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5"
    >
      {/* 1. Total Games */}
      <KpiCardItem
        label="TOTAL GAMES"
        value={stats?.totalGames ?? 148920}
        format="number"
        sub={
          <span>
            <AnimatedNumber value={12.4} prefix="+" suffix="%" decimals={1} /> this month
          </span>
        }
        badgeText={<AnimatedNumber value={12.4} prefix="+" suffix="%" decimals={1} />}
        badgeType="green"
        icon={Layers}
        highlight={true}
      />

      {/* 2. Total Game Value */}
      <KpiCardItem
        label="TOTAL GAME VALUE"
        value={stats?.totalGameValue ?? 72400000}
        format="compactCurrency"
        sub={
          <span>
            <AnimatedNumber value={stats?.totalGameValueToday ?? 1840000} format="compactCurrency" /> today
          </span>
        }
        badgeText={
          <span>
            <AnimatedNumber value={stats?.totalGameValueToday ?? 1840000} format="compactCurrency" /> today
          </span>
        }
        badgeType="neutral"
        icon={Coins}
      />

      {/* 3. Total Payouts */}
      <KpiCardItem
        label="TOTAL PAYOUTS"
        value={stats?.totalPayouts ?? 21800000}
        format="compactCurrency"
        sub={
          <span>
            <AnimatedNumber value={98.4} suffix="%" decimals={1} /> settled
          </span>
        }
        badgeText="98.4% settled"
        badgeType="green"
        icon={Percent}
      />

      {/* 4. Total Rounds */}
      <KpiCardItem
        label="TOTAL ROUNDS"
        value={stats?.totalRounds ?? 3200000}
        format="compactNumber"
        labelProp="Rounds"
        sub={
          <span>
            <AnimatedNumber value={8.2} prefix="+" suffix="%" decimals={1} /> this month
          </span>
        }
        badgeText={<AnimatedNumber value={8.2} prefix="+" suffix="%" decimals={1} />}
        badgeType="green"
        icon={AlertOctagon}
      />

      {/* 5. Average Game Duration */}
      <KpiCardItem
        label="AVERAGE GAME DURATION"
        value={stats?.avgDuration ?? '18m 42s'}
        sub="-2.4% vs last month"
        badgeText="-2.4%"
        badgeType="neutral"
        icon={Clock}
      />
    </div>
  );
};

export default GameHistoryKpiCards;
