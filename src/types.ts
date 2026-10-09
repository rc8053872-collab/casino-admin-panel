// ═══════════════════════════════════════════
// Client-side TypeScript types
// Mirrors the server API response shapes
// ═══════════════════════════════════════════

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  sub: string;
  type: 'live' | 'trend' | 'pending' | 'plain';
}

export interface LiveGame {
  id: string;
  name: string;
  status: 'available' | 'inactive';
}

export interface Transaction {
  id: string;
  playerId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  timeAgo: string;
  status: 'success' | 'pending' | 'failed';
}

export interface ActivityDataPoint {
  label: string;
  active: number;
  playing: number;
}

export interface FinancialDataPoint {
  label: string;
  deposits: number;
  withdrawals: number;
}

export interface PlatformActivity {
  newPlayersToday: number;
  depositsLastHour: number;
  withdrawalsPending: number;
  gamesAvailable: number;
}

export interface DashboardData {
  kpis: KpiCard[];
  liveGames: LiveGame[];
  recentTransactions: Transaction[];
  platformActivity: PlatformActivity;
}

export type ActivityRange = 'today' | '7d' | '30d';
export type FinancialRange = '7d' | '30d' | '3m';
