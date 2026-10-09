// ═══════════════════════════════════════════
// API client — wraps all fetch calls to the
// Express backend with typed responses
// ═══════════════════════════════════════════

import type {
  DashboardData,
  ActivityDataPoint,
  FinancialDataPoint,
  ActivityRange,
  FinancialRange,
} from '../types';
import { adminRequest } from './adminApi';

interface DashboardResponse {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  activeGames: number;
  newUsersToday: number;
  depositsLastHour: number;
  liveGames: Array<{ id: string; name: string; status: string }>;
}

function compactRupees(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export const api = {
  async getDashboard(): Promise<DashboardData> {
    const [summary, transactions] = await Promise.all([
      adminRequest<DashboardResponse>('/admin/dashboard'),
      adminRequest<DashboardData['recentTransactions']>('/admin/dashboard/transactions')
    ]);
    const netFlow = summary.totalDeposits - summary.totalWithdrawals;
    return {
      kpis: [
        { id: 'total-players', label: 'Total Players', value: summary.totalUsers.toLocaleString('en-IN'), sub: 'registered accounts', type: 'plain' },
        { id: 'active-players', label: 'Active Accounts', value: summary.activeUsers.toLocaleString('en-IN'), sub: 'accounts enabled', type: 'plain' },
        { id: 'playing-now', label: 'Playing Now', value: 'Not tracked', sub: 'game-session telemetry unavailable', type: 'plain' },
        { id: 'total-deposits', label: 'Total Deposits', value: compactRupees(summary.totalDeposits), sub: 'approved deposits', type: 'plain' },
        { id: 'total-withdrawals', label: 'Total Withdrawals', value: compactRupees(summary.totalWithdrawals), trend: `${summary.pendingWithdrawals} pending`, sub: 'approved payouts', type: 'pending' },
        { id: 'net-flow', label: 'Net Flow', value: compactRupees(netFlow), sub: 'deposits minus withdrawals', type: 'plain' }
      ],
      liveGames: summary.liveGames.map(game => ({ id: game.id, name: game.name, status: 'available' as const })),
      recentTransactions: transactions.map(transaction => ({
        ...transaction,
        timeAgo: new Date(transaction.timeAgo).toLocaleString()
      })),
      platformActivity: {
        newPlayersToday: summary.newUsersToday,
        depositsLastHour: summary.depositsLastHour,
        withdrawalsPending: summary.pendingWithdrawals,
        gamesAvailable: summary.activeGames
      }
    };
  },

  getActivity: (range: ActivityRange): Promise<ActivityDataPoint[]> =>
    adminRequest<ActivityDataPoint[]>(`/admin/dashboard/activity?range=${range}`),

  getFinancial: (range: FinancialRange): Promise<FinancialDataPoint[]> =>
    adminRequest<FinancialDataPoint[]>(`/admin/dashboard/financial?range=${range}`),
};
