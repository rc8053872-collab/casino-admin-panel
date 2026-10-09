import type {
  Player,
  PlayerRiskTier,
  PlayerTransaction,
  PlayerGameHistory,
  PlayerSession,
  PlayerActivityEvent,
  PlayerMetrics,
  PlayerStatus,
} from '../types/player';
import { adminRequest } from '../lib/adminApi';

const STORAGE_KEY = 'game_admin_players_data_v1';
const TRANSACTIONS_KEY = 'game_admin_player_txns_v1';
const HISTORY_KEY = 'game_admin_player_history_v1';
const SESSIONS_KEY = 'game_admin_player_sessions_v1';
const ACTIVITY_KEY = 'game_admin_player_activity_v1';

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'PLR-10892',
    playerId: '#10892',
    firstName: 'Rahul',
    lastName: 'Sharma',
    username: 'rahul_sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 14821',
    avatarInitials: 'RS',
    region: 'Maharashtra',
    cluster: 'MUM-IN',
    status: 'active',
    kycStatus: 'pending',
    kycDocumentType: 'Identity + PAN',
    kycSubmittedAt: '2026-10-06 10:14',
    kycReviewNotes: 'Voter ID and PAN uploaded; pending admin review.',
    riskTier: 'medium',
    riskScore: 38,
    riskFlags: ['Awaiting Address Proof Clearance'],
    balance: 18420,
    bonusBalance: 1200,
    walletStatus: 'active',
    totalDeposits: 55000,
    totalWithdrawals: 28000,
    depositWithdrawalRatioText: 'Ratio 1.96',
    gamesPlayed: 412,
    gamesWon: 228,
    gamesLost: 184,
    winRate: 55.3,
    currentGameId: 'GAME-001',
    currentGameName: 'Arena 01 (Grandmaster)',
    currentRound: 8,
    lastActiveAt: '3 min ago',
    lastActiveDetail: 'In-Game (BOM-014)',
    device: 'mobile',
    ipAddress: '103.44.112.9',
    createdAt: '2026-09-15T09:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10893',
    playerId: '#10893',
    firstName: 'Aman',
    lastName: 'Verma',
    username: 'aman_verma',
    email: 'aman.v@example.com',
    phone: '+91 97112 38172',
    avatarInitials: 'AV',
    region: 'Delhi NCR',
    cluster: 'DEL-IN',
    status: 'active',
    kycStatus: 'verified',
    kycDocumentType: 'Full KYC',
    kycSubmittedAt: '2026-10-05 14:02',
    kycReviewedAt: '2026-10-05 14:03',
    kycReviewNotes: 'DigiLocker direct integration token validated.',
    riskTier: 'low',
    riskScore: 12,
    riskFlags: [],
    balance: 24500,
    bonusBalance: 500,
    walletStatus: 'active',
    totalDeposits: 84000,
    totalWithdrawals: 52000,
    depositWithdrawalRatioText: 'Ratio 1.61',
    gamesPlayed: 560,
    gamesWon: 310,
    gamesLost: 250,
    winRate: 55.4,
    currentGameId: 'GAME-002',
    currentGameName: 'Arena 02 (Diamond)',
    currentRound: 15,
    lastActiveAt: '12 min ago',
    lastActiveDetail: 'Table Lobby',
    device: 'desktop',
    ipAddress: '49.204.18.22',
    createdAt: '2026-08-10T11:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10912',
    playerId: '#10912',
    firstName: 'Arjun',
    lastName: 'Mehta',
    username: 'arjun_mehta',
    email: 'arjun.m@example.com',
    phone: '+91 91234 11204',
    avatarInitials: 'AM',
    region: 'Gujarat',
    cluster: 'AHM-IN',
    status: 'active',
    kycStatus: 'under_review',
    kycDocumentType: 'Identity',
    kycSubmittedAt: '2026-10-07 09:12',
    kycReviewNotes: 'Escalated due to multi-device login heuristic alert.',
    riskTier: 'high',
    riskScore: 78,
    riskFlags: ['Rapid Device Rotation', 'VPN Connection Detected'],
    balance: 42000,
    bonusBalance: 0,
    walletStatus: 'active',
    totalDeposits: 140000,
    totalWithdrawals: 98000,
    depositWithdrawalRatioText: 'Ratio 1.42',
    gamesPlayed: 730,
    gamesWon: 410,
    gamesLost: 320,
    winRate: 56.2,
    currentGameId: 'GAME-003',
    currentGameName: 'Arena 03 (Apex)',
    currentRound: 5,
    lastActiveAt: '25 min ago',
    lastActiveDetail: 'Lobby #3',
    device: 'mobile',
    ipAddress: '157.38.102.4',
    createdAt: '2026-09-28T14:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10482',
    playerId: '#10482',
    firstName: 'Rohit',
    lastName: 'Kumar',
    username: 'rohit_kumar',
    email: 'rohit.k@example.com',
    phone: '+91 98765 43210',
    avatarInitials: 'RK',
    region: 'Maharashtra',
    cluster: 'MUM-IN',
    status: 'active',
    kycStatus: 'verified',
    kycDocumentType: 'Aadhaar + PAN',
    kycSubmittedAt: '2026-08-12 14:20',
    kycReviewedAt: '2026-08-12 15:45',
    kycReviewNotes: 'Auto-verified with NSDL and UIDAI gateway.',
    riskTier: 'low',
    riskScore: 12,
    riskFlags: [],
    balance: 8450,
    bonusBalance: 500,
    walletStatus: 'active',
    totalDeposits: 45000,
    totalWithdrawals: 28500,
    depositWithdrawalRatioText: 'Ratio 1.57 (Healthy)',
    gamesPlayed: 342,
    gamesWon: 185,
    gamesLost: 157,
    winRate: 54.2,
    currentGameId: 'GAME-001',
    currentGameName: 'Arena 01 (Grandmaster)',
    currentRound: 12,
    lastActiveAt: '2 min ago',
    lastActiveDetail: 'In-Game (BOM-020)',
    device: 'desktop',
    ipAddress: '103.21.244.18',
    createdAt: '2026-06-15T10:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10821',
    playerId: '#10821',
    firstName: 'Vikram',
    lastName: 'Ace',
    username: 'vikram_ace',
    email: 'vikram.a@example.com',
    phone: '+91 98112 23344',
    avatarInitials: 'VA',
    region: 'Delhi NCR',
    cluster: 'DEL-IN',
    status: 'in_match',
    kycStatus: 'pending',
    kycDocumentType: 'Govt ID Uploaded',
    kycSubmittedAt: '2026-10-06 09:15',
    kycReviewNotes: 'Voter card uploaded; pending manual operator review.',
    riskTier: 'medium',
    riskScore: 45,
    riskFlags: ['Velocity Watch', 'High Buyin Frequency'],
    balance: 14200,
    bonusBalance: 0,
    walletStatus: 'active',
    totalDeposits: 120000,
    totalWithdrawals: 112000,
    depositWithdrawalRatioText: 'Ratio 1.07 (Velocity Watch)',
    gamesPlayed: 812,
    gamesWon: 502,
    gamesLost: 310,
    winRate: 61.8,
    currentGameId: 'GAME-003',
    currentGameName: 'Arena 03 (Apex)',
    currentRound: 21,
    lastActiveAt: '15 min ago',
    lastActiveDetail: 'Lobby #2',
    device: 'mobile',
    ipAddress: '49.36.12.92',
    createdAt: '2026-05-10T12:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10932',
    playerId: '#10932',
    firstName: 'Gamer',
    lastName: 'X99',
    username: 'gamer_x99',
    email: 'gamer99@example.com',
    phone: '+91 97234 11223',
    avatarInitials: 'GX',
    region: 'Karnataka',
    cluster: 'BLR-IN',
    status: 'suspended',
    kycStatus: 'rejected',
    kycDocumentType: 'Forged Aadhaar Doc',
    kycSubmittedAt: '2026-10-04 18:30',
    kycReviewedAt: '2026-10-04 19:10',
    kycReviewNotes: 'Photo tampering detected in OCR mismatch inspection.',
    riskTier: 'high',
    riskScore: 89,
    riskFlags: ['Abnormal Drain Spike', 'Alcohol Flag (Heuristic)', 'IP-VPN Detected'],
    balance: 2100,
    bonusBalance: 0,
    walletStatus: 'frozen',
    totalDeposits: 250000,
    totalWithdrawals: 274000,
    depositWithdrawalRatioText: 'Abnormal Drain Spike',
    gamesPlayed: 1029,
    gamesWon: 812,
    gamesLost: 217,
    winRate: 78.9,
    lastActiveAt: '45 min ago',
    lastActiveDetail: 'Disconnected IP-VPN',
    device: 'desktop',
    ipAddress: '185.220.101.5',
    createdAt: '2026-04-18T14:30:00Z',
    preferences: { notifications: false, language: 'en' },
  },
  {
    id: 'PLR-10291',
    playerId: '#10291',
    firstName: 'Priya',
    lastName: 'Queen',
    username: 'priya_queen',
    email: 'priya.q@example.com',
    phone: '+91 99881 22334',
    avatarInitials: 'PQ',
    region: 'Telangana',
    cluster: 'HYD-IN',
    status: 'active',
    kycStatus: 'verified',
    kycDocumentType: 'DigiLocker Auth',
    kycSubmittedAt: '2026-09-01 11:00',
    kycReviewedAt: '2026-09-01 11:05',
    kycReviewNotes: 'Instant DigiLocker Aadhaar e-KYC passed.',
    riskTier: 'low',
    riskScore: 9,
    riskFlags: [],
    balance: 23400,
    bonusBalance: 1200,
    walletStatus: 'active',
    totalDeposits: 72400,
    totalWithdrawals: 49000,
    depositWithdrawalRatioText: 'Ratio 1.47 (Balanced)',
    gamesPlayed: 512,
    gamesWon: 298,
    gamesLost: 214,
    winRate: 58.1,
    currentGameId: 'GAME-001',
    currentGameName: 'Arena 01 (Grandmaster)',
    currentRound: 12,
    lastActiveAt: '8 min ago',
    lastActiveDetail: 'In-Game (BOM-018)',
    device: 'tablet',
    ipAddress: '157.48.22.110',
    createdAt: '2026-07-20T09:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10692',
    playerId: '#10692',
    firstName: 'Shadow',
    lastName: 'King',
    username: 'shadow_king',
    email: 'shadow.k@example.com',
    phone: '+91 91234 56789',
    avatarInitials: 'SK',
    region: 'West Bengal',
    cluster: 'KOL-IN',
    status: 'offline',
    kycStatus: 'verified',
    kycDocumentType: 'Passport',
    kycSubmittedAt: '2026-08-25 16:00',
    kycReviewedAt: '2026-08-25 17:10',
    kycReviewNotes: 'Indian Passport bio-page verified.',
    riskTier: 'medium',
    riskScore: 36,
    riskFlags: ['Frequent Dormancy'],
    balance: 5120,
    bonusBalance: 150,
    walletStatus: 'active',
    totalDeposits: 34000,
    totalWithdrawals: 18000,
    depositWithdrawalRatioText: 'Ratio 1.88',
    gamesPlayed: 219,
    gamesWon: 108,
    gamesLost: 111,
    winRate: 49.3,
    currentGameName: 'Arena 02 (Diamond)',
    lastActiveAt: '2 hours ago',
    lastActiveDetail: 'Idle',
    device: 'mobile',
    ipAddress: '27.59.88.14',
    createdAt: '2026-08-01T15:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10554',
    playerId: '#10554',
    firstName: 'Rahul',
    lastName: 'Pro',
    username: 'rahul_pro',
    email: 'rahul.p@example.com',
    phone: '+91 94567 89012',
    avatarInitials: 'RP',
    region: 'Maharashtra',
    cluster: 'PUN-IN',
    status: 'active',
    kycStatus: 'verified',
    kycDocumentType: 'Aadhaar Instant',
    kycSubmittedAt: '2026-09-14 10:20',
    kycReviewedAt: '2026-09-14 10:22',
    kycReviewNotes: 'OTP verified UIDAI fetch.',
    riskTier: 'low',
    riskScore: 14,
    riskFlags: [],
    balance: 3420,
    bonusBalance: 300,
    walletStatus: 'active',
    totalDeposits: 15000,
    totalWithdrawals: 9800,
    depositWithdrawalRatioText: 'Ratio 1.53',
    gamesPlayed: 94,
    gamesWon: 49,
    gamesLost: 45,
    winRate: 52.1,
    currentGameName: 'Arena 02 (Diamond)',
    lastActiveAt: '1 min ago',
    lastActiveDetail: 'Matchmaking Queue',
    device: 'desktop',
    ipAddress: '115.111.45.2',
    createdAt: '2026-09-10T11:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10729',
    playerId: '#10729',
    firstName: 'Ananya',
    lastName: 'K',
    username: 'ananya_k',
    email: 'ananya.k@example.com',
    phone: '+91 96112 33445',
    avatarInitials: 'AK',
    region: 'Tamil Nadu',
    cluster: 'CHE-IN',
    status: 'offline',
    kycStatus: 'pending',
    kycDocumentType: 'Voter ID (Manual)',
    kycSubmittedAt: '2026-10-05 14:00',
    kycReviewNotes: 'Awaiting front/back edge clarification from user.',
    riskTier: 'low',
    riskScore: 22,
    riskFlags: [],
    balance: 14900,
    bonusBalance: 600,
    walletStatus: 'active',
    totalDeposits: 18500,
    totalWithdrawals: 4200,
    depositWithdrawalRatioText: 'Ratio 4.40',
    gamesPlayed: 178,
    gamesWon: 108,
    gamesLost: 70,
    winRate: 60.5,
    currentGameName: 'Arena 01 (Grandmaster)',
    lastActiveAt: '3 days ago',
    lastActiveDetail: 'App Background',
    device: 'mobile',
    ipAddress: '106.198.54.88',
    createdAt: '2026-08-18T16:00:00Z',
    preferences: { notifications: true, language: 'en' },
  },
  {
    id: 'PLR-10645',
    playerId: '#10645',
    firstName: 'Karan',
    lastName: 'Mehta',
    username: 'karan_mehta',
    email: 'karan.m@example.com',
    phone: '+91 93456 78901',
    avatarInitials: 'KM',
    region: 'Delhi NCR',
    cluster: 'DEL-IN',
    status: 'blocked',
    kycStatus: 'rejected',
    kycDocumentType: 'Fake Driving License',
    riskTier: 'critical',
    riskScore: 98,
    riskFlags: ['Sybil Collision', 'Multiple Account Match Abuse', 'Chargeback Fraud'],
    balance: 0,
    bonusBalance: 0,
    walletStatus: 'frozen',
    totalDeposits: 85000,
    totalWithdrawals: 92000,
    gamesPlayed: 12,
    gamesWon: 12,
    gamesLost: 0,
    winRate: 100.0,
    lastActiveAt: '3 days ago',
    lastActiveDetail: 'Permanently Barred',
    device: 'desktop',
    ipAddress: '194.26.29.11',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'PLR-10531',
    playerId: '#10531',
    firstName: 'Suresh',
    lastName: 'Kumar',
    username: 'suresh_k',
    email: 'suresh.k@example.com',
    phone: '+91 92345 67890',
    avatarInitials: 'SK',
    region: 'Rajasthan',
    cluster: 'JAI-IN',
    status: 'blocked',
    kycStatus: 'pending',
    kycDocumentType: 'Unverified PAN',
    riskTier: 'critical',
    riskScore: 94,
    riskFlags: ['Gateway Abuse', 'Repeated Chargebacks'],
    balance: 150,
    bonusBalance: 0,
    walletStatus: 'frozen',
    totalDeposits: 14000,
    totalWithdrawals: 16500,
    gamesPlayed: 5,
    gamesWon: 1,
    gamesLost: 4,
    winRate: 20.0,
    lastActiveAt: '1 week ago',
    lastActiveDetail: 'Barred by Admin_Finance',
    device: 'mobile',
    ipAddress: '117.211.89.34',
    createdAt: '2026-06-29T10:00:00Z',
  },
];

