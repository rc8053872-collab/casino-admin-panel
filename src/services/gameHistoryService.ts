import type {
  GameSession,
  GameRound,
  SessionPlayer,
  SessionTransaction,
  SessionEvent,
  SessionAuditLog,
  GameHistoryStats,
  HistoryFilterParams,
  PaginatedGameHistory,
} from '../types/gameHistory';

const STORAGE_KEY = 'game_admin_history_sessions_v2';

const INITIAL_SESSIONS: GameSession[] = [
  {
    id: 'sess-001',
    sessionId: 'GS-102829',
    roundId: 'RND-88412',
    gameId: 'GAME-001',
    gameName: "Texas Hold'em - High Roller Arena 01",
    gameType: 'Card',
    stakes: '₹500 / ₹1,000',
    tableId: 'TBL-PAS-004',
    status: 'completed',
    integrityStatus: 'rng_verified',
    startedAt: '2026-10-06T16:19:30Z',
    endedAt: '2026-10-06T16:38:12Z',
    duration: '18m 42s',
    playerCount: 6,
    peakPlayers: 6,
    playersList: [
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
      { id: 'PLR-10291', name: 'Priya Queen', username: 'priya_queen', playerId: '#10291', avatarInitials: 'PQ' },
      { id: 'PLR-10692', name: 'Shadow King', username: 'shadow_king', playerId: '#10692', avatarInitials: 'SK' },
      { id: 'PLR-10554', name: 'Rahul Pro', username: 'rahul_pro', playerId: '#10554', avatarInitials: 'RP' },
      { id: 'PLR-10118', name: 'Amit Shah', username: 'amit_s', playerId: '#10118', avatarInitials: 'AS' },
    ],
    totalPot: 84500,
    platformRake: 2957,
    totalPayout: 81543,
    winnerId: 'PLR-10482',
    winnerName: 'rohit_kumar',
    winnerPlayerId: '#10482',
    winningHandOrOutcome: 'Quad Aces (A A A A K) on board',
    rounds: 12,
    configurationVersion: 'v2.4.1-pro',
    serverSeedHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    clientSeed: 'usr_rnd_9182_entropy_prod_blitz-mum',
    communityCards: ['A♠', 'K♦', 'A♣', 'K♥', 'A♦'],
  },
  {
    id: 'sess-002',
    sessionId: 'GS-102828',
    roundId: 'RND-88411',
    gameId: 'GAME-005',
    gameName: 'Rapid Crash Rocket',
    gameType: 'Crash',
    stakes: '₹100 Dynamic',
    tableId: 'TBL-CRASH-01',
    status: 'completed',
    integrityStatus: 'provably_fair',
    startedAt: '2026-10-06T16:34:16Z',
    endedAt: '2026-10-06T16:36:30Z',
    duration: '2m 14s',
    playerCount: 112,
    peakPlayers: 132,
    playersList: [
      { id: 'PLR-10332', name: 'Amit Raj', username: 'amit_raj', playerId: '#10332', avatarInitials: 'AR' },
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
    ],
    totalPot: 248900,
    platformRake: 6222,
    totalPayout: 242678,
    winnerId: 'PLR-10332',
    winnerName: 'amit_raj',
    winnerPlayerId: '#10332',
    winningHandOrOutcome: 'Crashed @ 4.42x (Top payout: amit_raj ₹48,500)',
    rounds: 1,
    configurationVersion: 'v1.8.0-turbocrash',
    serverSeedHash: '3a4f891b2c6d7e8f90123456789abcdef0123456789abcdef0123456789abcde',
    clientSeed: 'client_entropy_4407_flight',
  },
  {
    id: 'sess-003',
    sessionId: 'GS-102827',
    roundId: 'RND-88410',
    gameId: 'GAME-002',
    gameName: 'Speed Ludo 4P',
    gameType: 'Board',
    stakes: '₹250 Buy-in',
    tableId: 'TBL-LUDO-08',
    status: 'completed',
    integrityStatus: 'clean_showdown',
    startedAt: '2026-10-06T16:16:44Z',
    endedAt: '2026-10-06T16:31:04Z',
    duration: '14m 20s',
    playerCount: 4,
    peakPlayers: 4,
    playersList: [
      { id: 'PLR-10291', name: 'Priya Queen', username: 'priya_queen', playerId: '#10291', avatarInitials: 'PQ' },
      { id: 'PLR-10771', name: 'Manu K', username: 'manu_k', playerId: '#10771', avatarInitials: 'MK' },
      { id: 'PLR-10882', name: 'Ajay Verma', username: 'ajay_v', playerId: '#10882', avatarInitials: 'AV' },
      { id: 'PLR-10993', name: 'Simran Deep', username: 'simran_d', playerId: '#10993', avatarInitials: 'SD' },
    ],
    totalPot: 1000,
    platformRake: 80,
    totalPayout: 920,
    winnerId: 'PLR-10291',
    winnerName: 'priya_queen',
    winnerPlayerId: '#10291',
    winningHandOrOutcome: 'Rank 1: 4 Tokens home (₹920)',
    rounds: 1,
    configurationVersion: 'v3.1.2-ludo',
    serverSeedHash: '8b9c0d1e2f3a4b5c6d7e8f901234567890abcdef1234567890abcdef12345678',
    clientSeed: 'dice_entropy_prng_v4',
  },
  {
    id: 'sess-004',
    sessionId: 'GS-102826',
    roundId: 'RND-88409',
    gameId: 'GAME-001',
    gameName: 'Pot Limit Omaha 6-Card',
    gameType: 'Card',
    stakes: '₹100 / ₹200',
    tableId: 'TBL-PLO-03',
    status: 'disputed',
    integrityStatus: 'under_review',
    startedAt: '2026-10-06T15:59:35Z',
    endedAt: '2026-10-06T16:27:45Z',
    duration: '28m 10s',
    playerCount: 6,
    peakPlayers: 6,
    playersList: [
      { id: 'PLR-10389', name: 'Sunil Kumar', username: 'sunil_k89', playerId: '#10389', avatarInitials: 'SK' },
      { id: 'PLR-10692', name: 'Shadow King', username: 'shadow_king', playerId: '#10692', avatarInitials: 'SK' },
      { id: 'PLR-10554', name: 'Rahul Pro', username: 'rahul_pro', playerId: '#10554', avatarInitials: 'RP' },
    ],
    totalPot: 34100,
    platformRake: 1193,
    totalPayout: 32907,
    winnerId: 'PLR-10389',
    winnerName: 'sunil_k89',
    winnerPlayerId: '#10389',
    winningHandOrOutcome: 'Pending Claim (Mid-Push vs Disconnected Turn Bettor)',
    rounds: 8,
    configurationVersion: 'v2.2.0-plo',
    serverSeedHash: 'c4ca4238a0b923820dcc509a6f75849b2075849b2075849b2075849b2075849b',
    clientSeed: 'client_entropy_plo_desk',
    disputeNotes: 'Player claims disconnect during turn action while hand was ahead on flop equity.',
  },
  {
    id: 'sess-005',
    sessionId: 'GS-102825',
    roundId: 'RND-88408',
    gameId: 'GAME-004',
    gameName: 'Mega Multiplier Wheel',
    gameType: 'Wheel',
    stakes: '₹50 Min',
    tableId: 'TBL-WHEEL-01',
    status: 'completed',
    integrityStatus: 'rng_verified',
    startedAt: '2026-10-06T16:16:45Z',
    endedAt: '2026-10-06T16:18:00Z',
    duration: '1m 15s',
    playerCount: 324,
    peakPlayers: 348,
    playersList: [
      { id: 'PLR-10444', name: 'Aman Punjabi', username: 'aman_punjabi', playerId: '#10444', avatarInitials: 'AP' },
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
    ],
    totalPot: 118300,
    platformRake: 3549,
    totalPayout: 114751,
    winnerId: 'PLR-10444',
    winnerName: 'aman_punjabi',
    winnerPlayerId: '#10444',
    winningHandOrOutcome: 'Result: 28x Red (Top: aman_punjabi ₹28,500)',
    rounds: 1,
    configurationVersion: 'v1.4.0-wheel',
    serverSeedHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    clientSeed: 'wheel_angular_entropy_99',
  },
  {
    id: 'sess-006',
    sessionId: 'GS-102824',
    roundId: 'RND-88407',
    gameId: 'GAME-001',
    gameName: "Texas Hold'em 6-Max",
    gameType: 'Card',
    stakes: '₹100 / ₹200',
    tableId: 'TBL-PAS-002',
    status: 'completed',
    integrityStatus: 'rng_verified',
    startedAt: '2026-10-06T15:53:19Z',
    endedAt: '2026-10-06T16:12:30Z',
    duration: '19m 11s',
    playerCount: 6,
    peakPlayers: 6,
    playersList: [
      { id: 'PLR-10511', name: 'Shawn Son', username: 'shawn_son', playerId: '#10511', avatarInitials: 'SS' },
      { id: 'PLR-10692', name: 'Shadow King', username: 'shadow_king', playerId: '#10692', avatarInitials: 'SK' },
    ],
    totalPot: 18450,
    platformRake: 645,
    totalPayout: 17805,
    winnerName: 'Split Pot',
    winningHandOrOutcome: 'Split Pot (Straight on Board) (shawn_son & shadow_king ₹8,902 ea)',
    rounds: 14,
    configurationVersion: 'v2.4.1-pro',
    serverSeedHash: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
    clientSeed: 'client_entropy_6max_04',
    communityCards: ['9♠', '10♦', 'J♣', 'Q♥', 'K♦'],
  },
  {
    id: 'sess-007',
    sessionId: 'GS-102823',
    roundId: 'RND-88406',
    gameId: 'GAME-002',
    gameName: 'Ludo Quick 1v1 Battle',
    gameType: 'Board',
    stakes: '₹250 Entry',
    tableId: 'TBL-LUDO-40',
    status: 'completed',
    integrityStatus: 'clean_showdown',
    startedAt: '2026-10-06T15:54:34Z',
    endedAt: '2026-10-06T16:04:19Z',
    duration: '9m 45s',
    playerCount: 2,
    peakPlayers: 2,
    playersList: [
      { id: 'PLR-10554', name: 'Rahul Pro', username: 'rahul_pro', playerId: '#10554', avatarInitials: 'RP' },
      { id: 'PLR-10932', name: 'Gamer X99', username: 'gamer_x99', playerId: '#10932', avatarInitials: 'GX' },
    ],
    totalPot: 500,
    platformRake: 45,
    totalPayout: 455,
    winnerId: 'PLR-10554',
    winnerName: 'rahul_pro',
    winnerPlayerId: '#10554',
    winningHandOrOutcome: 'Winner Take All (₹455)',
    rounds: 1,
    configurationVersion: 'v3.1.2-ludo',
    serverSeedHash: 'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100',
    clientSeed: 'duel_client_entropy',
  },
  {
    id: 'sess-008',
    sessionId: 'GS-102822',
    roundId: 'RND-88405',
    gameId: 'GAME-003',
    gameName: 'Teen Patti Blitz',
    gameType: 'Card',
    stakes: '₹50 / ₹100',
    tableId: 'TBL-TP-01',
    status: 'cancelled',
    integrityStatus: 'under_review',
    startedAt: '2026-10-06T15:40:00Z',
    endedAt: '2026-10-06T15:42:15Z',
    duration: '2m 15s',
    playerCount: 5,
    peakPlayers: 6,
    playersList: [
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
    ],
    totalPot: 4500,
    platformRake: 0,
    totalPayout: 0,
    winningHandOrOutcome: 'Cancelled (Server Edge Packet Loss)',
    rounds: 1,
    configurationVersion: 'v1.1.0-tp',
    cancellationReason: 'Cluster network jitter detected at hand distribution.',
    refundAmount: 4500,
    serverSeedHash: 'aaabbbcccdddeeefff000111222333444555666777888999aaabbbcccdddeeefff',
    clientSeed: 'cancelled_hand_entropy',
  },
  {
    id: 'sess-009',
    sessionId: 'GS-102821',
    roundId: 'RND-88404',
    gameId: 'GAME-006',
    gameName: 'Carrom Clash Royale',
    gameType: 'Board',
    stakes: '₹150 Buy-in',
    tableId: 'TBL-CRM-09',
    status: 'abandoned',
    integrityStatus: 'under_review',
    startedAt: '2026-10-06T15:10:00Z',
    endedAt: '2026-10-06T15:15:30Z',
    duration: '5m 30s',
    playerCount: 2,
    peakPlayers: 2,
    playersList: [
      { id: 'PLR-10729', name: 'Ananya K', username: 'ananya_k', playerId: '#10729', avatarInitials: 'AK' },
      { id: 'PLR-10991', name: 'Kiran Patel', username: 'kiran_p', playerId: '#10991', avatarInitials: 'KP' },
    ],
    totalPot: 300,
    platformRake: 0,
    totalPayout: 0,
    winningHandOrOutcome: 'Abandoned (Opponent Forfeit)',
    rounds: 1,
    configurationVersion: 'v1.0.4-crm',
    cancellationReason: 'Opponent disconnected beyond 90s grace threshold.',
    refundAmount: 300,
    serverSeedHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    clientSeed: 'abandoned_client_entropy',
  },
  {
    id: 'sess-010',
    sessionId: 'GS-102820',
    roundId: 'RND-88403',
    gameId: 'GAME-007',
    gameName: 'European Lightning Roulette',
    gameType: 'Wheel',
    stakes: '₹100 - ₹50,000',
    tableId: 'TBL-ROUL-01',
    status: 'completed',
    integrityStatus: 'rng_verified',
    startedAt: '2026-10-06T14:45:00Z',
    endedAt: '2026-10-06T14:46:20Z',
    duration: '1m 20s',
    playerCount: 184,
    peakPlayers: 210,
    playersList: [
      { id: 'PLR-10291', name: 'Priya Queen', username: 'priya_queen', playerId: '#10291', avatarInitials: 'PQ' },
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
      { id: 'PLR-10332', name: 'Amit Raj', username: 'amit_raj', playerId: '#10332', avatarInitials: 'AR' },
    ],
    totalPot: 540000,
    platformRake: 18900,
    totalPayout: 521100,
    winnerId: 'PLR-10291',
    winnerName: 'priya_queen',
    winnerPlayerId: '#10291',
    winningHandOrOutcome: 'Number 17 Black (50x Lightning Multiplier)',
    rounds: 1,
    configurationVersion: 'v2.1.0-roul',
    serverSeedHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    clientSeed: 'roulette_wheel_entropy_17',
  },
  {
    id: 'sess-011',
    sessionId: 'GS-102819',
    roundId: 'RND-88402',
    gameId: 'GAME-008',
    gameName: 'Rummy Premier League 6P',
    gameType: 'Card',
    stakes: '₹200 Points',
    tableId: 'TBL-RUMMY-12',
    status: 'completed',
    integrityStatus: 'clean_showdown',
    startedAt: '2026-10-06T14:20:10Z',
    endedAt: '2026-10-06T14:32:50Z',
    duration: '12m 40s',
    playerCount: 6,
    peakPlayers: 6,
    playersList: [
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
      { id: 'PLR-10554', name: 'Rahul Pro', username: 'rahul_pro', playerId: '#10554', avatarInitials: 'RP' },
      { id: 'PLR-10118', name: 'Amit Shah', username: 'amit_s', playerId: '#10118', avatarInitials: 'AS' },
    ],
    totalPot: 14400,
    platformRake: 1152,
    totalPayout: 13248,
    winnerId: 'PLR-10821',
    winnerName: 'vikram_ace',
    winnerPlayerId: '#10821',
    winningHandOrOutcome: 'Pure Sequence Declared (0 Points Full Show)',
    rounds: 3,
    configurationVersion: 'v3.0.1-rummy',
    serverSeedHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    clientSeed: 'rummy_card_deck_seed_06',
  },
  {
    id: 'sess-012',
    sessionId: 'GS-102818',
    roundId: 'RND-88401',
    gameId: 'GAME-009',
    gameName: 'Aviator Altitude X',
    gameType: 'Crash',
    stakes: '₹50 Auto-Cashout',
    tableId: 'TBL-AVIATOR-02',
    status: 'completed',
    integrityStatus: 'provably_fair',
    startedAt: '2026-10-06T14:05:12Z',
    endedAt: '2026-10-06T14:07:00Z',
    duration: '1m 48s',
    playerCount: 142,
    peakPlayers: 160,
    playersList: [
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
      { id: 'PLR-10332', name: 'Amit Raj', username: 'amit_raj', playerId: '#10332', avatarInitials: 'AR' },
    ],
    totalPot: 320000,
    platformRake: 9600,
    totalPayout: 310400,
    winnerId: 'PLR-10482',
    winnerName: 'rohit_kumar',
    winnerPlayerId: '#10482',
    winningHandOrOutcome: 'Flew Away @ 8.12x (Max cashout: rohit_kumar ₹92,000)',
    rounds: 1,
    configurationVersion: 'v2.0.4-aviator',
    serverSeedHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    clientSeed: 'flight_curve_entropy_991',
  },
  {
    id: 'sess-013',
    sessionId: 'GS-102817',
    roundId: 'RND-88400',
    gameId: 'GAME-003',
    gameName: 'Teen Patti Royal 3P',
    gameType: 'Card',
    stakes: '₹500 / ₹1,000',
    tableId: 'TBL-TP-07',
    status: 'disputed',
    integrityStatus: 'under_review',
    startedAt: '2026-10-06T13:40:00Z',
    endedAt: '2026-10-06T13:48:15Z',
    duration: '8m 15s',
    playerCount: 3,
    peakPlayers: 3,
    playersList: [
      { id: 'PLR-10554', name: 'Rahul Pro', username: 'rahul_pro', playerId: '#10554', avatarInitials: 'RP' },
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
      { id: 'PLR-10118', name: 'Amit Shah', username: 'amit_s', playerId: '#10118', avatarInitials: 'AS' },
    ],
    totalPot: 15000,
    platformRake: 525,
    totalPayout: 14475,
    winnerId: 'PLR-10554',
    winnerName: 'rahul_pro',
    winnerPlayerId: '#10554',
    winningHandOrOutcome: 'Disputed Showdown (Auto-fold timer latency reported by PLR-10821)',
    rounds: 5,
    configurationVersion: 'v1.1.2-tp',
    serverSeedHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    clientSeed: 'teen_patti_entropy_royal',
    disputeNotes: 'Player claims button press registered before 10s countdown reached zero due to socket lag.',
  },
  {
    id: 'sess-014',
    sessionId: 'GS-102816',
    roundId: 'RND-88399',
    gameId: 'GAME-008',
    gameName: 'Points Rummy Express 2P',
    gameType: 'Card',
    stakes: '₹500 Entry',
    tableId: 'TBL-RUMMY-04',
    status: 'cancelled',
    integrityStatus: 'clean_showdown',
    startedAt: '2026-10-06T13:15:00Z',
    endedAt: '2026-10-06T13:15:45Z',
    duration: '0m 45s',
    playerCount: 2,
    peakPlayers: 2,
    playersList: [
      { id: 'PLR-10291', name: 'Priya Queen', username: 'priya_queen', playerId: '#10291', avatarInitials: 'PQ' },
      { id: 'PLR-10692', name: 'Shadow King', username: 'shadow_king', playerId: '#10692', avatarInitials: 'SK' },
    ],
    totalPot: 1000,
    platformRake: 0,
    totalPayout: 0,
    winningHandOrOutcome: 'Cancelled (Live Edge Node Rebalance)',
    rounds: 1,
    configurationVersion: 'v3.0.1-rummy',
    cancellationReason: 'Scheduled maintenance failover executed during deck deal.',
    refundAmount: 1000,
    serverSeedHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    clientSeed: 'cancelled_rummy_entropy',
  },
  {
    id: 'sess-015',
    sessionId: 'GS-102815',
    roundId: 'RND-88398',
    gameId: 'GAME-010',
    gameName: 'VIP Blackjack Diamond',
    gameType: 'Card',
    stakes: '₹2,000 / Hand',
    tableId: 'TBL-BJ-01',
    status: 'completed',
    integrityStatus: 'rng_verified',
    startedAt: '2026-10-06T12:45:00Z',
    endedAt: '2026-10-06T13:07:10Z',
    duration: '22m 10s',
    playerCount: 5,
    peakPlayers: 5,
    playersList: [
      { id: 'PLR-10692', name: 'Shadow King', username: 'shadow_king', playerId: '#10692', avatarInitials: 'SK' },
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
    ],
    totalPot: 160000,
    platformRake: 4800,
    totalPayout: 155200,
    winnerId: 'PLR-10692',
    winnerName: 'shadow_king',
    winnerPlayerId: '#10692',
    winningHandOrOutcome: 'Natural Blackjack (A♠ J♣ vs Dealer 19)',
    rounds: 16,
    configurationVersion: 'v2.2.0-bj',
    serverSeedHash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    clientSeed: 'blackjack_shoe_entropy_v8',
    communityCards: ['A♠', 'J♣', '10♦', '9♥'],
  },
  {
    id: 'sess-016',
    sessionId: 'GS-102814',
    roundId: 'RND-88397',
    gameId: 'GAME-002',
    gameName: 'Speed Ludo 2P Knockout',
    gameType: 'Board',
    stakes: '₹100 Entry',
    tableId: 'TBL-LUDO-19',
    status: 'abandoned',
    integrityStatus: 'under_review',
    startedAt: '2026-10-06T12:20:00Z',
    endedAt: '2026-10-06T12:24:12Z',
    duration: '4m 12s',
    playerCount: 2,
    peakPlayers: 2,
    playersList: [
      { id: 'PLR-10932', name: 'Gamer X99', username: 'gamer_x99', playerId: '#10932', avatarInitials: 'GX' },
      { id: 'PLR-10771', name: 'Manu K', username: 'manu_k', playerId: '#10771', avatarInitials: 'MK' },
    ],
    totalPot: 200,
    platformRake: 0,
    totalPayout: 0,
    winningHandOrOutcome: 'Abandoned (Heartbeat Timeout)',
    rounds: 1,
    configurationVersion: 'v3.1.2-ludo',
    cancellationReason: 'Player 2 dropped connection on final home path beyond retry ceiling.',
    refundAmount: 200,
    serverSeedHash: 'cb51e3333ac638c87097ced52234e7d08285b23d1f0768370085b5735b2bee3a',
    clientSeed: 'ludo_abandoned_turn_entropy',
  },
  {
    id: 'sess-017',
    sessionId: 'GS-102813',
    roundId: 'RND-88396',
    gameId: 'GAME-011',
    gameName: 'Dragon Tiger Duel',
    gameType: 'Card',
    stakes: '₹500 Flat',
    tableId: 'TBL-DT-05',
    status: 'completed',
    integrityStatus: 'rng_verified',
    startedAt: '2026-10-06T12:00:00Z',
    endedAt: '2026-10-06T12:00:52Z',
    duration: '0m 52s',
    playerCount: 88,
    peakPlayers: 94,
    playersList: [
      { id: 'PLR-10332', name: 'Amit Raj', username: 'amit_raj', playerId: '#10332', avatarInitials: 'AR' },
      { id: 'PLR-10291', name: 'Priya Queen', username: 'priya_queen', playerId: '#10291', avatarInitials: 'PQ' },
    ],
    totalPot: 96000,
    platformRake: 2880,
    totalPayout: 93120,
    winnerId: 'PLR-10332',
    winnerName: 'amit_raj',
    winnerPlayerId: '#10332',
    winningHandOrOutcome: 'Dragon Wins (K♥ vs 9♣)',
    rounds: 1,
    configurationVersion: 'v1.0.8-dt',
    serverSeedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    clientSeed: 'dragon_tiger_deck_entropy',
  },
  {
    id: 'sess-018',
    sessionId: 'GS-102812',
    roundId: 'RND-88395',
    gameId: 'GAME-001',
    gameName: 'Omaha Hi-Lo Pot Limit',
    gameType: 'Card',
    stakes: '₹250 / ₹500',
    tableId: 'TBL-PLO-08',
    status: 'disputed',
    integrityStatus: 'under_review',
    startedAt: '2026-10-06T11:30:00Z',
    endedAt: '2026-10-06T11:46:30Z',
    duration: '16m 30s',
    playerCount: 6,
    peakPlayers: 6,
    playersList: [
      { id: 'PLR-10482', name: 'Rohit Kumar', username: 'rohit_kumar', playerId: '#10482', avatarInitials: 'RK' },
      { id: 'PLR-10821', name: 'Vikram Ace', username: 'vikram_ace', playerId: '#10821', avatarInitials: 'VA' },
      { id: 'PLR-10554', name: 'Rahul Pro', username: 'rahul_pro', playerId: '#10554', avatarInitials: 'RP' },
    ],
    totalPot: 42000,
    platformRake: 1470,
    totalPayout: 40530,
    winnerId: 'PLR-10482',
    winnerName: 'rohit_kumar',
    winnerPlayerId: '#10482',
    winningHandOrOutcome: 'Split Claim Disputed (A-2-3-4-5 Low vs Flush High)',
    rounds: 9,
    configurationVersion: 'v2.2.0-plo',
    serverSeedHash: 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2',
    clientSeed: 'hilo_entropy_split_check',
    communityCards: ['A♣', '2♦', '3♥', '8♠', 'K♣'],
    disputeNotes: 'Low hand qualification dispute raised by table runner-up regarding active card eligibility.',
  },
];

