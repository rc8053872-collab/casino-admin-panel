import type {
  Game,
  GameStatus,
  LivePlayer,
  GameSessionHistory,
  GameActivityEvent,
  GameMetrics,
} from '../types/game';

import { adminRequest } from '../lib/adminApi';

const STORAGE_KEY = 'game_admin_games_data_v2';
const HISTORY_KEY = 'game_admin_history_data_v2';
const ACTIVITY_KEY = 'game_admin_activity_data_v2';

const INITIAL_GAMES: Game[] = [
  {
    id: 'GAME-001',
    name: 'Game Arena 01',
    subtitle: "High Roller Texas Hold'em",
    category: 'Card',
    description: 'Premier No-Limit Texas Holdem high stakes cash table with deep stacks, anti-collusion monitoring, and fast folds.',
    status: 'live',
    minPlayers: 2,
    maxPlayers: 6,
    recommendedPlayers: 6,
    currentPlayers: 5,
    activeSeats: ['AP', 'RS', 'PN', 'VS', 'AR'],
    rounds: 20,
    currentRound: 12,
    roundStatus: 'Turn: River Round',
    countdownText: '12s countdown',
    roundDuration: 90,
    turnDuration: 25,
    maxRounds: 50,
    duration: '18:42',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 60,
    autoStart: true,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 500,
    minEntry: 500,
    maxEntry: 5000,
    currency: 'INR',
    currentPot: 94500,
    totalPot: 142000,
    prizePool: 94500,
    rakePercent: '3.5%',
    visibility: 'public',
    accentColor: '#3B82F6',
    rules: 'Standard Texas Hold’em poker rules apply. 2 hole cards, 5 community cards. High hand takes the pot.',
    instructions: 'Select your seat, place your blinds, and act before the 25-second shot clock expires.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 22,
    activityLabel: 'Normal Activity',
    gamesTodayCount: 42,
    totalGamesCount: 1284,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-06T10:15:00Z',
  },
  {
    id: 'GAME-002',
    name: 'Game Arena 02',
    subtitle: 'Speed 4-Player 10-Minute Clash',
    category: 'Board',
    description: 'Fast-paced competitive Ludo with 10-second turn timer, synchronized dice rolls, and instant winner determination.',
    status: 'live',
    minPlayers: 4,
    maxPlayers: 4,
    recommendedPlayers: 4,
    currentPlayers: 4,
    activeSeats: ['DK', 'SK', 'RK', 'MK'],
    rounds: 1,
    currentRound: 1,
    roundStatus: 'Turn: Rolling Dice #8',
    countdownText: '6s action window',
    roundDuration: 600,
    turnDuration: 10,
    maxRounds: 1,
    duration: '06:14',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 30,
    autoStart: true,
    autoRestart: true,
    allowSpectators: false,
    entryAmount: 250,
    minEntry: 250,
    maxEntry: 250,
    currency: 'INR',
    currentPot: 920,
    totalPot: 1000,
    prizePool: 920,
    rakePercent: '8.0%',
    visibility: 'public',
    accentColor: '#10B981',
    rules: 'Each token moved scores points. Capture enemy token for bonus turns. Highest score at 10 minutes wins.',
    instructions: 'Tap dice when your turn glows green. Move tokens along safe paths to home corridor.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 18,
    activityLabel: 'Ultra Low Latency',
    gamesTodayCount: 88,
    totalGamesCount: 2340,
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-10-06T10:20:00Z',
  },
  {
    id: 'GAME-003',
    name: 'Game Arena 03',
    subtitle: 'Classic 6-Max Mid Stakes',
    category: 'Card',
    description: 'Standard 6-player No-Limit Texas Holdem ring game table with auto-topup and hand history tracking.',
    status: 'live',
    minPlayers: 2,
    maxPlayers: 6,
    recommendedPlayers: 6,
    currentPlayers: 6,
    activeSeats: ['AK', 'RJ', 'MS', 'VK', 'SD', 'KL'],
    rounds: 35,
    currentRound: 21,
    roundStatus: 'Dealing: Flop Cards',
    countdownText: 'RNG Verified',
    roundDuration: 80,
    turnDuration: 20,
    maxRounds: 50,
    duration: '31:10',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 45,
    autoStart: true,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 200,
    minEntry: 200,
    maxEntry: 2000,
    currency: 'INR',
    currentPot: 18450,
    totalPot: 32600,
    prizePool: 18450,
    rakePercent: '3.0%',
    visibility: 'public',
    accentColor: '#6366F1',
    rules: 'NL Holdem rules. 2 hole cards, flop, turn, river. Button moves clockwise each hand.',
    instructions: 'Sit and buy in between min and max buyin limit. Blinds 100/200.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 24,
    activityLabel: 'Fair RNG Active',
    gamesTodayCount: 56,
    totalGamesCount: 1890,
    createdAt: '2026-09-12T08:30:00Z',
    updatedAt: '2026-10-06T10:21:00Z',
  },
  {
    id: 'GAME-004',
    name: 'Game Arena 04',
    subtitle: 'Mega Multiplier 500x Wheel',
    category: 'Wheel',
    description: 'Live interactive spinning wheel with lightning multipliers up to 500x and unlimited concurrent participants.',
    status: 'live',
    minPlayers: 1,
    maxPlayers: 500,
    recommendedPlayers: 200,
    currentPlayers: 142,
    activeSeats: ['AA', 'MJ', 'NB', '+139'],
    rounds: 405,
    currentRound: 405,
    roundStatus: 'Status: Spinning Wheel',
    countdownText: 'Round #405',
    roundDuration: 30,
    turnDuration: 15,
    maxRounds: 1000,
    duration: '02:44:10',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 60,
    autoStart: true,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 10,
    minEntry: 10,
    maxEntry: 10000,
    currency: 'INR',
    currentPot: 114200,
    totalPot: 520000,
    prizePool: 114200,
    rakePercent: '2.5%',
    visibility: 'public',
    accentColor: '#EC4899',
    rules: 'Bet on 1, 2, 5, 10, 20, 40 or bonus segments. Flashing bonus segments multiply winning payouts.',
    instructions: 'Place bets before the 15-second timer runs out. Wheel spin automatically calculates win.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: false,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 16,
    activityLabel: 'Auto-payout',
    gamesTodayCount: 405,
    totalGamesCount: 8940,
    createdAt: '2026-08-20T14:00:00Z',
    updatedAt: '2026-10-06T10:22:00Z',
  },
  {
    id: 'GAME-005',
    name: 'Game Arena 05',
    subtitle: 'Rapid Crash Rocket v2',
    category: 'Crash',
    description: 'Real-time curve multiplier crash game where players must cash out before the rocket explodes.',
    status: 'live',
    minPlayers: 1,
    maxPlayers: 1000,
    recommendedPlayers: 300,
    currentPlayers: 84,
    activeSeats: ['CR', 'RK', 'PR', '+81'],
    rounds: 250,
    currentRound: 250,
    roundStatus: 'Flight Multiplier 4.82x',
    countdownText: 'Climbing fast (0.05s tick)',
    roundDuration: 20,
    turnDuration: 5,
    maxRounds: 1000,
    duration: '01:52:18',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 15,
    autoStart: true,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 50,
    minEntry: 50,
    maxEntry: 5000,
    currency: 'INR',
    currentPot: 249900,
    totalPot: 302750,
    prizePool: 249900,
    rakePercent: '1.5%',
    visibility: 'public',
    accentColor: '#F59E0B',
    rules: 'Multiplier rises from 1.00x upward. Cash out anytime before sudden crash. Uncashed bets are lost.',
    instructions: 'Place stake during betting interval. Hit Cashout button during flight to secure current multiplier.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 12,
    activityLabel: 'High Turnover',
    gamesTodayCount: 250,
    totalGamesCount: 14200,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-10-06T10:22:30Z',
  },
  {
    id: 'GAME-006',
    name: 'Game Arena 06',
    subtitle: 'Pot-Limit Omaha 4-Card',
    category: 'Card',
    description: 'High volatility Omaha poker where players receive four hole cards and must use exactly two.',
    status: 'live',
    minPlayers: 2,
    maxPlayers: 6,
    recommendedPlayers: 6,
    currentPlayers: 4,
    activeSeats: ['PK', 'RG', 'TD', 'AM'],
    rounds: 18,
    currentRound: 9,
    roundStatus: 'Turn: Showdown Pending',
    countdownText: 'Evaluating Hands',
    roundDuration: 90,
    turnDuration: 25,
    maxRounds: 40,
    duration: '22:15',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 60,
    autoStart: true,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 400,
    minEntry: 400,
    maxEntry: 4000,
    currency: 'INR',
    currentPot: 34100,
    totalPot: 48000,
    prizePool: 34100,
    rakePercent: '3.5%',
    visibility: 'public',
    accentColor: '#8B5CF6',
    rules: 'Each player receives 4 hole cards. Must use precisely 2 hole cards and 3 board cards.',
    instructions: 'Pot Limit betting rules enforce maximum raise equal to current pot size.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 21,
    activityLabel: 'State Consistent',
    gamesTodayCount: 38,
    totalGamesCount: 910,
    createdAt: '2026-09-18T16:00:00Z',
    updatedAt: '2026-10-06T10:23:00Z',
  },
  {
    id: 'GAME-007',
    name: 'Game Arena 07',
    subtitle: 'Arcade Space Invaders Royale',
    category: 'Arcade',
    description: 'Retro style 50-player battle royale arcade shooter with last-standing survivor prize distribution.',
    status: 'enabled',
    minPlayers: 10,
    maxPlayers: 50,
    recommendedPlayers: 30,
    currentPlayers: 0,
    activeSeats: [],
    rounds: 1,
    currentRound: 0,
    roundStatus: 'Lobby Open',
    countdownText: 'Awaiting match launch',
    roundDuration: 300,
    turnDuration: 0,
    maxRounds: 1,
    duration: '00:00',
    enableTimer: true,
    allowReconnect: false,
    reconnectionTime: 0,
    autoStart: true,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 100,
    minEntry: 100,
    maxEntry: 100,
    currency: 'INR',
    currentPot: 0,
    totalPot: 5000,
    prizePool: 4500,
    rakePercent: '10.0%',
    visibility: 'public',
    accentColor: '#06B6D4',
    rules: 'Survive incoming waves while avoiding obstacles. Last ship standing wins 70% of prize pool.',
    instructions: 'Use arrow keys to maneuver and spacebar to fire cannons.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 20,
    activityLabel: 'Standby Ready',
    gamesTodayCount: 14,
    totalGamesCount: 310,
    createdAt: '2026-09-22T11:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
  },
  {
    id: 'GAME-008',
    name: 'Game Arena 08',
    subtitle: 'Tactical Chess Masters Speed 5m',
    category: 'Strategy',
    description: 'FIDE standard Blitz chess with 5 minutes clock per side and 2-second Fischer increment.',
    status: 'enabled',
    minPlayers: 2,
    maxPlayers: 2,
    recommendedPlayers: 2,
    currentPlayers: 0,
    activeSeats: [],
    rounds: 1,
    currentRound: 0,
    roundStatus: 'Awaiting Challenger',
    countdownText: '5m + 2s blitz clock',
    roundDuration: 600,
    turnDuration: 30,
    maxRounds: 1,
    duration: '00:00',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 60,
    autoStart: true,
    autoRestart: false,
    allowSpectators: true,
    entryAmount: 200,
    minEntry: 200,
    maxEntry: 1000,
    currency: 'INR',
    currentPot: 0,
    totalPot: 400,
    prizePool: 380,
    rakePercent: '5.0%',
    visibility: 'public',
    accentColor: '#14B8A6',
    rules: 'Standard FIDE blitz chess laws. Stockfish anti-cheat engine continuously monitors evaluation spikes.',
    instructions: 'Click piece and valid target square to execute move. Clock toggles automatically.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 25,
    activityLabel: 'Standby Ready',
    gamesTodayCount: 22,
    totalGamesCount: 640,
    createdAt: '2026-09-25T15:00:00Z',
    updatedAt: '2026-10-06T08:00:00Z',
  },
  {
    id: 'GAME-009',
    name: 'Game Arena 09',
    subtitle: 'Midnight High Stakes Roulette VIP',
    category: 'Wheel',
    description: 'European single-zero roulette room for verified VIP members with high table limits.',
    status: 'scheduled',
    minPlayers: 1,
    maxPlayers: 100,
    recommendedPlayers: 20,
    currentPlayers: 0,
    activeSeats: [],
    rounds: 50,
    currentRound: 0,
    roundStatus: 'Scheduled Session',
    countdownText: 'Starts at 23:00 IST',
    roundDuration: 45,
    turnDuration: 25,
    maxRounds: 50,
    duration: '00:00',
    enableTimer: true,
    allowReconnect: true,
    reconnectionTime: 60,
    autoStart: false,
    autoRestart: true,
    allowSpectators: true,
    entryAmount: 1000,
    minEntry: 1000,
    maxEntry: 50000,
    currency: 'INR',
    currentPot: 0,
    totalPot: 0,
    prizePool: 0,
    rakePercent: '2.7%',
    visibility: 'private',
    startDate: '2026-10-06',
    startTime: '23:00',
    accentColor: '#E11D48',
    rules: 'Single zero European roulette. Standard inside and outside bet payouts.',
    instructions: 'VIP invitation required to enter table room.',
    advanced: {
      enableLogging: true,
      enableStatistics: true,
      allowReplay: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowManualStart: true,
      allowManualStop: true,
    },
    pingMs: 19,
    activityLabel: 'Scheduled',
    gamesTodayCount: 0,
    totalGamesCount: 112,
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-06T09:30:00Z',
  },
  {
    id: 'GAME-010',
    name: 'Game Arena 10',
    subtitle: 'Weekend Championship Qualifier',
    category: 'Board',
    description: 'Special tournament qualifier with tiered knockout brackets.',
    status: 'disabled',
    minPlayers: 8,
    maxPlayers: 64,
    recommendedPlayers: 32,
    currentPlayers: 0,
    activeSeats: [],
    rounds: 5,
    currentRound: 0,
    roundStatus: 'Maintenance Mode',
    countdownText: 'Locked by SuperAdmin',
    roundDuration: 180,
    turnDuration: 15,
    maxRounds: 5,
    duration: '00:00',
    enableTimer: true,
    allowReconnect: false,
    reconnectionTime: 0,
    autoStart: false,
    autoRestart: false,
    allowSpectators: false,
    entryAmount: 500,
    minEntry: 500,
    maxEntry: 500,
    currency: 'INR',
    currentPot: 0,
    totalPot: 0,
    prizePool: 0,
    rakePercent: '5.0%',
    visibility: 'public',
    accentColor: '#64748B',
    rules: 'Knockout tournament rules. Losers immediately eliminated, winners advance.',
    instructions: 'Currently undergoing scheduled server maintenance.',
    advanced: {
      enableLogging: true,
      enableStatistics: false,
      allowReplay: false,
      enableNotifications: false,
      maintenanceMode: true,
      allowManualStart: false,
      allowManualStop: false,
    },
    pingMs: 0,
    activityLabel: 'Maintenance',
    gamesTodayCount: 0,
    totalGamesCount: 78,
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-10-05T18:00:00Z',
  },
];