const INITIAL_TRANSACTIONS: Record<string, PlayerTransaction[]> = {
  'PLR-10482': [
    { id: 'txn-1', transactionId: 'TXN-90214', playerId: 'PLR-10482', type: 'deposit', amount: 5000, method: 'UPI (GPay)', status: 'success', date: '2026-10-06 14:10', timeAgo: '2 hrs ago' },
    { id: 'txn-2', transactionId: 'TXN-89812', playerId: 'PLR-10482', type: 'withdrawal', amount: 8000, method: 'IMPS Bank Transfer', status: 'success', date: '2026-10-05 18:30', timeAgo: 'Yesterday' },
    { id: 'txn-3', transactionId: 'TXN-89104', playerId: 'PLR-10482', type: 'deposit', amount: 10000, method: 'NetBanking (HDFC)', status: 'success', date: '2026-10-04 11:15', timeAgo: '2 days ago' },
  ],
  'PLR-10821': [
    { id: 'txn-4', transactionId: 'TXN-90455', playerId: 'PLR-10821', type: 'deposit', amount: 25000, method: 'UPI (PhonePe)', status: 'success', date: '2026-10-06 09:30', timeAgo: '6 hrs ago' },
    { id: 'txn-5', transactionId: 'TXN-90112', playerId: 'PLR-10821', type: 'withdrawal', amount: 20000, method: 'IMPS Bank Transfer', status: 'pending', date: '2026-10-06 08:45', timeAgo: '7 hrs ago' },
  ],
};

