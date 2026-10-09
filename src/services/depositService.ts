import type { DepositItem, DepositStats, DepositFilters } from '../types/deposit';
import { adminRequest } from '../lib/adminApi';

interface BackendDeposit {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  referenceId: string | null;
  metadata: unknown;
  wallet: {
    user: { id: string; username: string | null; email: string | null; mobile: string | null };
  };
}

interface BackendDepositsResponse {
  deposits: BackendDeposit[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: Pick<DepositStats, 'totalMonthVolume' | 'totalMonthCount' | 'todayVolume' | 'todayCount' | 'lastHourCount' | 'lastHourVolume' | 'successRate'>;
}

function formatTimeAgo(timestamp: string): string {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (elapsedMinutes < 1) return 'Just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hr ago`;
  return `${Math.floor(elapsedHours / 24)} days ago`;
}

function mapDeposit(item: BackendDeposit): DepositItem {
  const metadata = item.metadata && typeof item.metadata === 'object' && !Array.isArray(item.metadata)
    ? item.metadata as { utrNumber?: string; proofDataUrl?: string }
    : {};
  const user = item.wallet.user;
  const playerName = user.username || user.email || user.mobile || 'Player';
  const initials = playerName.split(/[\s._@+-]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'PL';
  return {
    id: item.id,
    playerId: user.id,
    playerName,
    playerAvatar: initials,
    playerTier: 'Member',
    amount: Number(item.amount),
    fee: 0,
    netCredit: Number(item.amount),
    gateway: 'UPI',
    gatewayRef: metadata.utrNumber || item.referenceId || '',
    timeAgo: formatTimeAgo(item.createdAt),
    timestamp: item.createdAt,
    status: item.status === 'COMPLETED' ? 'success' : item.status === 'FAILED' ? 'failed' : 'processing',
    settlementSpeed: item.status === 'PENDING' ? 'Awaiting admin review' : 'Manual review',
    proofDataUrl: metadata.proofDataUrl,
  };
}

export const depositService = {
  async getDeposits(filters?: Partial<DepositFilters>): Promise<DepositItem[]> {
    const status = filters?.status === 'success' ? 'COMPLETED' : filters?.status === 'failed' ? 'FAILED' : filters?.status === 'processing' ? 'PENDING' : '';
    const query = new URLSearchParams({ limit: '100', page: '1' });
    if (status) query.set('status', status);
    const response = await adminRequest<BackendDepositsResponse>(`/admin/deposits?${query.toString()}`);
    return response.deposits.map(mapDeposit);
  },

  async getStats(): Promise<DepositStats> {
    const response = await adminRequest<BackendDepositsResponse>('/admin/deposits?limit=1&page=1');
    return {
      ...response.stats,
      volumeGrowthText: 'Last 30 days',
      avgLatencySec: 0,
      topMethod: 'UPI',
      topMethodShare: 'Manual payments'
    };
  },

  async approveDeposit(id: string): Promise<void> {
    await adminRequest(`/admin/deposits/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  async rejectDeposit(id: string): Promise<void> {
    await adminRequest(`/admin/deposits/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }
};
