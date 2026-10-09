import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { depositService } from '../services/depositService';
import type { DepositItem, DepositFilters, DepositStats } from '../types/deposit';
import { useToast } from '../hooks/useToast';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import DepositKpiCards from '../components/deposits/DepositKpiCards';
import DepositFilterBar from '../components/deposits/DepositFilterBar';
import DepositTable from '../components/deposits/DepositTable';
import DepositReceiptDrawer from '../components/deposits/DepositReceiptDrawer';
import { pageVariants } from '../animations/variants';

const EMPTY_STATS: DepositStats = {
  totalMonthVolume: 0, totalMonthCount: 0, volumeGrowthText: '', todayVolume: 0, todayCount: 0,
  lastHourCount: 0, lastHourVolume: 0, successRate: 0, avgLatencySec: 0, topMethod: '', topMethodShare: ''
};

export const DepositsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [stats, setStats] = useState<DepositStats>(EMPTY_STATS);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = (searchParams.get('status') as any) || 'all';

  const [filters, setFilters] = useState<DepositFilters>({
    search: initialSearch,
    status: initialStatus,
    rail: 'all',
    dateRange: '30d',
    sortBy: 'time_desc',
  });

  const refreshDeposits = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [latestDeposits, latestStats] = await Promise.all([
        depositService.getDeposits(),
        depositService.getStats()
      ]);
      setDeposits(latestDeposits);
      setStats(latestStats);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load deposit records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshDeposits();
    const timer = window.setInterval(() => void refreshDeposits(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Sync Search Param
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== filters.search) {
      setFilters((prev) => ({ ...prev, search: q }));
    }
  }, [searchParams]);

  const handleFilterChange = (newFilters: Partial<DepositFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // Update URL query parameters
      const params: Record<string, string> = {};
      if (updated.search) params.search = updated.search;
      if (updated.status !== 'all') params.status = updated.status;
      setSearchParams(params, { replace: true });
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      rail: 'all',
      dateRange: '30d',
      sortBy: 'time_desc',
    });
    setSearchParams({}, { replace: true });
    toast.info('Filters Reset', 'Displaying all deposit transactions.');
  };

  // Filtered deposits computation
  const filteredDeposits = useMemo(() => {
    let result = [...deposits];

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((d) => d.status === filters.status);
    }

    // Rail filter
    if (filters.rail !== 'all') {
      if (filters.rail === 'upi') {
        result = result.filter(
          (d) => d.gateway.toLowerCase().includes('upi') || d.gateway.toLowerCase().includes('pay')
        );
      } else if (filters.rail === 'netbanking') {
        result = result.filter((d) => d.gateway.toLowerCase().includes('netbanking'));
      } else if (filters.rail === 'razorpay') {
        result = result.filter((d) => d.gateway.toLowerCase().includes('razorpay'));
      } else if (filters.rail === 'cards') {
        result = result.filter(
          (d) => d.gateway.toLowerCase().includes('card') || d.gateway.toLowerCase().includes('cred')
        );
      }
    }

    // Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.playerId.toLowerCase().includes(q) ||
          d.playerName.toLowerCase().includes(q) ||
          d.gatewayRef.toLowerCase().includes(q) ||
          d.gateway.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (filters.dateRange === 'hour') {
      result = result.filter((d) => d.timeAgo.includes('min') || d.timeAgo.toLowerCase().includes('just'));
    }

    return result;
  }, [deposits, filters]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Deposit ID',
      'Player ID',
      'Player Name',
      'Amount (INR)',
      'Payment Method',
      'Gateway Ref',
      'Settlement Speed',
      'Status',
      'Timestamp',
    ];

    const rows = filteredDeposits.map((d) => [
      d.id,
      d.playerId,
      `"${d.playerName}"`,
      d.amount,
      `"${d.gateway}"`,
      d.gatewayRef,
      `"${d.settlementSpeed}"`,
      d.status,
      d.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `player_deposits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Ledger Exported', `Exported ${filteredDeposits.length} deposit records.`);
  };

  const handleDepositDecision = async (deposit: DepositItem, decision: 'approve' | 'reject') => {
    try {
      if (decision === 'approve') await depositService.approveDeposit(deposit.id);
      else await depositService.rejectDeposit(deposit.id);
      toast.success(decision === 'approve' ? 'Deposit approved' : 'Deposit rejected', `Transaction ${deposit.id} was updated.`);
      setSelectedDeposit(null);
      await refreshDeposits();
    } catch (reason) {
      toast.error('Could not update deposit', reason instanceof Error ? reason.message : 'Please try again.');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Manual UPI deposit requests</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400">Backend transaction ledger</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Player Deposits</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <AnimatedNumber value={deposits.length} /> Recorded
            </span>
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Review payment screenshots and approve or reject deposit requests. Records refresh every 30 seconds.
          </p>
        </div>

      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <DepositKpiCards stats={stats} />

      {/* 3. Filter Bar & Payment Rails */}
      <DepositFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={deposits.length}
        filteredCount={filteredDeposits.length}
        onExportCsv={handleExportCsv}
        onRefresh={() => {
          void refreshDeposits();
        }}
      />

      {/* 4. Main Deposits Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <DepositTable
          deposits={filteredDeposits}
          isLoading={isLoading}
          onSelectDeposit={(dep) => setSelectedDeposit(dep)}
          selectedDepositId={selectedDeposit?.id}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* 5. Deposit Receipt Dossier Slide-Over Drawer */}
      <DepositReceiptDrawer
        deposit={selectedDeposit}
        isOpen={Boolean(selectedDeposit)}
        onClose={() => setSelectedDeposit(null)}
        onApprove={(deposit) => void handleDepositDecision(deposit, 'approve')}
        onReject={(deposit) => void handleDepositDecision(deposit, 'reject')}
      />

    </motion.div>
  );
};

export default DepositsPage;
