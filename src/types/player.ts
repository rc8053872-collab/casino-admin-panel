export type PlayerStatus = 'active' | 'in_match' | 'offline' | 'suspended' | 'blocked';

export type PlayerKycStatus =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'under_review'
  | 'needs_information';

export type PlayerRiskTier = 'low' | 'medium' | 'high' | 'critical';

export type PlayerDevice = 'desktop' | 'mobile' | 'tablet';

export type PlayerWalletStatus = 'active' | 'frozen';

export interface Player {
  id: string;
  playerId: string; // e.g. "PLR-10282" or "#10482"
  firstName: string;
  lastName: string;
  username: string; // e.g. "rohit_kumar"
  email: string;
  phone: string;
  avatarInitials: string; // e.g. "RK"
  region: string; // e.g. "MUM-IN", "DEL-IN", "BLR-IN", "Rajasthan", "Maharashtra"
  cluster: string; // e.g. "Mumbai Core", "Delhi Edge", "Bangalore South"

  status: PlayerStatus;
  kycStatus: PlayerKycStatus;
  kycDocumentType?: string; // e.g. "Aadhaar + PAN", "Govt ID Uploaded", "Forged Aadhaar Doc"
  kycDocumentNumber?: string;
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  kycVerifiedAt?: string;
  kycReviewNotes?: string;

  riskTier: PlayerRiskTier;
  riskScore: number; // 0-100
  riskFlags: string[]; // e.g. ["Velocity Spike", "Multisession Triggers", "IP-VPN Detected"]
  riskLastReviewedAt?: string;
  riskReviewStatus?: 'normal' | 'flagged' | 'reviewed';

  balance: number;
  bonusBalance: number;
  walletStatus: PlayerWalletStatus;
  totalDeposits: number;
  totalWithdrawals: number;
  depositWithdrawalRatioText?: string; // e.g. "Ratio 1.57 (Healthy)"

  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number; // e.g. 54.2
  currentGameId?: string; // e.g. "GAME-001"
  currentGameName?: string; // e.g. "Game Arena 01 (Grandmaster)"
  currentRound?: number;

  lastActiveAt: string; // e.g. "2 min ago"
  lastActiveDetail?: string; // e.g. "In-Game (BOM-020)"
  device: PlayerDevice;
  ipAddress?: string;
  createdAt: string; // ISO date

  preferences?: {
    notifications: boolean;
    language: string;
  };
}

export interface PlayerTransaction {
  id: string;
  transactionId: string;
  playerId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  timeAgo: string;
}

export interface PlayerGameHistory {
  id: string;
  sessionId: string;
  gameId: string;
  gameName: string;
  result: 'Won' | 'Lost' | 'Draw';
  score: string | number;
  amountWonOrLost: number;
  duration: string;
  startedAt: string;
  completedAt: string;
}

export interface PlayerSession {
  id: string;
  device: string;
  platform: string;
  ipRegion: string;
  loginTime: string;
  lastActivity: string;
  status: 'Active' | 'Terminated' | 'Timed Out';
}

export interface PlayerActivityEvent {
  id: string;
  playerId: string;
  timestamp: string;
  title: string;
  type: 'login' | 'game' | 'deposit' | 'withdrawal' | 'kyc' | 'risk' | 'status' | 'notification';
}

export interface PlayerMetrics {
  totalPlayers: number;
  kycVerified: number;
  kycPending: number;
  kycRejected: number;
  kycVerificationRate: number; // e.g. 87.3
  flaggedCount: number;
  activeCount: number;
  suspendedCount: number;
  offlineCount: number;
  walletReserveTotal: number; // in rupees
}

export const PLAYER_TYPES_DEFINED = true;
