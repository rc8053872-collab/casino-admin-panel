import React, { useState } from 'react';
import {
  Download,
  FileCheck,
} from 'lucide-react';
import {
  useWithdrawals,
  useWithdrawalStats,
  useApproveWithdrawal,
  useRejectWithdrawal,
} from '../hooks/useWithdrawalsQuery';
import AadhaarKycModal from '../components/payments/AadhaarKycModal';
import type {
  Withdrawal,
  WithdrawalFilterParams,
  WithdrawalStatusTab,
} from '../types/withdrawal';
import { withdrawalService } from '../services/withdrawalService';
import { useToast } from '../hooks/useToast';
import WithdrawalKpiCards from '../components/withdrawals/WithdrawalKpiCards';
import WithdrawalFilterBar from '../components/withdrawals/WithdrawalFilterBar';
import WithdrawalStatusTabs from '../components/withdrawals/WithdrawalStatusTabs';
import WithdrawalTable from '../components/withdrawals/WithdrawalTable';
import WithdrawalApproveModal from '../components/withdrawals/WithdrawalApproveModal';
import WithdrawalRejectModal from '../components/withdrawals/WithdrawalRejectModal';
import WithdrawalComplianceDrawer from '../components/withdrawals/WithdrawalComplianceDrawer';
import WithdrawalReceiptModal from '../components/withdrawals/WithdrawalReceiptModal';
import WithdrawalOperationsPanels from '../components/withdrawals/WithdrawalOperationsPanels';