const INITIAL_PLAYERS: Record<string, LivePlayer[]> = {
  'GAME-001': [
    { id: 'lp-1', playerId: '#10482', name: 'Aarav Patel', avatarInitials: 'AP', status: 'In Game', joinedAt: '18 min ago', currentRound: 12, score: '₹34,200', chipsOrBalance: 34200, pingMs: 19, connection: 'Excellent' },
    { id: 'lp-2', playerId: '#10821', name: 'Rohan Sharma', avatarInitials: 'RS', status: 'In Game', joinedAt: '15 min ago', currentRound: 12, score: '₹22,100', chipsOrBalance: 22100, pingMs: 24, connection: 'Good' },
    { id: 'lp-3', playerId: '#10291', name: 'Priya Nair', avatarInitials: 'PN', status: 'In Game', joinedAt: '12 min ago', currentRound: 12, score: '₹18,500', chipsOrBalance: 18500, pingMs: 21, connection: 'Excellent' },
    { id: 'lp-4', playerId: '#10754', name: 'Vikram Singh', avatarInitials: 'VS', status: 'In Game', joinedAt: '8 min ago', currentRound: 12, score: '₹11,400', chipsOrBalance: 11400, pingMs: 32, connection: 'Good' },
    { id: 'lp-5', playerId: '#10118', name: 'Ananya Rao', avatarInitials: 'AR', status: 'In Game', joinedAt: '5 min ago', currentRound: 12, score: '₹8,300', chipsOrBalance: 8300, pingMs: 22, connection: 'Excellent' },
  ],
  'GAME-002': [
    { id: 'lp-6', playerId: '#10912', name: 'Devendra Kumar', avatarInitials: 'DK', status: 'In Game', joinedAt: '6 min ago', currentRound: 1, score: '142 pts', chipsOrBalance: 250, pingMs: 18, connection: 'Excellent' },
    { id: 'lp-7', playerId: '#10344', name: 'Sunil Kapoor', avatarInitials: 'SK', status: 'In Game', joinedAt: '6 min ago', currentRound: 1, score: '118 pts', chipsOrBalance: 250, pingMs: 17, connection: 'Excellent' },
    { id: 'lp-8', playerId: '#10567', name: 'Ravi Kumar', avatarInitials: 'RK', status: 'In Game', joinedAt: '6 min ago', currentRound: 1, score: '95 pts', chipsOrBalance: 250, pingMs: 21, connection: 'Good' },
    { id: 'lp-9', playerId: '#10889', name: 'Manish Khanna', avatarInitials: 'MK', status: 'In Game', joinedAt: '6 min ago', currentRound: 1, score: '82 pts', chipsOrBalance: 250, pingMs: 19, connection: 'Excellent' },
  ],
};