const INITIAL_ROUNDS: Record<string, GameRound[]> = {
  'GS-102829': [
    {
      id: 'rnd-12',
      sessionId: 'GS-102829',
      roundNumber: 12,
      startedAt: '16:36:10',
      endedAt: '16:38:12',
      duration: '2m 02s',
      playerCount: 6,
      winnerId: 'PLR-10482',
      winnerName: 'rohit_kumar',
      pot: 84500,
      rake: 2957,
      status: 'completed',
      playerActions: [
        { player: 'vikram_ace', playerId: '#10821', action: 'Small Blind Posted (₹500)', timestamp: '16:36:12', result: 'Success' },
        { player: 'priya_queen', playerId: '#10291', action: 'Big Blind Posted (₹1,000)', timestamp: '16:36:14', result: 'Success' },
        { player: 'rohit_kumar', playerId: '#10482', action: 'Raise to ₹3,000', timestamp: '16:36:25', result: 'Success' },
        { player: 'amit_s', playerId: '#10118', action: 'Call ₹3,000', timestamp: '16:36:30', result: 'Success' },
        { player: 'shadow_king', playerId: '#10692', action: 'All-in ₹38,000', timestamp: '16:36:45', result: 'Action Logged' },
        { player: 'rohit_kumar', playerId: '#10482', action: 'Call All-in ₹38,000', timestamp: '16:37:10', result: 'Confirmed' },
        { player: 'rohit_kumar', playerId: '#10482', action: 'Showdown: Quad Aces (A A A A K)', timestamp: '16:38:05', result: 'Pot Awarded' },
      ],
    },
    {
      id: 'rnd-11',
      sessionId: 'GS-102829',
      roundNumber: 11,
      startedAt: '16:34:00',
      endedAt: '16:35:45',
      duration: '1m 45s',
      playerCount: 6,
      winnerId: 'PLR-10692',
      winnerName: 'shadow_king',
      pot: 24200,
      rake: 847,
      status: 'completed',
      playerActions: [
        { player: 'rohit_kumar', playerId: '#10482', action: 'Check', timestamp: '16:34:10', result: 'Success' },
        { player: 'shadow_king', playerId: '#10692', action: 'Bet ₹12,000', timestamp: '16:34:30', result: 'Success' },
        { player: 'priya_queen', playerId: '#10291', action: 'Fold', timestamp: '16:34:40', result: 'Folded' },
        { player: 'rohit_kumar', playerId: '#10482', action: 'Fold', timestamp: '16:35:00', result: 'Folded' },
      ],
    },
  ],
  'GS-102826': [
    {
      id: 'rnd-plo-8',
      sessionId: 'GS-102826',
      roundNumber: 8,
      startedAt: '16:24:10',
      endedAt: '16:27:45',
      duration: '3m 35s',
      playerCount: 6,
      winnerId: 'PLR-10389',
      winnerName: 'sunil_k89',
      pot: 34100,
      rake: 1193,
      status: 'disputed',
      playerActions: [
        { player: 'sunil_k89', playerId: '#10389', action: 'Pot Bet ₹8,500 on Flop', timestamp: '16:24:30', result: 'Success' },
        { player: 'shadow_king', playerId: '#10692', action: 'Call ₹8,500', timestamp: '16:24:45', result: 'Success' },
        { player: 'rahul_pro', playerId: '#10554', action: 'Turn Disconnect Flagged', timestamp: '16:25:20', result: 'Grace Timer Active' },
        { player: 'sunil_k89', playerId: '#10389', action: 'All-in Push ₹17,100', timestamp: '16:26:00', result: 'Claim Disputed' },
      ],
    },
  ],
  'GS-102828': [
    {
      id: 'rnd-crash-1',
      sessionId: 'GS-102828',
      roundNumber: 1,
      startedAt: '16:34:16',
      endedAt: '16:36:30',
      duration: '2m 14s',
      playerCount: 112,
      winnerId: 'PLR-10332',
      winnerName: 'amit_raj',
      pot: 248900,
      rake: 6222,
      status: 'completed',
      playerActions: [
        { player: 'System Engine', playerId: 'SYS', action: 'Countdown started (10s)', timestamp: '16:34:16', result: 'Multiplier Active' },
        { player: 'amit_raj', playerId: '#10332', action: 'Auto-Cashout @ 4.12x (₹48,500)', timestamp: '16:36:12', result: 'Payout Dispatched' },
        { player: 'System Engine', playerId: 'SYS', action: 'Rocket Crashed @ 4.42x', timestamp: '16:36:30', result: 'Round Concluded' },
      ],
    },
  ],
  'GS-102820': [
    {
      id: 'rnd-roul-1',
      sessionId: 'GS-102820',
      roundNumber: 1,
      startedAt: '14:45:00',
      endedAt: '14:46:20',
      duration: '1m 20s',
      playerCount: 184,
      winnerId: 'PLR-10291',
      winnerName: 'priya_queen',
      pot: 540000,
      rake: 18900,
      status: 'completed',
      playerActions: [
        { player: 'Croupier Engine', playerId: 'RNG', action: 'Bets Closed • Ball In Motion', timestamp: '14:45:30', result: 'RNG Spin' },
        { player: 'Lightning Strike', playerId: 'SYS', action: 'Lightning Numbers: 17 Black (50x), 4 Red (100x)', timestamp: '14:45:45', result: 'Multiplier Assigned' },
        { player: 'priya_queen', playerId: '#10291', action: 'Straight Bet on 17 Black (₹10,000 x 50x = ₹5,00,000)', timestamp: '14:46:20', result: 'Settled' },
      ],
    },
  ],
};

