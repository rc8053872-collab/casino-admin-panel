export type DepositStatus = 'success' | 'processing' | 'failed';

export type PaymentRail = 'all' | 'upi' | 'netbanking' | 'cards' | 'razorpay';

export type PaymentMethodType = string;

export type PlayerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP Whale' | 'Member';

export interface DepositItem {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerTier: PlayerTier;
  amount: number;
  fee: number;
  netCredit: number;
  gateway: PaymentMethodType;
  gatewayRef: string;
  bankName?: string;
  vpa?: string;
  timeAgo: string;
  timestamp: string;
  status: DepositStatus;
  settlementSpeed: string;
  walletBalanceBefore?: number;
  walletBalanceAfter?: number;
  proofDataUrl?: string;
  ipAddress?: string;
  failureReason?: string;
}

export interface DepositStats {
  totalMonthVolume: number;
  totalMonthCount: number;
  volumeGrowthText: string;
  todayVolume: number;
  todayCount: number;
  lastHourCount: number;
  lastHourVolume: number;
  successRate: number;
  avgLatencySec: number;
  topMethod: string;
  topMethodShare: string;
}

export interface DepositFilters {
  search: string;
  status: 'all' | DepositStatus;
  rail: PaymentRail;
  dateRange: 'hour' | 'today' | '7d' | '30d';
  sortBy: 'time_desc' | 'amount_desc' | 'amount_asc';
}