const INITIAL_HISTORY: GameSessionHistory[] = [
  { id: 'hist-1', sessionId: 'SESS-88912', gameId: 'GAME-001', gameName: 'Game Arena 01', playersCount: 6, startedAt: '2026-10-06 14:20', endedAt: '2026-10-06 14:48', duration: '28m 10s', winnerName: 'Aarav Patel', winnerPlayerId: '#10482', totalPot: 50000, winnerPayout: 48250, platformRake: 1750, status: 'Completed' },
  { id: 'hist-2', sessionId: 'SESS-88911', gameId: 'GAME-002', gameName: 'Game Arena 02', playersCount: 4, startedAt: '2026-10-06 14:10', endedAt: '2026-10-06 14:20', duration: '10m 00s', winnerName: 'Sunil Kapoor', winnerPlayerId: '#10344', totalPot: 1000, winnerPayout: 920, platformRake: 80, status: 'Completed' },
  { id: 'hist-3', sessionId: 'SESS-88910', gameId: 'GAME-003', gameName: 'Game Arena 03', playersCount: 6, startedAt: '2026-10-06 13:40', endedAt: '2026-10-06 14:15', duration: '35m 12s', winnerName: 'Priya Nair', winnerPlayerId: '#10291', totalPot: 24000, winnerPayout: 23160, platformRake: 840, status: 'Completed' },
  { id: 'hist-4', sessionId: 'SESS-88909', gameId: 'GAME-004', gameName: 'Game Arena 04', playersCount: 168, startedAt: '2026-10-06 14:12', endedAt: '2026-10-06 14:13', duration: '45s', winnerName: 'Multi-Winners (42 players)', winnerPlayerId: '#MULTI', totalPot: 84000, winnerPayout: 81900, platformRake: 2100, status: 'Completed' },
  { id: 'hist-5', sessionId: 'SESS-88908', gameId: 'GAME-005', gameName: 'Game Arena 05', playersCount: 92, startedAt: '2026-10-06 14:14', endedAt: '2026-10-06 14:14', duration: '22s', winnerName: 'Crash at 3.42x (54 Cashed out)', winnerPlayerId: '#CRASH', totalPot: 182000, winnerPayout: 178360, platformRake: 3640, status: 'Completed' },
  { id: 'hist-6', sessionId: 'SESS-88907', gameId: 'GAME-006', gameName: 'Game Arena 06', playersCount: 6, startedAt: '2026-10-06 13:10', endedAt: '2026-10-06 13:42', duration: '32m 00s', winnerName: 'Rohan Sharma', winnerPlayerId: '#10821', totalPot: 32000, winnerPayout: 30880, platformRake: 1120, status: 'Completed' },
];

