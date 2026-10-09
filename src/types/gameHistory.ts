export type GameSessionStatus =
  | 'completed'
  | 'cancelled'
  | 'abandoned'
  | 'disputed'
  | 'interrupted';

export type GameIntegrityStatus =
  | 'rng_verified'
  | 'provably_fair'
  | 'under_review'
  | 'clean_showdown';

export interface SessionPlayerSummary {
  id: string;
  name: string;
  username: string;
  playerId: string;
  avatarInitials: string;
}

export interface GameSession {
  id: string;
  sessionId: string; // e.g. "GS-102829"
  roundId: string; // e.g. "RND-88412"

  gameId: string; // e.g. "GAME-001"
  gameName: string; // e.g. "Texas Hold'em High Roller Arena 01"
  gameType: string; // "Card" | "Arcade" | "Board" | "Strategy" | "Wheel" | "Crash"
  stakes: string; // e.g. "₹500 / ₹1,000"
  tableId: string; // e.g. "TBL-PAS-004"

  status: GameSessionStatus;
  integrityStatus: GameIntegrityStatus;

  startedAt: string; // ISO or formatted
  endedAt?: string;
  duration: string; // e.g. "18m 42s"

  playerCount: number;
  peakPlayers: number;
  playersList: SessionPlayerSummary[];

  totalPot: number;
  platformRake: number;
  totalPayout: number;

  winnerId?: string;
  winnerName?: string;
  winnerPlayerId?: string;
  winningHandOrOutcome?: string;

  rounds: number;
  configurationVersion: string;

  cancellationReason?: string;
  refundAmount?: number;
  disputeNotes?: string;

  // Cryptographic seed verification
  serverSeedHash: string;
  clientSeed: string;
  communityCards?: string[];
  deckEntropyProof?: string;
}

export interface GameRound {
  id: string;
  sessionId: string;
  roundNumber: number;
  startedAt: string;
  endedAt?: string;
  duration?: string;
  playerCount: number;
  winnerId?: string;
  winnerName?: string;
  pot: number;
  rake: number;
  status: 'completed' | 'cancelled' | 'interrupted' | 'disputed';
  playerActions: Array<{
    player: string;
    playerId: string;
    action: string;
    timestamp: string;
    result: string;
  }>;
}

export interface SessionPlayer {
  id: string;
  playerId: string;
  name: string;
  username: string;
  avatarInitials: string;
  joinedAt: string;
  leftAt: string;
  rounds: number;
  score: number;
  rank: number;
  payout: number;
  status: 'Active' | 'Folded' | 'Bust' | 'Winner';
}

export interface SessionTransaction {
  id: string;
  transactionId: string;
  playerId: string;
  playerName: string;
  type: 'Entry' | 'Prize' | 'Refund' | 'Fee' | 'Adjustment';
  amount: number;
  time: string;
  status: 'Settled' | 'Pending' | 'Failed';
}

export interface SessionEvent {
  time: string;
  description: string;
  type: 'start' | 'round' | 'payout' | 'dispute' | 'end';
}

export interface SessionAuditLog {
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  details: string;
}

export interface GameHistoryStats {
  totalGames: number;
  totalGamesGrowth: string;
  totalGameValue: number;
  totalGameValueToday: number;
  totalPayouts: number;
  payoutSettledRate: string;
  totalRounds: number;
  totalRoundsGrowth: string;
  avgDuration: string;
  avgDurationGrowth: string;
  grossTurnover: number;
  platformRake: number;
  flaggedRounds: number;
  flaggedDetails: string;
}

export interface HistoryFilterParams {
  search?: string;
  statusTab?: string;
  gameId?: string;
  gameType?: string;
  result?: string;
  playerCount?: string;
  dateRange?: string;
  customStartDate?: string;
  customEndDate?: string;
  flaggedOnly?: boolean;
  highStakesOnly?: boolean;
  multiplayerOnly?: boolean;
  seedMismatchOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedGameHistory {
  sessions: GameSession[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tabCounts: {
    all: number;
    completed: number;
    cancelled: number;
    abandoned: number;
    disputed: number;
  };
}