export const WithdrawalsPage: React.FC = () => {
  const toast = useToast();

  // Filters state
  const [filters, setFilters] = useState<WithdrawalFilterParams>({
    page: 1,
    pageSize: 10,
    statusTab: 'all',
    dateRange: 'today',
    paymentRail: 'all',
    riskTier: 'all',
    sortBy: 'requestedAt',
    sortOrder: 'desc',
  });

  // Queries
  const { data: withdrawalsData, isLoading, isError, refetch } = useWithdrawals(filters);
  const { data: stats, isLoading: isStatsLoading } = useWithdrawalStats();

  // Mutations
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

  // UI & selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [approvingWithdrawal, setApprovingWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<Withdrawal | null>(null);
  const [complianceDrawerWithdrawal, setComplianceDrawerWithdrawal] = useState<Withdrawal | null>(null);
  const [receiptWithdrawal, setReceiptWithdrawal] = useState<Withdrawal | null>(null);
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);

  const withdrawals = withdrawalsData?.withdrawals || [];

  // Filter change handlers
  const handleFilterChange = (newFilters: Partial<WithdrawalFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      statusTab: 'all',
      search: '',
      dateRange: 'today',
      paymentRail: 'all',
      riskTier: 'all',
      sortBy: 'requestedAt',
      sortOrder: 'desc',
    });
    setSelectedIds([]);
    toast.info('Filters Reset', 'Displaying all queue requests.');
  };

  const handleTabChange = (tab: WithdrawalStatusTab) => {
    setFilters((prev) => ({ ...prev, statusTab: tab, page: 1 }));
    setSelectedIds([]);
  };

  const handleSort = (field: any) => {
    setFilters((prev) => {
      const order = prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc';
      return { ...prev, sortBy: field, sortOrder: order };
    });
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === withdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(withdrawals.map((w) => w.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Approval handlers
  const handleConfirmSingleApprove = async (amount: number, paymentReference: string) => {
    if (!approvingWithdrawal) return;
    try {
      await approveMutation.mutateAsync({ id: approvingWithdrawal.id, amount, paymentReference });
      toast.success(
        'Withdrawal marked as paid',
        `₹${approvingWithdrawal.amount.toLocaleString('en-IN')} marked paid for ${approvingWithdrawal.playerName}.`
      );
      setApprovingWithdrawal(null);
    } catch {
      toast.error('Approval Failed', 'Unable to approve request.');
    }
  };

  const handleConfirmSingleReject = async (reason: string) => {
    if (!rejectingWithdrawal) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectingWithdrawal.id, reason });
      toast.error(
        'Withdrawal rejected',
        `${rejectingWithdrawal.payoutId} rejected: ${reason}. Funds reverted to wallet.`
      );
      setRejectingWithdrawal(null);
    } catch {
      toast.error('Rejection Failed', 'Unable to reject request.');
    }
  };

  // Export handlers
  const handleExportLedger = async () => {
    try {
      await withdrawalService.exportWithdrawals(filters);
      toast.success('Settlement Ledger Exported', 'Downloaded the current withdrawal ledger CSV.');
    } catch {
      toast.error('Export Failed', 'Could not download the withdrawal ledger.');
    }
  };

  const handleExportSelected = async () => {
    const selected = withdrawals.filter((w) => selectedIds.includes(w.id));
    if (selected.length === 0) return;
    try {
      await withdrawalService.exportWithdrawals(filters, selectedIds);
      toast.success('Export Successful', `Exported ${selected.length} selected requests.`);
    } catch {
      toast.error('Export Failed', 'Could not download the selected withdrawal requests.');
    }
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Withdrawal Requests & Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process payout requests, review player wallet details, and verify AML compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Banking Node Health Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="leading-tight">
              <span className="font-bold text-slate-900 block">Manual payout processing</span>
              <span className="text-[10px] text-slate-400">Verify transfer before marking paid</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAadhaarModalOpen(true)}
            className="px-3 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aadhaar Card KYC</span>
          </button>

          <button
            type="button"
            onClick={handleExportLedger}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Settlement Ledger</span>
          </button>

        </div>
      </div>

      {/* 2. Top 5 KPI Cards */}
      <WithdrawalKpiCards stats={stats} isLoading={isStatsLoading} />

      {/* 3. Filters Toolbar */}
      <WithdrawalFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 4. Status Tabs */}
      <WithdrawalStatusTabs
        activeTab={filters.statusTab || 'all'}
        onTabChange={handleTabChange}
        counts={
          withdrawalsData?.tabCounts || {
            all: 0,
            pending: 0,
            processing: 0,
            paid: 0,
            rejected: 0,
            compliance_review: 0,
          }
        }
      />

      {/* 5. Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 px-4 flex items-center justify-between gap-3 shadow-2xs animate-fadeIn">
          <div className="font-semibold text-blue-900 text-xs">
            <span className="font-bold">{selectedIds.length}</span> withdrawal{selectedIds.length === 1 ? '' : 's'} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSelected}
              className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>Export Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 6. Main Withdrawal Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {isError ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="text-sm font-bold text-slate-800">Unable to load withdrawal requests.</div>
            <p className="text-xs text-slate-400">An unexpected network error occurred. Please try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs"
            >
              Retry
            </button>
          </div>
        ) : (
          <WithdrawalTable
            withdrawals={withdrawals}
            selectedIds={selectedIds}
            isLoading={isLoading}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleSelect={handleToggleSelect}
            onSort={handleSort}
            onApprove={(w) => setApprovingWithdrawal(w)}
            onReject={(w) => setRejectingWithdrawal(w)}
            onInvestigate={(w) => setComplianceDrawerWithdrawal(w)}
            onViewReceipt={(w) => setReceiptWithdrawal(w)}
          />
        )}

        {/* 7. Pagination Bar */}
        {!isLoading && withdrawalsData && withdrawalsData.total > 0 && (
          <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {(filters.page! - 1) * filters.pageSize! + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(filters.page! * filters.pageSize!, withdrawalsData.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{withdrawalsData.total}</span> requests
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-[11px] text-slate-400">Rows per page:</span>
                <select
                  value={filters.pageSize || 10}
                  onChange={(e) => handleFilterChange({ pageSize: Number(e.target.value), page: 1 })}
                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleFilterChange({ page: Math.max(1, filters.page! - 1) })}
                disabled={filters.page! <= 1}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                &lt; Prev
              </button>

              <span className="px-2 font-bold text-slate-800">
                Page {filters.page} of {withdrawalsData.totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => handleFilterChange({ page: filters.page! + 1 })}
                disabled={filters.page! >= withdrawalsData.totalPages}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 8. Lower Operations Panels */}
      <WithdrawalOperationsPanels />

      {/* 9. Modals & Drawers */}
      <WithdrawalApproveModal
        withdrawal={approvingWithdrawal}
        isOpen={Boolean(approvingWithdrawal)}
        isLoading={approveMutation.isPending}
        onConfirm={handleConfirmSingleApprove}
        onClose={() => setApprovingWithdrawal(null)}
      />

      <WithdrawalRejectModal
        withdrawal={rejectingWithdrawal}
        isOpen={Boolean(rejectingWithdrawal)}
        isLoading={rejectMutation.isPending}
        onConfirm={handleConfirmSingleReject}
        onClose={() => setRejectingWithdrawal(null)}
      />

      <WithdrawalComplianceDrawer
        withdrawal={complianceDrawerWithdrawal}
        isOpen={Boolean(complianceDrawerWithdrawal)}
        onClose={() => setComplianceDrawerWithdrawal(null)}
        onApprove={(w) => {
          setComplianceDrawerWithdrawal(null);
          setApprovingWithdrawal(w);
        }}
        onReject={(w) => {
          setComplianceDrawerWithdrawal(null);
          setRejectingWithdrawal(w);
        }}
      />

      <WithdrawalReceiptModal
        withdrawal={receiptWithdrawal}
        isOpen={Boolean(receiptWithdrawal)}
        onClose={() => setReceiptWithdrawal(null)}
      />

      <AadhaarKycModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
      />
    </div>
  );
};

export default WithdrawalsPage;
