import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import KpiGrid from '../components/KpiGrid';
import PlayerActivityChart from '../components/PlayerActivityChart';
import FinancialOverviewChart from '../components/FinancialOverviewChart';
import LiveGamesCard from '../components/LiveGamesCard';
import RecentTransactionsCard from '../components/RecentTransactionsCard';
import PlatformActivityCard from '../components/PlatformActivityCard';
import { createDashboardTimeline } from '../animations/gsapUtils';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { api } from '../lib/api';

export const DashboardPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.getDashboard(),
    refetchInterval: 30000
  });

  useEffect(() => {
    const tl = createDashboardTimeline(containerRef.current, reducedMotion);

    return () => {
      if (tl) {
        tl.kill();
      }
    };
  }, [reducedMotion]);

  if (isLoading && !data) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading live dashboard data…</div>;
  }

  if (error || !data) {
    return <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
      <p className="text-sm font-semibold text-red-700">Dashboard data is unavailable.</p>
      <p className="mt-1 text-xs text-slate-500">{error instanceof Error ? error.message : 'No data was returned by the backend.'}</p>
      <button type="button" onClick={() => void refetch()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">Retry</button>
    </div>;
  }

  return (
    <div ref={containerRef} className="space-y-4.5">
      {/* Sequence Item 1: Page Header */}
      <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live account, wallet, transaction, and game catalog data from the backend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-white border border-slate-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isFetching ? 'Refreshing…' : 'Synced with backend'}
          </span>
        </div>
      </div>

      {/* Sequence Item 2: Metric KPI Cards */}
      <KpiGrid cards={data.kpis} />

      {/* Sequence Item 3: Player Activity & Financial Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4.5 items-start">
        <PlayerActivityChart initialRange="7d" />
        <FinancialOverviewChart initialRange="30d" />
      </section>

      {/* Sequence Item 4: Live Games & Recent Transactions Data Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4.5 items-start">
        <LiveGamesCard games={data.liveGames} />
        <RecentTransactionsCard transactions={data.recentTransactions} />
      </section>

      {/* Sequence Item 5: Real-time Platform Operational Snapshot */}
      <PlatformActivityCard activity={data.platformActivity} />
    </div>
  );
};

export default DashboardPage;