const INITIAL_ACTIVITY: GameActivityEvent[] = [
  { id: 'act-1', gameId: 'GAME-001', gameName: 'Game Arena 01', timestamp: '14:41:18.490', message: 'High Roller AT: 14 showdowns triggered (Pot ₹1,12,000)', type: 'payout' },
  { id: 'act-2', gameId: 'GAME-001', gameName: 'Game Arena 01', timestamp: '14:41:16.712', message: 'Player #10482 Aarav Patel raised ₹2,500 on Turn', type: 'action' },
  { id: 'act-3', gameId: 'GAME-005', gameName: 'Game Arena 05', timestamp: '14:41:12.018', message: 'Rocket crashed at 4.82x multiplier (84 Cashed Out)', type: 'payout' },
  { id: 'act-4', gameId: 'GAME-003', gameName: 'Game Arena 03', timestamp: '14:40:55.201', message: 'Classic Poker: Pot reached ₹22,000 after 1.5hrs', type: 'round' },
  { id: 'act-5', gameId: 'GAME-002', gameName: 'Game Arena 02', timestamp: '14:40:31.609', message: 'Speed Ludo: Player #10912 captured token in quadrant 3', type: 'action' },
  { id: 'act-6', gameId: 'GAME-004', gameName: 'Game Arena 04', timestamp: '14:40:10.887', message: 'Mega Multiplier Wheel: 50x lightning bonus struck on segment 10', type: 'alert' },
];