function loadStoredSessions(): GameSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn(err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SESSIONS));
  return INITIAL_SESSIONS;
}

function saveStoredSessions(sessions: GameSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn(err);
  }
}

export const gameHistoryService = {
  /**
   * Returns paginated and filtered historical game sessions
   */
  async getGameHistory(params: HistoryFilterParams = {}): Promise<PaginatedGameHistory> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const allSessions = loadStoredSessions();

    const tabCounts = {
      all: allSessions.length,
      completed: allSessions.filter((s) => s.status === 'completed').length,
      cancelled: allSessions.filter((s) => s.status === 'cancelled').length,
      abandoned: allSessions.filter((s) => s.status === 'abandoned').length,
      disputed: allSessions.filter((s) => s.status === 'disputed').length,
    };

    let filtered = allSessions.filter((session) => {
      // Status Tab
      if (params.statusTab && params.statusTab !== 'all') {
        if (session.status !== params.statusTab) return false;
      }

      // Quick filter badges
      if (params.flaggedOnly && session.integrityStatus !== 'under_review' && session.status !== 'disputed') {
        return false;
      }
      if (params.highStakesOnly && session.totalPot < 10000) {
        return false;
      }
      if (params.multiplayerOnly && session.playerCount < 4) {
        return false;
      }

      // Search (Game ID, Session ID, Round ID, Player name, Winner, Table ID)
      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        const matchGameId = session.gameId.toLowerCase().includes(q);
        const matchSessionId = session.sessionId.toLowerCase().includes(q);
        const matchRoundId = session.roundId.toLowerCase().includes(q);
        const matchGameName = session.gameName.toLowerCase().includes(q);
        const matchTable = session.tableId.toLowerCase().includes(q);
        const matchWinner = (session.winnerName || '').toLowerCase().includes(q) || (session.winnerPlayerId || '').toLowerCase().includes(q);
        const matchPlayers = session.playersList.some(
          (p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || p.playerId.toLowerCase().includes(q)
        );
        if (!matchGameId && !matchSessionId && !matchRoundId && !matchGameName && !matchTable && !matchWinner && !matchPlayers) {
          return false;
        }
      }

      // Game filter
      if (params.gameId && params.gameId !== 'all') {
        if (session.gameId !== params.gameId && !session.gameName.toLowerCase().includes(params.gameId.toLowerCase())) {
          return false;
        }
      }

      // Game Type filter
      if (params.gameType && params.gameType !== 'all') {
        if (session.gameType.toLowerCase() !== params.gameType.toLowerCase()) {
          return false;
        }
      }

      // Result filter
      if (params.result && params.result !== 'all') {
        if (session.status.toLowerCase() !== params.result.toLowerCase()) {
          return false;
        }
      }

      // Player Count filter
      if (params.playerCount && params.playerCount !== 'any') {
        if (params.playerCount === '1-10' && (session.playerCount < 1 || session.playerCount > 10)) return false;
        if (params.playerCount === '11-50' && (session.playerCount < 11 || session.playerCount > 50)) return false;
        if (params.playerCount === '51-100' && (session.playerCount < 51 || session.playerCount > 100)) return false;
        if (params.playerCount === '100+' && session.playerCount <= 100) return false;
      }

      return true;
    });

    // Sorting
    if (params.sortBy) {
      const order = params.sortOrder === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        if (params.sortBy === 'totalPot') return (a.totalPot - b.totalPot) * order;
        if (params.sortBy === 'totalPayout') return (a.totalPayout - b.totalPayout) * order;
        if (params.sortBy === 'playerCount') return (a.playerCount - b.playerCount) * order;
        if (params.sortBy === 'duration') return a.duration.localeCompare(b.duration) * order;
        if (params.sortBy === 'status') return a.status.localeCompare(b.status) * order;
        if (params.sortBy === 'started') return (new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()) * order;
        return 0;
      });
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginatedSessions = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      sessions: paginatedSessions,
      total,
      page,
      pageSize,
      totalPages,
      tabCounts,
    };
  },

  /**
   * Fetches single session by session ID or round ID
   */
  async getGameSession(id: string): Promise<GameSession | null> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    const all = loadStoredSessions();
    return (
      all.find(
        (s) =>
          s.id === id ||
          s.sessionId.toLowerCase() === id.toLowerCase() ||
          s.roundId.toLowerCase() === id.toLowerCase()
      ) || null
    );
  },

  /**
   * Returns rounds associated with a session
   */
  async getGameRounds(sessionId: string): Promise<GameRound[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    if (INITIAL_ROUNDS[sessionId]) return INITIAL_ROUNDS[sessionId];
    const session = await this.getGameSession(sessionId);
    if (!session) return [];

    // Fallback generated rounds matching session
    return Array.from({ length: Math.min(session.rounds, 6) }).map((_, idx) => ({
      id: `rnd-${idx + 1}`,
      sessionId: session.sessionId,
      roundNumber: idx + 1,
      startedAt: '16:20:00',
      endedAt: '16:22:15',
      duration: '2m 15s',
      playerCount: session.playerCount,
      winnerId: session.winnerId,
      winnerName: session.winnerName,
      pot: Math.round(session.totalPot / session.rounds),
      rake: Math.round(session.platformRake / session.rounds),
      status: 'completed',
      playerActions: [
        { player: session.winnerName || 'Player 1', playerId: '#10482', action: 'Fold / Win', timestamp: '16:21:00', result: 'Success' },
      ],
    }));
  },

  /**
   * Returns players involved in the session
   */
  async getSessionPlayers(sessionId: string): Promise<SessionPlayer[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    const session = await this.getGameSession(sessionId);
    if (!session) return [];

    return session.playersList.map((p, idx) => ({
      id: `sp-${p.id}`,
      playerId: p.playerId,
      name: p.name,
      username: p.username,
      avatarInitials: p.avatarInitials,
      joinedAt: '16:19:30',
      leftAt: '16:38:12',
      rounds: session.rounds,
      score: 12000 - idx * 1800,
      rank: idx + 1,
      payout: idx === 0 ? session.totalPayout : 0,
      status: idx === 0 ? 'Winner' : 'Folded',
    }));
  },

  /**
   * Returns session transactions
   */
  async getSessionTransactions(sessionId: string): Promise<SessionTransaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    const session = await this.getGameSession(sessionId);
    if (!session) return [];

    const txns: SessionTransaction[] = [
      {
        id: 'tx-01',
        transactionId: `TXN-${session.sessionId}-001`,
        playerId: session.winnerPlayerId || '#10482',
        playerName: session.winnerName || 'Winner',
        type: 'Prize',
        amount: session.totalPayout,
        time: '16:38:15',
        status: 'Settled',
      },
      {
        id: 'tx-02',
        transactionId: `TXN-${session.sessionId}-RAKE`,
        playerId: 'PLATFORM',
        playerName: 'Platform House Rake (3.5%)',
        type: 'Fee',
        amount: session.platformRake,
        time: '16:38:14',
        status: 'Settled',
      },
    ];

    session.playersList.forEach((p, idx) => {
      txns.push({
        id: `tx-entry-${idx}`,
        transactionId: `TXN-${session.sessionId}-BUY-${idx + 1}`,
        playerId: p.playerId,
        playerName: p.name,
        type: 'Entry',
        amount: Math.round(session.totalPot / session.playerCount),
        time: '16:19:32',
        status: 'Settled',
      });
    });

    return txns;
  },

  /**
   * Returns timeline events for session
   */
  async getSessionTimeline(_sessionId: string): Promise<SessionEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return [
      { time: '16:19:30', description: 'Table initialized on Edge Cluster BOM-01', type: 'start' },
      { time: '16:19:34', description: 'Client & Server Cryptographic Seeds Exchanged', type: 'start' },
      { time: '16:20:10', description: 'Blinds & Initial Buy-in pool confirmed', type: 'round' },
      { time: '16:25:40', description: 'Hand history verification passed SHA-256 integrity', type: 'round' },
      { time: '16:36:10', description: 'Final showdown round triggered', type: 'round' },
      { time: '16:38:12', description: 'Game concluded. Winning hand confirmed.', type: 'end' },
      { time: '16:38:14', description: 'Rake deduction (3.5%) applied to platform vault', type: 'payout' },
      { time: '16:38:15', description: 'Net payout dispatched to player wallet', type: 'payout' },
    ];
  },

  /**
   * Returns audit logs for session
   */
  async getSessionAuditLog(sessionId: string): Promise<SessionAuditLog[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return [
      { timestamp: '16:19:30', actor: 'Game Engine', action: 'Table Opened', entity: sessionId, details: 'Created table configuration v2.4.1' },
      { timestamp: '16:19:35', actor: 'RNG Service', action: 'Seed Generated', entity: 'SHA-256 Entropy', details: 'Client + Server pair signed' },
      { timestamp: '16:36:10', actor: 'Engine Validator', action: 'Showdown Hand Ranked', entity: 'Rank: Quad Aces', details: 'Kicker Ace-King confirmed' },
      { timestamp: '16:38:14', actor: 'Billing Gateway', action: 'Settlement Ledger Settled', entity: 'Platform Rake', details: '₹2,957 recorded' },
      { timestamp: '16:38:15', actor: 'Wallet Service', action: 'Payout Dispatched', entity: 'Winner Wallet', details: '₹81,543 credited' },
    ];
  },

  /**
   * Top KPI statistics matching reference screenshot
   */
  async getGameHistoryStats(): Promise<GameHistoryStats> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return {
      totalGames: 148920,
      totalGamesGrowth: '+12.4% vs 132,440 previous cycle',
      totalGameValue: 72400000,
      totalGameValueToday: 1840000,
      totalPayouts: 21800000,
      payoutSettledRate: '98.4% settled',
      totalRounds: 3200000,
      totalRoundsGrowth: '+8.2% this month',
      avgDuration: '18m 42s',
      avgDurationGrowth: '-2.4% vs last month',
      grossTurnover: 6240000, // ₹62.40 Lakhs
      platformRake: 218000, // ₹2.18 Lakhs
      flaggedRounds: 3,
      flaggedDetails: '1 Collusion check • 2 Disconnect claims',
    };
  },

  /**
   * Performance time series over time
   */
  async getGamePerformance(range: '7D' | '30D' | '3M' = '7D') {
    await new Promise((resolve) => setTimeout(resolve, 40));
    if (range === '7D') {
      return [
        { day: 'Mon', completed: 18400, cancelled: 120, abandoned: 45 },
        { day: 'Tue', completed: 21200, cancelled: 140, abandoned: 50 },
        { day: 'Wed', completed: 19800, cancelled: 110, abandoned: 60 },
        { day: 'Thu', completed: 24500, cancelled: 180, abandoned: 40 },
        { day: 'Fri', completed: 28900, cancelled: 210, abandoned: 70 },
        { day: 'Sat', completed: 34200, cancelled: 290, abandoned: 95 },
        { day: 'Sun', completed: 32100, cancelled: 240, abandoned: 80 },
      ];
    }
    return [
      { day: 'Week 1', completed: 95000, cancelled: 720, abandoned: 280 },
      { day: 'Week 2', completed: 112000, cancelled: 810, abandoned: 310 },
      { day: 'Week 3', completed: 124000, cancelled: 890, abandoned: 290 },
      { day: 'Week 4', completed: 148920, cancelled: 920, abandoned: 340 },
    ];
  },

  /**
   * Game Value (turnover & payouts) over time
   */
  async getGameValuePerformance() {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return [
      { day: 'Mon', pot: 840000, payout: 812000 },
      { day: 'Tue', pot: 920000, payout: 888000 },
      { day: 'Wed', pot: 890000, payout: 859000 },
      { day: 'Thu', pot: 1040000, payout: 1004000 },
      { day: 'Fri', pot: 1220000, payout: 1178000 },
      { day: 'Sat', pot: 1480000, payout: 1428000 },
      { day: 'Sun', pot: 1390000, payout: 1342000 },
    ];
  },

  /**
   * Action: Resolve or escalate dispute
   */
  async resolveDispute(sessionId: string, action: 'reviewed' | 'refunded' | 'confirmed' | 'escalated', notes?: string) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const all = loadStoredSessions();
    const idx = all.findIndex((s) => s.sessionId === sessionId || s.id === sessionId);
    if (idx !== -1) {
      if (action === 'refunded') {
        all[idx].status = 'cancelled';
        all[idx].integrityStatus = 'clean_showdown';
        all[idx].refundAmount = all[idx].totalPot;
      } else if (action === 'confirmed') {
        all[idx].status = 'completed';
        all[idx].integrityStatus = 'rng_verified';
      }
      all[idx].disputeNotes = notes || `Dispute marked as ${action} by Administrator.`;
      saveStoredSessions(all);
    }
  },

  /**
   * Action: Delete sessions
   */
  async deleteSessions(sessionIds: string[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const all = loadStoredSessions();
    const remaining = all.filter((s) => !sessionIds.includes(s.id) && !sessionIds.includes(s.sessionId));
    saveStoredSessions(remaining);
  },

  /**
   * Export game history to CSV
   */
  exportGameHistoryToCsv(sessions: GameSession[]): void {
    const headers = [
      'Game ID',
      'Session ID',
      'Round ID',
      'Game Name',
      'Game Type',
      'Started At',
      'Ended At',
      'Duration',
      'Players',
      'Peak Players',
      'Total Pot (INR)',
      'Platform Rake (INR)',
      'Payout (INR)',
      'Winner',
      'Status',
      'Integrity',
    ];

    const rows = sessions.map((s) => [
      `"${s.gameId}"`,
      `"${s.sessionId}"`,
      `"${s.roundId}"`,
      `"${s.gameName}"`,
      `"${s.gameType}"`,
      `"${s.startedAt}"`,
      `"${s.endedAt || ''}"`,
      `"${s.duration}"`,
      s.playerCount,
      s.peakPlayers,
      s.totalPot,
      s.platformRake,
      s.totalPayout,
      `"${s.winnerName || 'N/A'}"`,
      `"${s.status}"`,
      `"${s.integrityStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `game_history_archive_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export round data to CSV
   */
  exportRoundDataToCsv(sessionId: string, rounds: GameRound[]): void {
    const headers = ['Session ID', 'Round Number', 'Started At', 'Ended At', 'Duration', 'Players', 'Winner', 'Pot (INR)', 'Rake (INR)', 'Status'];
    const rows = rounds.map((r) => [
      `"${r.sessionId}"`,
      r.roundNumber,
      `"${r.startedAt}"`,
      `"${r.endedAt || ''}"`,
      `"${r.duration || ''}"`,
      r.playerCount,
      `"${r.winnerName || 'N/A'}"`,
      r.pot,
      r.rake,
      `"${r.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `round_archive_${sessionId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
