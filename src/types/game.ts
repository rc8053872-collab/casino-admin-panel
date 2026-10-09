export type GameCategory =
  | 'Card'
  | 'Arcade'
  | 'Board'
  | 'Strategy'
  | 'Wheel'
  | 'Crash'
  | 'Other';

export type GameStatus =
  | 'live'
  | 'enabled'
  | 'disabled'
  | 'scheduled'
  | 'completed';

export interface GameAdvancedSettings {
  enableLogging: boolean;
  enableStatistics: boolean;
  allowReplay: boolean;
  enableNotifications: boolean;
  maintenanceMode: boolean;
  allowManualStart: boolean;
  allowManualStop: boolean;
}

export interface Game {
  id: string;
  name: string;
  subtitle: string;
  category: GameCategory;
  description: string;
  status: GameStatus;

  // Player configurations
  minPlayers: number;
  maxPlayers: number;
  recommendedPlayers: number;
  currentPlayers: number;
  activeSeats: string[]; // e.g. ['AP', 'RS', 'PN', 'VS', 'AR']

  // Rules and rounds
  rounds: number;
  currentRound: number;
  roundStatus: string; // e.g. "Turn: River Round", "Rolling Dice #8"
  countdownText?: string; // e.g. "12s countdown"
  roundDuration: number; // in seconds
  turnDuration: number;
  maxRounds: number;
  duration: string; // elapsed e.g. "18:42"
  enableTimer: boolean;
  allowReconnect: boolean;
  reconnectionTime: number;

  // Automation flags
  autoStart: boolean;
  autoRestart: boolean;
  allowSpectators: boolean;

  // Financial / Entry configurations
  entryAmount: number;
  minEntry: number;
  maxEntry: number;
  currency: string;
  currentPot: number;
  totalPot: number;
  prizePool?: number;
  rakePercent: string; // e.g. "3.5%"

  // Availability & Scheduling
  visibility: 'public' | 'private';
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;

  // Display settings
  accentColor: string;
  thumbnail?: string;
  banner?: string;
  rules?: string;
  instructions?: string;

  // Advanced configurations
  advanced: GameAdvancedSettings;

  // Telemetry & metrics
  pingMs: number;
  activityLabel: string; // e.g. "Normal Activity", "Ultra Low Latency", "High Turnover"
  gamesTodayCount: number;
  totalGamesCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface LivePlayer {
  id: string;
  playerId: string;
  name: string;
  avatarInitials: string;
  status: 'In Game' | 'Lobby' | 'Spectating';
  joinedAt: string;
  currentRound: number;
  score: number | string;
  chipsOrBalance: number;
  pingMs: number;
  connection: 'Excellent' | 'Good' | 'Unstable';
}

export interface GameSessionHistory {
  id: string;
  sessionId: string;
  gameId: string;
  gameName: string;
  playersCount: number;
  startedAt: string;
  endedAt: string;
  duration: string;
  winnerName: string;
  winnerPlayerId: string;
  totalPot: number;
  winnerPayout: number;
  platformRake: number;
  status: 'Completed' | 'Aborted' | 'Refunded';
}

export interface GameActivityEvent {
  id: string;
  gameId: string;
  gameName: string;
  timestamp: string;
  message: string;
  type: 'start' | 'player_join' | 'player_leave' | 'round' | 'action' | 'payout' | 'stop' | 'alert';
}

export interface GameMetrics {
  totalGames: number;
  liveGames: number;
  playersPlaying: number;
  enabledGames: number;
  disabledGames: number;
  gamesToday: number;
  totalStakesExposure: number;
  tableOccupancyRate: number;
  totalOccupiedSeats: number;
  totalCapacitySeats: number;
}

export const GAME_TYPES = true;

