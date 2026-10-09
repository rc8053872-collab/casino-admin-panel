import { adminRequest } from '../lib/adminApi';

export interface MasterTransaction {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  type: 'Deposit' | 'Withdrawal' | 'Rake Settlement' | 'Tournament Fee';
  amount: number;
  fee: number;
  netAmount: number;
  paymentMode: string;
  channelCategory: 'upi' | 'bank' | 'wallet' | 'internal';
  gatewayRef: string;
  vpaOrAccount?: string;
  timeAgo: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Declined';
  auditReason?: string;
  ipAddress?: string;
  device?: string;
  isSimulated?: boolean;
}

export interface TransactionHistoryFilters {
  search?: string;
  type?: 'all' | 'Deposit' | 'Withdrawal' | 'Rake Settlement' | 'Tournament Fee';
  status?: 'all' | 'Completed' | 'Pending' | 'Declined';
  dateRange?: 'all' | 'today' | '24h' | '7d' | '30d';
  sortBy?: 'time_desc' | 'time_asc' | 'amount_desc' | 'amount_asc';
  page?: number;
  pageSize?: number;
}

export interface TransactionHistoryStats {
  totalVolume: number;
  depositVolume: number;
  withdrawalVolume: number;
  rakeVolume: number;
  completedCount: number;
  pendingCount: number;
  declinedCount: number;
  successRate: number;
}

interface ApiTransaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  currency: string;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
  wallet: {
    user: { id: string; username: string; email: string | null; mobile: string | null };
  };
}

interface ApiResponse {
  transactions: ApiTransaction[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  summary: Omit<TransactionHistoryStats, 'rakeVolume'>;
}

export class TransactionHistoryService {
  async getTransactions(filters: TransactionHistoryFilters = {}): Promise<{
    items: MasterTransaction[];
    total: number;
    stats: TransactionHistoryStats;
  }> {
    const query = new URLSearchParams({
      page: String(filters.page ?? 1),
      limit: String(filters.pageSize ?? 10),
      ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
      ...(filters.type && filters.type !== 'all' ? { type: filters.type.toUpperCase() } : {}),
      ...(filters.status && filters.status !== 'all'
        ? { status: filters.status === 'Completed' ? 'COMPLETED' : filters.status === 'Pending' ? 'PENDING' : 'FAILED' }
        : {})
    });
    const response = await adminRequest<ApiResponse>(`/admin/transactions?${query.toString()}`);
    let records = response.transactions.map((transaction) => {
      const player = transaction.wallet.user;
      const initials = player.username.slice(0, 2).toUpperCase();
      return {
        id: transaction.id,
        playerId: player.id,
        playerName: player.username,
        playerAvatar: initials,
        type: transaction.type === 'DEPOSIT' ? 'Deposit' as const : 'Withdrawal' as const,
        amount: Number(transaction.amount),
        fee: 0,
        netAmount: Number(transaction.amount),
        paymentMode: transaction.description || transaction.type,
        channelCategory: 'internal' as const,
        gatewayRef: transaction.referenceId || transaction.id,
        timeAgo: transaction.createdAt,
        timestamp: transaction.createdAt,
        status: transaction.status === 'COMPLETED' ? 'Completed' as const : transaction.status === 'PENDING' ? 'Pending' as const : 'Declined' as const
      };
    });
    if (filters.sortBy === 'amount_asc') records = records.sort((a, b) => a.amount - b.amount);
    if (filters.sortBy === 'amount_desc') records = records.sort((a, b) => b.amount - a.amount);
    if (filters.sortBy === 'time_asc') records = records.reverse();
    return {
      items: records,
      total: response.pagination.total,
      stats: { ...response.summary, rakeVolume: 0 }
    };
  }

  exportCsv(transactions: MasterTransaction[]): void {
    const headers = ['Transaction ID', 'Player ID', 'Player Name', 'Type', 'Amount', 'Reference', 'Timestamp', 'Status'];
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = transactions.map((transaction) => [
      transaction.id,
      transaction.playerId,
      transaction.playerName,
      transaction.type,
      transaction.amount,
      transaction.gatewayRef,
      transaction.timestamp,
      transaction.status
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const transactionHistoryService = new TransactionHistoryService();