const INITIAL_GAME_HISTORY: Record<string, PlayerGameHistory[]> = {
  'PLR-10482': [
    { id: 'pgh-1', sessionId: 'SESS-88912', gameId: 'GAME-001', gameName: 'Game Arena 01 (Poker)', result: 'Won', score: '₹34,200', amountWonOrLost: 34200, duration: '28m', startedAt: '2026-10-06 14:20', completedAt: '2026-10-06 14:48' },
    { id: 'pgh-2', sessionId: 'SESS-88891', gameId: 'GAME-003', gameName: 'Game Arena 03 (NL Holdem)', result: 'Lost', score: 'Folded Turn', amountWonOrLost: -2000, duration: '14m', startedAt: '2026-10-06 13:00', completedAt: '2026-10-06 13:14' },
    { id: 'pgh-3', sessionId: 'SESS-88744', gameId: 'GAME-001', gameName: 'Game Arena 01 (Poker)', result: 'Won', score: '₹14,050', amountWonOrLost: 14050, duration: '35m', startedAt: '2026-10-05 21:00', completedAt: '2026-10-05 21:35' },
  ],
};

const INITIAL_SESSIONS: Record<string, PlayerSession[]> = {
  'PLR-10482': [
    { id: 'sess-1', device: 'Desktop Chrome 129', platform: 'Windows 11', ipRegion: 'Mumbai, MH (103.21.244.18)', loginTime: '2026-10-06 14:15', lastActivity: 'Just now', status: 'Active' },
    { id: 'sess-2', device: 'OnePlus 12', platform: 'Android 14', ipRegion: 'Mumbai, MH (49.36.88.19)', loginTime: '2026-10-05 20:10', lastActivity: '2026-10-05 23:45', status: 'Terminated' },
  ],
};

