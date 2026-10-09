export type PaymentRail = 'IMPS' | 'UPI' | 'NEFT' | 'RTGS' | 'BANK_TRANSFER';

export type WithdrawalStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'rejected'
  | 'refunded'
  | 'compliance_review';

export type RiskTier = 'low' | 'medium' | 'high' | 'critical';

export interface WithdrawalDestination {
  type: 'bank' | 'upi';
  bankName?: string;
  maskedAccount?: string;
  accountNumber?: string;
  branchName?: string;
  ifsc?: string;
  upiId?: string;
  accountHolder?: string;
}

export interface WithdrawalTurnover {
  required: number;
  completed: number;
  percentage: number;
  status: 'met' | 'partial' | 'unmet';
}

export interface Withdrawal {
  id: string;
  payoutId: string;

  playerId: string;
  playerName: string;
  username: string;
  playerTier: string;
  avatarInitials: string;

  amount: number;
  currency: 'INR';

  method: PaymentRail;
  destination: WithdrawalDestination;

  status: WithdrawalStatus;

  riskTier: RiskTier;
  riskScore: number;

  turnover: WithdrawalTurnover;

  requestedAt: string;
  approvedAt?: string;
  processedAt?: string;

  rejectionReason?: string;
  reviewerId?: string;

  // Compliance investigation metadata
  riskSignals?: string[];
  kycStatus?: 'verified' | 'pending' | 'rejected';
  recentTransactions?: Array<{
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    date: string;
    status: string;
  }>;
  recentGames?: Array<{
    id: string;
    game: string;
    profit: number;
    time: string;
  }>;
}

export interface WithdrawalStats {
  pendingApprovalsCount: number;
  pendingApprovalsAmount: number;
  payout24hVolume: number;
  completedTxns24h: number;
  volumeGrowthText: string;
  avgSettlementTime: string;
  settlementStatus: string;
  settlementMethod: string;
  failedComplianceCases: number;
  complianceStatus: string;
  complianceReason: string;
  successRate: number;
  successRatePeriod: string;
}

export interface SettlementTimelineStep {
  time: string;
  title: string;
  description?: string;
  amount?: number;
  status: 'completed' | 'current' | 'pending' | 'rejected';
}

export type WithdrawalStatusTab =
  | 'all'
  | 'pending'
  | 'processing'
  | 'paid'
  | 'rejected'
  | 'compliance_review';

export interface WithdrawalFilterParams {
  page?: number;
  pageSize?: number;
  statusTab?: WithdrawalStatusTab;
  search?: string;
  dateRange?: 'today' | 'yesterday' | '7d' | '30d' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  paymentRail?: 'all' | PaymentRail;
  riskTier?: 'all' | RiskTier;
  sortBy?: 'amount' | 'requestedAt' | 'riskScore' | 'turnover' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedWithdrawals {
  withdrawals: Withdrawal[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tabCounts: Record<WithdrawalStatusTab, number>;
}