// Helper to access LocalStorage safely
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to storage`, err);
  }
}

export const gameService = {
  async getGames(): Promise<Game[]> {
    try {
      const response = await adminRequest<any>('/admin/games');
      const backendGames = Array.isArray(response) ? response : (response.games || []);
      const fallbackGames = loadFromStorage<Game[]>(STORAGE_KEY, INITIAL_GAMES);
      
      return backendGames.map((record: any) => {
        // We'll merge with the mock UI data since the backend doesn't have all UI fields yet
        const fallback = fallbackGames.find(g => g.id === record.id || g.name === record.name) || fallbackGames[0];
        
        return {
          ...fallback,
          id: record.id,
          name: record.name,
          category: record.category || fallback.category,
          status: record.status === 'ACTIVE' ? 'live' : (record.status === 'INACTIVE' ? 'disabled' : 'completed'),
          minEntry: record.minBet || fallback.minEntry,
          maxEntry: record.maxBet || fallback.maxEntry,
          entryAmount: record.minBet || fallback.entryAmount,
          currency: record.supportedCurrencies?.[0] || 'INR',
          description: record.description || fallback.description,
          createdAt: record.createdAt || fallback.createdAt,
        } as Game;
      });
    } catch (e) {
      console.error(e);
      return loadFromStorage<Game[]>(STORAGE_KEY, INITIAL_GAMES);
    }
  },

  async getGame(id: string): Promise<Game | undefined> {
    const games = await this.getGames();
    return games.find((g) => g.id === id);
  },

  async createGame(data: Partial<Game>): Promise<Game> {
    const response = await adminRequest<any>('/admin/games', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (await this.getGame(response.id)) as Game;
  },

  async updateGame(id: string, data: Partial<Game>): Promise<Game> {
    const response = await adminRequest<any>(`/admin/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (await this.getGame(response.id)) as Game;
  },

  async deleteGame(id: string): Promise<boolean> {
    await adminRequest(`/admin/games/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  async duplicateGame(id: string): Promise<Game> {
    const source = await this.getGame(id);
    if (!source) throw new Error('Game not found');
    const newName = `${source.name} Copy`;
    return this.createGame({ ...source, name: newName, status: 'disabled', id: '' });
  },

  async enableGame(id: string): Promise<Game> {
    const response = await adminRequest<any>(`/admin/games/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' })
    });
    return (await this.getGame(response.id)) as Game;
  },

  async disableGame(id: string): Promise<Game> {
    const response = await adminRequest<any>(`/admin/games/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INACTIVE' })
    });
    return (await this.getGame(response.id)) as Game;
  },

  async startGame(id: string): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) throw new Error('Game not found');

    const initialMatch = INITIAL_GAMES.find((ig) => ig.id.toLowerCase() === id.toLowerCase());
    const restoredPlayers = game.currentPlayers > 0 
      ? game.currentPlayers 
      : (initialMatch?.currentPlayers || Math.max(2, game.minPlayers));
    const restoredPot = game.currentPot > 0 
      ? game.currentPot 
      : (initialMatch?.currentPot || (game.entryAmount * restoredPlayers));
    const restoredSeats = game.activeSeats.length > 0
      ? game.activeSeats
      : (initialMatch?.activeSeats || ['P1', 'P2']);

    const updated = await this.updateGame(id, {
      status: 'live',
      currentPlayers: restoredPlayers,
      currentPot: restoredPot,
      activeSeats: restoredSeats,
      currentRound: game.currentRound > 0 ? game.currentRound : (initialMatch?.currentRound || 1),
      duration: game.duration && game.duration !== '00:00' ? game.duration : (initialMatch?.duration || '05:00'),
      roundStatus: initialMatch?.roundStatus || 'Round in Progress',
      countdownText: 'Live action ongoing',
      activityLabel: initialMatch?.activityLabel || 'Normal Activity',
    });

    await this.logActivity(updated.id, updated.name, `Game instance manually started: ${updated.name}`, 'start');
    return updated;
  },

  async stopGame(id: string): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) throw new Error('Game not found');

    const updated = await this.updateGame(id, {
      status: 'completed',
      currentPlayers: 0,
      activeSeats: [],
      roundStatus: 'Session Terminated',
      countdownText: 'Halted by Admin',
      activityLabel: 'Halted',
    });

    await this.logActivity(updated.id, updated.name, `Emergency Stop: ${updated.name} session halted and bets resolved.`, 'stop');
    return updated;
  },

  async resetGame(id: string): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) throw new Error('Game not found');

    const updated = await this.updateGame(id, {
      status: 'enabled',
      currentPlayers: 0,
      activeSeats: [],
      currentRound: 0,
      currentPot: 0,
      duration: '00:00',
      roundStatus: 'Lobby Standby',
      countdownText: 'Table reset',
      activityLabel: 'Standby Ready',
    });

    await this.logActivity(updated.id, updated.name, `Game state reset: ${updated.name}`, 'alert');
    return updated;
  },

  async getLiveGames(): Promise<Game[]> {
    const games = await this.getGames();
    return games.filter((g) => g.status === 'live');
  },

  async getGamePlayers(id: string): Promise<LivePlayer[]> {
    await new Promise((res) => setTimeout(res, 50));
    if (INITIAL_PLAYERS[id]) {
      return INITIAL_PLAYERS[id];
    }
    // Generate realistic sample players if needed
    const game = await this.getGame(id);
    if (!game || game.currentPlayers === 0) return [];

    const names = ['Aarav Patel', 'Rohan Sharma', 'Priya Nair', 'Vikram Singh', 'Ananya Rao', 'Karan Mehra'];
    const initials = ['AP', 'RS', 'PN', 'VS', 'AR', 'KM'];

    return Array.from({ length: Math.min(game.currentPlayers, 6) }, (_, i) => ({
      id: `lp-${id}-${i + 1}`,
      playerId: `#${10100 + i * 15}`,
      name: names[i] || `Player ${i + 1}`,
      avatarInitials: initials[i] || `P${i + 1}`,
      status: 'In Game',
      joinedAt: `${(i + 1) * 3} min ago`,
      currentRound: game.currentRound || 1,
      score: `₹${(15000 - i * 2000).toLocaleString('en-IN')}`,
      chipsOrBalance: 15000 - i * 2000,
      pingMs: 18 + i * 4,
      connection: i === 3 ? 'Good' : 'Excellent',
    }));
  },

  async getGameHistory(gameId?: string): Promise<GameSessionHistory[]> {
    await new Promise((res) => setTimeout(res, 50));
    const history = loadFromStorage<GameSessionHistory[]>(HISTORY_KEY, INITIAL_HISTORY);
    if (gameId) {
      return history.filter((h) => h.gameId.toLowerCase() === gameId.toLowerCase());
    }
    return history;
  },

  async getGameActivity(gameId?: string): Promise<GameActivityEvent[]> {
    await new Promise((res) => setTimeout(res, 50));
    const activity = loadFromStorage<GameActivityEvent[]>(ACTIVITY_KEY, INITIAL_ACTIVITY);
    if (gameId) {
      return activity.filter((a) => a.gameId.toLowerCase() === gameId.toLowerCase());
    }
    return activity;
  },

  async logActivity(
    gameId: string,
    gameName: string,
    message: string,
    type: GameActivityEvent['type'] = 'action'
  ): Promise<void> {
    const activity = loadFromStorage<GameActivityEvent[]>(ACTIVITY_KEY, INITIAL_ACTIVITY);
    const now = new Date();
    const timestamp = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const newEvent: GameActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      gameId,
      gameName,
      timestamp,
      message,
      type,
    };
    const updated = [newEvent, ...activity.slice(0, 49)];
    saveToStorage(ACTIVITY_KEY, updated);
  },

  async getGameMetrics(): Promise<GameMetrics> {
    const games = await this.getGames();
    const liveGames = games.filter((g) => g.status === 'live');
    const enabledGames = games.filter((g) => g.status === 'enabled');
    const disabledGames = games.filter((g) => g.status === 'disabled');

    const playersPlaying = liveGames.reduce((acc, g) => acc + (g.currentPlayers || 0), 0);
    const gamesToday = games.reduce((acc, g) => acc + (g.gamesTodayCount || 0), 0);
    const totalStakesExposure = liveGames.reduce((acc, g) => acc + (g.currentPot || 0), 0);
    const totalOccupiedSeats = liveGames.reduce((acc, g) => acc + (g.currentPlayers || 0), 0);
    const totalCapacitySeats = liveGames.reduce((acc, g) => acc + (g.maxPlayers || 0), 0);

    const tableOccupancyRate = totalCapacitySeats > 0
      ? Number(((totalOccupiedSeats / totalCapacitySeats) * 100).toFixed(1))
      : 0;

    return {
      totalGames: games.length,
      liveGames: liveGames.length,
      playersPlaying,
      enabledGames: enabledGames.length,
      disabledGames: disabledGames.length,
      gamesToday,
      totalStakesExposure,
      tableOccupancyRate,
      totalOccupiedSeats,
      totalCapacitySeats,
    };
  },

  async bulkEnableGames(ids: string[]): Promise<void> {
    const games = loadFromStorage<Game[]>(STORAGE_KEY, INITIAL_GAMES);
    const idSet = new Set(ids.map((id) => id.toLowerCase()));
    const updated = games.map((g) =>
      idSet.has(g.id.toLowerCase()) ? { ...g, status: 'enabled' as GameStatus, updatedAt: new Date().toISOString() } : g
    );
    saveToStorage(STORAGE_KEY, updated);
  },

  async bulkDisableGames(ids: string[]): Promise<void> {
    const games = loadFromStorage<Game[]>(STORAGE_KEY, INITIAL_GAMES);
    const idSet = new Set(ids.map((id) => id.toLowerCase()));
    const updated = games.map((g) =>
      idSet.has(g.id.toLowerCase()) ? { ...g, status: 'disabled' as GameStatus, updatedAt: new Date().toISOString() } : g
    );
    saveToStorage(STORAGE_KEY, updated);
  },

  async bulkDeleteGames(ids: string[]): Promise<void> {
    const games = loadFromStorage<Game[]>(STORAGE_KEY, INITIAL_GAMES);
    const idSet = new Set(ids.map((id) => id.toLowerCase()));
    const updated = games.filter((g) => !idSet.has(g.id.toLowerCase()));
    saveToStorage(STORAGE_KEY, updated);
  },

  async emergencyFreezeAll(): Promise<void> {
    const games = loadFromStorage<Game[]>(STORAGE_KEY, INITIAL_GAMES);
    const updated = games.map((g) =>
      g.status === 'live'
        ? {
            ...g,
            status: 'completed' as GameStatus,
            roundStatus: 'Emergency Frozen',
            activityLabel: 'Frozen',
            updatedAt: new Date().toISOString(),
          }
        : g
    );
    saveToStorage(STORAGE_KEY, updated);
    await this.logActivity('GLOBAL', 'ALL ARENAS', 'EMERGENCY FREEZE ALL TRIGGERED: All active sessions halted.', 'alert');
  },
};