const INITIAL_ACTIVITY: Record<string, PlayerActivityEvent[]> = {
  'PLR-10482': [
    { id: 'act-1', playerId: 'PLR-10482', timestamp: '14:48 PM', title: 'Won ₹34,200 in Game Arena 01 High Roller', type: 'game' },
    { id: 'act-2', playerId: 'PLR-10482', timestamp: '14:20 PM', title: 'Joined Game Arena 01 (Seat #1)', type: 'game' },
    { id: 'act-3', playerId: 'PLR-10482', timestamp: '14:10 PM', title: 'Deposited ₹5,000 via UPI (GPay)', type: 'deposit' },
    { id: 'act-4', playerId: 'PLR-10482', timestamp: '14:05 PM', title: 'Logged in from Windows 11 Desktop (BOM-020)', type: 'login' },
  ],
};

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

export const playerService = {
  async getPlayers(): Promise<Player[]> {
    try {
      const response = await adminRequest<any>('/admin/users?limit=1000');
      return response.users.map((record: any) => {
        const username = record.username || record.email?.split('@')[0] || `user_${record.id.slice(-4)}`;
        const mappedStatus = record.status === 'BANNED' ? 'blocked' : (record.status === 'INACTIVE' ? 'offline' : 'active');
        return {
          id: record.id,
          playerId: `#${record.id.substring(record.id.length - 5)}`,
          firstName: username,
          lastName: '',
          username: username,
          email: record.email || '',
          phone: record.mobile || '',
          avatarInitials: username.substring(0, 2).toUpperCase(),
          region: 'Delhi NCR',
          cluster: 'DEL-IN',
          status: mappedStatus as PlayerStatus,
          kycStatus: 'verified',
          riskTier: record.status === 'BANNED' ? 'critical' : 'low',
          riskScore: record.status === 'BANNED' ? 98 : 10,
          riskFlags: record.status === 'BANNED' ? ['Admin Action'] : [],
          balance: record.wallet?.balance || 0,
          bonusBalance: 0,
          walletStatus: record.status === 'BANNED' ? 'frozen' : 'active',
          totalDeposits: record.wallet?.totalDeposited || 0,
          totalWithdrawals: record.wallet?.totalWithdrawn || 0,
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          winRate: 0,
          lastActiveAt: new Date(record.createdAt).toLocaleDateString(),
          device: 'desktop',
          ipAddress: '127.0.0.1',
          createdAt: record.createdAt,
          preferences: { notifications: true, language: 'en' },
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getPlayer(id: string): Promise<Player | undefined> {
    const players = await this.getPlayers();
    const clean = id.toLowerCase().replace('#', '');
    return players.find(
      (p) =>
        p.id.toLowerCase() === id.toLowerCase() ||
        p.playerId.toLowerCase().replace('#', '') === clean ||
        p.username.toLowerCase() === clean
    );
  },

  async createPlayer(data: Partial<Player>): Promise<Player> {
    await new Promise((res) => setTimeout(res, 120));
    const players = loadFromStorage<Player[]>(STORAGE_KEY, INITIAL_PLAYERS);
    const nextNum = 10000 + players.length + 1;

    const initials = `${(data.firstName || 'P').charAt(0)}${(data.lastName || 'U').charAt(0)}`.toUpperCase();

    const newPlayer: Player = {
      id: `PLR-${nextNum}`,
      playerId: `#${nextNum}`,
      firstName: data.firstName || 'Player',
      lastName: data.lastName || 'User',
      username: data.username || `player_${nextNum}`,
      email: data.email || `player${nextNum}@example.com`,
      phone: data.phone || '+91 90000 00000',
      avatarInitials: initials,
      region: data.region || 'Maharashtra',
      cluster: 'MUM-IN',
      status: data.status || 'active',
      kycStatus: data.kycStatus || 'pending',
      kycDocumentType: data.kycStatus === 'verified' ? 'Aadhaar + PAN' : 'Pending Upload',
      riskTier: data.riskTier || 'low',
      riskScore: data.riskScore ?? 15,
      riskFlags: [],
      balance: Number(data.balance) || 1000,
      bonusBalance: 100,
      walletStatus: 'active',
      totalDeposits: Number(data.balance) || 1000,
      totalWithdrawals: 0,
      depositWithdrawalRatioText: 'Ratio 1.0 (Initial)',
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      winRate: 0,
      lastActiveAt: 'Just now',
      lastActiveDetail: 'Registered account',
      device: data.device || 'mobile',
      createdAt: new Date().toISOString(),
      preferences: {
        notifications: data.preferences?.notifications ?? true,
        language: data.preferences?.language || 'en',
      },
    };

    const updated = [newPlayer, ...players];
    saveToStorage(STORAGE_KEY, updated);

    await this.logActivity(newPlayer.id, 'Account created by Administrator', 'status');
    return newPlayer;
  },

  async updatePlayer(id: string, data: Partial<Player>): Promise<Player> {
    await new Promise((res) => setTimeout(res, 80));
    const players = loadFromStorage<Player[]>(STORAGE_KEY, INITIAL_PLAYERS);
    const index = players.findIndex((p) => p.id === id || p.playerId === id);
    if (index === -1) throw new Error(`Player ${id} not found`);

    const existing = players[index];
    const updated: Player = {
      ...existing,
      ...data,
      id: existing.id,
      playerId: existing.playerId,
    };

    players[index] = updated;
    saveToStorage(STORAGE_KEY, players);

    await this.logActivity(updated.id, 'Player profile details updated by Admin', 'status');
    return updated;
  },

  async suspendPlayer(id: string, reason = 'Administrative Suspension'): Promise<Player> {
    const updated = await this.updatePlayer(id, {
      status: 'suspended',
      lastActiveDetail: `Suspended: ${reason}`,
    });
    await this.logActivity(updated.id, `Account suspended: ${reason}`, 'risk');
    return updated;
  },

  async restorePlayer(id: string): Promise<Player> {
    const updated = await this.updatePlayer(id, {
      status: 'active',
      lastActiveDetail: 'Privileges restored by Admin',
    });
    await this.logActivity(updated.id, 'Account privileges restored to Active', 'status');
    return updated;
  },

  async blockPlayer(id: string, reason = 'Permanent Security Block'): Promise<Player> {
    await adminRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'BANNED' })
    });
    const updated = (await this.getPlayer(id)) as Player;
    await this.logActivity(updated.id, `Account blocked: ${reason}`, 'risk');
    return updated;
  },

  async unblockPlayer(id: string): Promise<Player> {
    await adminRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' })
    });
    return (await this.getPlayer(id)) as Player;
  },

  async freezeWallet(id: string): Promise<Player> {
    const updated = await this.updatePlayer(id, { walletStatus: 'frozen' });
    await this.logActivity(updated.id, 'Wallet escrow assets frozen by Admin', 'risk');
    return updated;
  },

  async unfreezeWallet(id: string): Promise<Player> {
    const updated = await this.updatePlayer(id, { walletStatus: 'active' });
    await this.logActivity(updated.id, 'Wallet escrow assets unfrozen', 'status');
    return updated;
  },

  async approveKYC(id: string, notes = 'Manually verified by Compliance Admin'): Promise<Player> {
    const updated = await this.updatePlayer(id, {
      kycStatus: 'verified',
      kycReviewedAt: new Date().toISOString(),
      kycReviewNotes: notes,
    });
    await this.logActivity(updated.id, `KYC Documents Approved: ${notes}`, 'kyc');
    return updated;
  },

  async rejectKYC(id: string, reason: string): Promise<Player> {
    const updated = await this.updatePlayer(id, {
      kycStatus: 'rejected',
      kycReviewedAt: new Date().toISOString(),
      kycReviewNotes: reason,
    });
    await this.logActivity(updated.id, `KYC Rejected: ${reason}`, 'kyc');
    return updated;
  },

  async flagPlayer(id: string, flagReason: string): Promise<Player> {
    const player = await this.getPlayer(id);
    if (!player) throw new Error('Player not found');
    const existingFlags = player.riskFlags || [];
    const newFlags = existingFlags.includes(flagReason) ? existingFlags : [...existingFlags, flagReason];
    const newScore = Math.min(100, player.riskScore + 25);
    const newTier: PlayerRiskTier = newScore > 80 ? 'critical' : newScore > 50 ? 'high' : 'medium';

    const updated = await this.updatePlayer(id, {
      riskFlags: newFlags,
      riskScore: newScore,
      riskTier: newTier,
      riskReviewStatus: 'flagged',
    });
    await this.logActivity(updated.id, `Security Flag Added: ${flagReason}`, 'risk');
    return updated;
  },

  async markRiskReviewed(id: string): Promise<Player> {
    const updated = await this.updatePlayer(id, {
      riskReviewStatus: 'reviewed',
      riskLastReviewedAt: new Date().toISOString(),
    });
    await this.logActivity(updated.id, 'Risk review audit completed by Security Admin', 'risk');
    return updated;
  },

  async sendPlayerNotification(
    id: string,
    notification: { title: string; message: string; type: string }
  ): Promise<void> {
    await new Promise((res) => setTimeout(res, 80));
    await this.logActivity(id, `Notification Sent: "${notification.title}" (${notification.type})`, 'notification');
  },

  async bulkFreezeWallets(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.freezeWallet(id);
    }
  },

  async bulkSuspend(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.suspendPlayer(id, 'Bulk admin suspension');
    }
  },

  async bulkRestore(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.restorePlayer(id);
    }
  },

  async bulkUnblock(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.unblockPlayer(id);
    }
  },

  async getPlayerTransactions(playerId: string): Promise<PlayerTransaction[]> {
    await new Promise((res) => setTimeout(res, 40));
    const txns = loadFromStorage<Record<string, PlayerTransaction[]>>(TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
    return txns[playerId] || [];
  },

  async getPlayerGameHistory(playerId: string): Promise<PlayerGameHistory[]> {
    await new Promise((res) => setTimeout(res, 40));
    const hist = loadFromStorage<Record<string, PlayerGameHistory[]>>(HISTORY_KEY, INITIAL_GAME_HISTORY);
    return hist[playerId] || [];
  },

  async getPlayerSessions(playerId: string): Promise<PlayerSession[]> {
    await new Promise((res) => setTimeout(res, 40));
    const sess = loadFromStorage<Record<string, PlayerSession[]>>(SESSIONS_KEY, INITIAL_SESSIONS);
    return sess[playerId] || [];
  },

  async endPlayerSession(playerId: string, sessionId?: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 60));
    const sess = loadFromStorage<Record<string, PlayerSession[]>>(SESSIONS_KEY, INITIAL_SESSIONS);
    if (sess[playerId]) {
      sess[playerId] = sess[playerId].map((s) => (!sessionId || s.id === sessionId ? { ...s, status: 'Terminated' } : s));
      saveToStorage(SESSIONS_KEY, sess);
    }
    await this.updatePlayer(playerId, { status: 'offline', lastActiveDetail: 'Session ended by Admin' });
    await this.logActivity(playerId, `Session terminated remotely by Admin${sessionId ? ` (${sessionId})` : ''}`, 'status');
  },

  async endSession(playerId: string): Promise<void> {
    await this.endPlayerSession(playerId);
  },

  async getPlayerActivity(playerId: string): Promise<PlayerActivityEvent[]> {
    await new Promise((res) => setTimeout(res, 40));
    const act = loadFromStorage<Record<string, PlayerActivityEvent[]>>(ACTIVITY_KEY, INITIAL_ACTIVITY);
    return act[playerId] || [];
  },

  async logActivity(playerId: string, title: string, type: PlayerActivityEvent['type'] = 'status'): Promise<void> {
    const act = loadFromStorage<Record<string, PlayerActivityEvent[]>>(ACTIVITY_KEY, INITIAL_ACTIVITY);
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    const newEvent: PlayerActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId,
      timestamp,
      title,
      type,
    };
    const playerEvents = act[playerId] || [];
    act[playerId] = [newEvent, ...playerEvents];
    saveToStorage(ACTIVITY_KEY, act);
  },

  async getPlayerMetrics(): Promise<PlayerMetrics> {
    const players = await this.getPlayers();
    const verified = players.filter((p) => p.kycStatus === 'verified').length;
    const pending = players.filter((p) => p.kycStatus === 'pending').length;
    const rejected = players.filter((p) => p.kycStatus === 'rejected').length;
    const flagged = players.filter((p) => p.riskTier === 'high' || p.riskTier === 'critical' || (p.riskFlags && p.riskFlags.length > 0)).length;
    const active = players.filter((p) => p.status === 'active' || p.status === 'in_match').length;
    const suspended = players.filter((p) => p.status === 'suspended').length;
    const offline = players.filter((p) => p.status === 'offline').length;

    const totalReserve = players.reduce((sum, p) => sum + (p.balance || 0), 0);
    const kycRate = players.length > 0 ? Number(((verified / players.length) * 100).toFixed(1)) : 87.3;

    return {
      totalPlayers: 12840 + (players.length - INITIAL_PLAYERS.length),
      kycVerified: 11210 + (verified - 5),
      kycPending: pending,
      kycRejected: rejected,
      kycVerificationRate: kycRate,
      flaggedCount: 34 + (flagged - 2),
      activeCount: 2421 + (active - 4),
      suspendedCount: suspended,
      offlineCount: offline,
      walletReserveTotal: 4862000 + (totalReserve - 94800),
    };
  },
};
