import type {
  Withdrawal,
  WithdrawalStats,
  SettlementTimelineStep,
  WithdrawalFilterParams,
  PaginatedWithdrawals,
  WithdrawalStatusTab,
} from '../types/withdrawal';
import { adminRequest } from '../lib/adminApi';

interface BackendWithdrawal {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  description: string | null;
  referenceId: string | null;
  metadata: unknown;
  wallet: {
    user: { id: string; username: string | null; email: string | null; mobile: string | null };
  };
}

interface WithdrawalListResponse {
  withdrawals: BackendWithdrawal[];
  pagination: { total: number; totalPages: number };
  counts: { all: number; pending: number; completed: number; failed: number };
}

function mapWithdrawal(item: BackendWithdrawal): Withdrawal {
  const metadata = item.metadata && typeof item.metadata === 'object'
    ? item.metadata as {
        bank?: {
          accountNumber?: string;
          ifscCode?: string;
          branchName?: string;
          accountHolder?: string;
          accountHolderName?: string;
          userName?: string;
        };
        rejectionReason?: string;
        underReview?: boolean;
        feePercent?: number;
        feeAmount?: number;
        finalAmount?: number;
        originalAmount?: number;
      }
    : {};
  const bank = metadata.bank || {};
  const username = item.wallet.user.username || item.wallet.user.email || item.wallet.user.mobile || 'Player';
  const holderName = bank.accountHolder || bank.accountHolderName || bank.userName || username;
  const initials = username.split(/[\s._@+-]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'PL';
  const status = metadata.underReview && item.status === 'PENDING'
    ? 'compliance_review'
    : item.status === 'COMPLETED'
      ? 'paid'
      : item.status === 'FAILED'
        ? 'rejected'
        : 'pending';

  return {
    id: item.id,
    payoutId: item.id.slice(-8).toUpperCase(),
    playerId: item.wallet.user.id,
    playerName: username,
    username,
    playerTier: 'Member',
    avatarInitials: initials,
    amount: Number(item.amount),
    feePercent: metadata.feePercent !== undefined ? Number(metadata.feePercent) : undefined,
    feeAmount: metadata.feeAmount !== undefined ? Number(metadata.feeAmount) : undefined,
    finalAmount: metadata.finalAmount !== undefined ? Number(metadata.finalAmount) : Number(item.amount),
    currency: 'INR',
    method: 'IMPS',
    destination: {
      type: 'bank',
      bankName: 'Bank Transfer',
      accountNumber: bank.accountNumber,
      maskedAccount: bank.accountNumber,
      branchName: bank.branchName,
      ifsc: bank.ifscCode,
      accountHolder: holderName
    },
    status,
    riskTier: 'low',
    riskScore: 0,
    turnover: { required: 0, completed: 0, percentage: 100, status: 'met' },
    requestedAt: item.createdAt,
    processedAt: item.status === 'COMPLETED' || item.status === 'FAILED' ? item.updatedAt : undefined,
    rejectionReason: metadata.rejectionReason
  };
}

function backendStatus(tab?: WithdrawalStatusTab): string {
  if (tab === 'pending') return 'PENDING';
  if (tab === 'paid' || tab === 'processing') return 'COMPLETED';
  if (tab === 'rejected') return 'FAILED';
  return '';
}

function downloadCsv(withdrawals: Withdrawal[]) {
  const headers = [
    'Payout ID',
    'Player ID',
    'Player Username',
    'Account Holder Name',
    'Gross Requested Amount (INR)',
    'Platform Fee Cut (INR)',
    'Net Amount to Pay (INR)',
    'Bank Account Number',
    'IFSC Code',
    'Branch Name',
    'Requested At',
    'Status'
  ];
  const rows = withdrawals.map(item => [
    item.payoutId,
    item.playerId,
    item.username,
    item.destination.accountHolder || item.playerName,
    String(item.amount),
    String(item.feeAmount || 0),
    String(item.finalAmount || item.amount),
    item.destination.accountNumber || item.destination.maskedAccount || '',
    item.destination.ifsc || '',
    item.destination.branchName || '',
    item.requestedAt,
    item.status
  ]);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `withdrawals_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const withdrawalService = {
  async getWithdrawals(params: WithdrawalFilterParams = {}): Promise<PaginatedWithdrawals> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    const status = backendStatus(params.statusTab);
    if (status) query.set('status', status);
    const response = await adminRequest<WithdrawalListResponse>(`/admin/withdrawals?${query.toString()}`);
    let withdrawals = response.withdrawals.map(mapWithdrawal);
    if (params.search?.trim()) {
      const search = params.search.trim().toLowerCase();
      withdrawals = withdrawals.filter(item =>
        [
          item.payoutId,
          item.playerId,
          item.playerName,
          item.username,
          item.destination.accountHolder,
          item.destination.accountNumber,
          item.destination.ifsc,
          item.destination.branchName
        ].some(value => value?.toLowerCase().includes(search))
      );
    }
    return {
      withdrawals,
      total: response.pagination.total,
      page,
      pageSize,
      totalPages: Math.max(1, response.pagination.totalPages),
      tabCounts: {
        all: response.counts.all,
        pending: response.counts.pending,
        processing: 0,
        paid: response.counts.completed,
        rejected: response.counts.failed,
        compliance_review: 0
      }
    };
  },

  async getWithdrawal(id: string): Promise<Withdrawal | null> {
    const trimmedId = id.trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedId);

    if (isObjectId) {
      try {
        const result = await adminRequest<BackendWithdrawal>(`/admin/withdrawals/${encodeURIComponent(trimmedId)}`);
        return mapWithdrawal(result);
      } catch (error) {
        // Fallback to searching the withdrawal queue below
      }
    }

    // Fallback: Support payoutId (e.g. 8-char suffix like "9882C70F") or queue search
    try {
      const response = await adminRequest<WithdrawalListResponse>('/admin/withdrawals?limit=100');
      const found = response.withdrawals.find(item =>
        item.id === trimmedId ||
        item.id.toLowerCase().endsWith(trimmedId.toLowerCase()) ||
        item.id.slice(-8).toUpperCase() === trimmedId.toUpperCase()
      );
      if (found) {
        return mapWithdrawal(found);
      }
    } catch {
      // Fallback failed
    }

    return null;
  },

  async approveWithdrawal(id: string, amount: number, paymentReference = ''): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) throw new Error('Withdrawal not found.');
    if (withdrawal.status !== 'pending') {
      throw new Error(`Withdrawal is already ${withdrawal.status.toUpperCase()} and cannot be approved again.`);
    }

    await adminRequest<{ message: string }>(`/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentReference })
    });
    return { ...withdrawal, status: 'paid', processedAt: new Date().toISOString() };
  },

  async settleWithdrawal(id: string): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) throw new Error('Withdrawal not found.');
    return withdrawal;
  },

  async rejectWithdrawal(id: string, reason: string): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) throw new Error('Withdrawal not found.');
    if (withdrawal.status !== 'pending') {
      throw new Error(`Withdrawal is already ${withdrawal.status.toUpperCase()} and cannot be rejected again.`);
    }

    await adminRequest<{ message: string }>(`/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return { ...withdrawal, status: 'rejected', processedAt: new Date().toISOString(), rejectionReason: reason };
  },

  async investigateWithdrawal(id: string): Promise<Withdrawal> {
    await adminRequest<{ message: string }>(`/admin/withdrawals/${encodeURIComponent(id)}/investigate`, {
      method: 'POST'
    });
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) throw new Error('Withdrawal not found after review flag.');
    return withdrawal;
  },

  async bulkApproveWithdrawals(ids: string[]): Promise<{ approvedCount: number; approvedIds: string[]; failedCount: number }> {
    const results = await Promise.allSettled(ids.map(async id => {
      const item = await this.getWithdrawal(id);
      if (!item) throw new Error('Withdrawal not found.');
      return this.approveWithdrawal(id, item.amount);
    }));
    const approvedIds = results.flatMap((result, index) => result.status === 'fulfilled' ? [ids[index]] : []);
    return { approvedCount: approvedIds.length, approvedIds, failedCount: ids.length - approvedIds.length };
  },

  async getWithdrawalStats(): Promise<WithdrawalStats> {
    return adminRequest<WithdrawalStats>('/admin/withdrawals/stats');
  },

  async getSettlementTimeline(id: string): Promise<SettlementTimelineStep[]> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) return [];
    const steps: SettlementTimelineStep[] = [{
      time: new Date(withdrawal.requestedAt).toLocaleTimeString(),
      title: 'Withdrawal requested',
      description: 'Funds were reserved in the wallet for review.',
      amount: withdrawal.amount,
      status: 'completed'
    }];
    if (withdrawal.status === 'paid') {
      steps.push({
        time: new Date(withdrawal.processedAt || withdrawal.requestedAt).toLocaleTimeString(),
        title: 'Payment marked as paid',
        description: 'Admin confirmed the bank transfer.',
        amount: withdrawal.amount,
        status: 'completed'
      });
    } else if (withdrawal.status === 'rejected') {
      steps.push({
        time: new Date(withdrawal.processedAt || withdrawal.requestedAt).toLocaleTimeString(),
        title: 'Request rejected',
        description: 'Reserved wallet funds were returned.',
        status: 'rejected'
      });
    } else {
      steps.push({ time: 'Pending', title: 'Awaiting admin review', status: 'current' });
    }
    return steps;
  },

  async exportWithdrawals(filters?: WithdrawalFilterParams, selectedIds?: string[]): Promise<void> {
    const firstPage = await this.getWithdrawals({ ...filters, page: 1, pageSize: 100 });
    const withdrawals = [...firstPage.withdrawals];
    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      const result = await this.getWithdrawals({ ...filters, page, pageSize: 100 });
      withdrawals.push(...result.withdrawals);
    }
    downloadCsv(selectedIds?.length ? withdrawals.filter(item => selectedIds.includes(item.id)) : withdrawals);
  }
};
