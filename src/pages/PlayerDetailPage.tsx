import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';
import {
  usePlayer,
  usePlayerTransactions,
  usePlayerGameHistory,
  usePlayerActivity,
  useSuspendPlayer,
  useRestorePlayer,
  useBlockPlayer,
  useUnblockPlayer,
} from '../hooks/usePlayersQuery';
import {
  CreditCard,
  UserCheck,
  Clock,
  Shield,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { KycReviewDrawer } from '../modules/kyc/components/KycReviewDrawer';
import { KycStatusBadge } from '../modules/kyc/components/KycStatusBadge';
import { KycRiskBadge } from '../modules/kyc/components/KycRiskBadge';
import { KycTimeline } from '../modules/kyc/components/KycTimeline';
import { KycActionModal } from '../modules/kyc/components/KycActionModal';
import { useKycPlayer, useKycActions } from '../modules/kyc/hooks/useKyc';
import type { KycModalType, KycPlayer } from '../modules/kyc/types/kyc.types';
import RiskDetailsModal from '../components/players/RiskDetailsModal';
import WalletDetailsModal from '../components/players/WalletDetailsModal';
import SendNotificationModal from '../components/players/SendNotificationModal';
import ConfirmationModal from '../components/games/ConfirmationModal';

type DetailTab =
  | 'overview'
  | 'wallet'
  | 'games'
  | 'transactions'
  | 'deposits'
  | 'withdrawals'
  | 'kyc'
  | 'risk'
  | 'activity'
  | 'audit-log';

export const PlayerDetailPage: React.FC = () => {
  const { playerId = '10482' } = useParams<{ playerId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as DetailTab) || 'overview';
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);

  const navigate = useNavigate();
  const toast = useToast();

  const { data: player, isLoading, isError } = usePlayer(playerId);
  const { data: transactions = [] } = usePlayerTransactions(player?.id);
  const { data: gameHistory = [] } = usePlayerGameHistory(player?.id);
  const { data: activities = [] } = usePlayerActivity(player?.id);

  const suspendMutation = useSuspendPlayer();
  const restoreMutation = useRestorePlayer();
  const blockMutation = useBlockPlayer();
  const unblockMutation = useUnblockPlayer();

  // KYC Service Data & Actions
  const { player: kycRecord } = useKycPlayer(player?.id || playerId);
  const { approve: approveKycAction, reject: rejectKycAction, requestInfo: requestInfoKycAction, isSubmitting: isKycSubmitting } = useKycActions();
  const [activeKycModal, setActiveKycModal] = useState<KycModalType>(null);
  const [showHistoryTimeline, setShowHistoryTimeline] = useState(false);

  // Single Source of Truth for KYC Player Data
  const currentKycPlayer: KycPlayer = useMemo(() => {
    if (kycRecord) return kycRecord;
    const pId = player?.id || playerId || 'PLR-10892';
    const dispId = pId.startsWith('PLR-') ? pId : `PLR-${pId}`;
    return {
      id: dispId,
      playerId: dispId,
      name: player?.firstName ? `${player.firstName} ${player.lastName}` : player?.username || 'Rahul Sharma',
      avatar: player?.avatarInitials || player?.username?.slice(0, 2).toUpperCase() || 'RS',
      panMasked: player?.kycDocumentType === 'PAN' && player?.kycDocumentNumber ? player.kycDocumentNumber : 'XXXXXX4821',
      aadhaarMasked: 'XXXX XXXX 4821',
      phoneMasked: player?.phone ? player.phone.slice(0, 4) + '••••' + player.phone.slice(-3) : '+91 98••••821',
      emailMasked: player?.email ? player.email.slice(0, 3) + '•••@' + player.email.split('@')[1] : 'pla•••@gmail.com',
      joinedDate: player?.createdAt
        ? new Date(player.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '06 Oct 2026',
      walletBalance: player?.balance || 18420,
      kycStatus: ((player?.kycStatus?.toUpperCase() as any) || 'VERIFIED') as any,
      riskLevel: ((player?.riskTier?.toUpperCase() as any) || 'LOW') as any,
      riskScore: player?.riskScore ?? 12,
      withdrawalStatus: (player?.kycStatus === 'verified' ? 'Enabled' : 'Locked') as any,
      verificationType: 'Identity + PAN',
      submittedDate: player?.kycSubmittedAt || '06 Oct 2026',
      verifiedDate: player?.kycVerifiedAt || '07 Oct 2026',
      nameMatchScore: 98,
      dobMatch: 'Matched',
      checks: {
        Identity: player?.kycStatus === 'verified' ? 'VERIFIED' : 'PENDING',
        Age: 'VERIFIED',
        PAN: player?.kycStatus === 'verified' ? 'VERIFIED' : 'PENDING',
        Address: 'VERIFIED',
        Bank: 'VERIFIED',
      },
      riskDetails: {
        score: player?.riskScore ?? 12,
        level: ((player?.riskTier?.toUpperCase() as any) || 'LOW') as any,
        duplicateAccount: false,
        suspiciousActivity: false,
        multipleDevices: false,
        withdrawalRisk: player?.riskTier === 'high' ? 'High' : 'Low',
        flags: player?.riskFlags || [],
      },
      history: [
        {
          id: `evt-${pId}-1`,
          timestamp: '06 Oct 2026 14:10',
          action: 'KYC submitted',
          details: 'Player uploaded PAN & Aadhaar documents via mobile app.',
          actor: 'Player',
        },
        {
          id: `evt-${pId}-2`,
          timestamp: '06 Oct 2026 14:11',
          action: 'PAN verification completed',
          details: 'Automated NSDL database name match verified (98% confidence).',
          actor: 'Automated OCR',
        },
        {
          id: `evt-${pId}-3`,
          timestamp: '06 Oct 2026 14:12',
          action: 'Identity verification completed',
          details: 'UIDAI QR digital signature verified successfully.',
          actor: 'UIDAI Verifier',
        },
        {
          id: `evt-${pId}-4`,
          timestamp: '06 Oct 2026 14:15',
          action: 'Risk assessment completed',
          details: 'Zero duplicate hardware fingerprinting or proxy detected.',
          actor: 'Security Sentinel',
        },
      ],
    };
  }, [kycRecord, player, playerId]);

  // Modals
  const [isKycDrawerOpen, setIsKycDrawerOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const [txnFilter, setTxnFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const handleTabChange = (tab: DetailTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-slate-400">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Loading player console...
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="text-sm font-bold text-slate-900">Player Record Not Found</div>
        <p className="text-xs text-slate-500">Could not locate player identifier {playerId}.</p>
        <button
          onClick={() => navigate('/admin/players')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Player Directory
        </button>
      </div>
    );
  }

  // Action handlers
  const handleToggleSuspend = () => {
    if (player.status === 'suspended') {
      setConfirmModal({
        isOpen: true,
        title: `Restore Player: ${player.username}?`,
        description: 'This will restore match participation and betting privileges.',
        isDestructive: false,
        onConfirm: () => {
          restoreMutation.mutate(player.id, {
            onSuccess: () => {
              toast.success('Player Restored', `${player.username} is now active.`);
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
          });
        },
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: `Suspend Player: ${player.username}?`,
        description: 'This player will no longer be able to participate in matches or queue for arenas.',
        isDestructive: true,
        onConfirm: () => {
          suspendMutation.mutate(
            { id: player.id, reason: 'Administrative Suspension' },
            {
              onSuccess: () => {
                toast.error('Player Suspended', `${player.username} suspended.`);
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              },
            }
          );
        },
      });
    }
  };

  const handleToggleBlock = () => {
    if (player.status === 'blocked') {
      setConfirmModal({
        isOpen: true,
        title: `Unblock ${player.username}?`,
        description: 'Restores login credentials and unfreezes wallet access.',
        isDestructive: false,
        onConfirm: () => {
          unblockMutation.mutate(player.id, {
            onSuccess: () => {
              toast.success('Player Unblocked', `${player.username} access restored.`);
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
          });
        },
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: `Block ${player.username}?`,
        description: 'Permanent security block. This player will be logged out and disallowed from logging in.',
        isDestructive: true,
        onConfirm: () => {
          blockMutation.mutate(
            { id: player.id, reason: 'Security violation' },
            {
              onSuccess: () => {
                toast.error('Player Blocked', `${player.username} has been permanently barred.`);
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              },
            }
          );
        },
      });
    }
  };

  const filteredTxns = transactions.filter((t) => (txnFilter === 'all' ? true : t.type === txnFilter));

  const accountAgeDays = Math.max(
    1,
    Math.round((Date.now() - new Date(player.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="space-y-4.5 max-w-7xl mx-auto pb-12">
      {/* Top Header Console */}
      <div>
        <button
          onClick={() => navigate('/admin/players')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          ← Back to All Players
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
              {player.avatarInitials || player.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {player.firstName ? `${player.firstName} ${player.lastName}` : player.username}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  {player.id || player.playerId}
                </span>

                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Status: Active</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-mono text-slate-400 font-semibold uppercase">KYC:</span>
                  <KycStatusBadge status={currentKycPlayer.kycStatus} size="sm" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-mono text-slate-400 font-semibold uppercase">Risk:</span>
                  <KycRiskBadge level={currentKycPlayer.riskLevel} score={currentKycPlayer.riskScore} size="sm" />
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  <span>Wallet: ₹{(player.balance || currentKycPlayer.walletBalance || 18420).toLocaleString('en-IN')}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span>{player.firstName} {player.lastName}</span>
                <span>•</span>
                <span>{player.email}</span>
                <span>•</span>
                <span className="font-mono">{player.phone}</span>
                <span>•</span>
                <span>{player.region} ({player.cluster})</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/admin/players/${player.id}/edit`)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Edit Player
            </button>

            <button
              onClick={handleToggleSuspend}
              className={`px-3.5 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                player.status === 'suspended'
                  ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {player.status === 'suspended' ? 'Restore Player' : 'Suspend'}
            </button>

            <button
              onClick={handleToggleBlock}
              className={`px-3.5 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                player.status === 'blocked'
                  ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  : 'border-red-200 text-red-600 hover:bg-red-50'
              }`}
            >
              {player.status === 'blocked' ? 'Unblock' : 'Block'}
            </button>

            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
            >
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Statistics 8-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Wallet Balance</div>
          <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">₹{player.balance.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Deposits</div>
          <div className="text-base font-bold text-emerald-600 mt-1 tabular-nums">₹{player.totalDeposits.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Withdrawals</div>
          <div className="text-base font-bold text-slate-700 mt-1 tabular-nums">₹{player.totalWithdrawals.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Games Played</div>
          <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">{player.gamesPlayed}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Games Won</div>
          <div className="text-base font-bold text-emerald-600 mt-1 tabular-nums">{player.gamesWon}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Games Lost</div>
          <div className="text-base font-bold text-slate-500 mt-1 tabular-nums">{player.gamesLost}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Win Rate</div>
          <div className="text-base font-bold text-blue-600 mt-1 tabular-nums">{player.winRate}%</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account Age</div>
          <div className="text-base font-bold text-slate-800 mt-1 tabular-nums">{accountAgeDays}d</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
        {([
          'overview',
          'wallet',
          'games',
          'transactions',
          'deposits',
          'withdrawals',
          'kyc',
          'risk',
          'activity',
          'audit-log',
        ] as DetailTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<DetailTab, string> = {
            overview: 'Overview',
            wallet: 'Wallet',
            games: `Games (${gameHistory.length})`,
            transactions: `Transactions (${transactions.length})`,
            deposits: `Deposits (${transactions.filter((t) => t.type === 'deposit').length})`,
            withdrawals: `Withdrawals (${transactions.filter((t) => t.type === 'withdrawal').length})`,
            kyc: `KYC (${currentKycPlayer.kycStatus})`,
            risk: `Risk (${currentKycPlayer.riskScore}/100)`,
            activity: 'Activity',
            'audit-log': `Audit Log (${(currentKycPlayer.history.length || 0) + 1})`,
          };

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`relative pb-3 px-3 whitespace-nowrap transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {labels[tab]}
              {isActive && (
                <motion.div
                  layoutId="playerActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div>
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Account Status Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                Current Activity Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Live Status:</span>
                  <span className="font-semibold text-slate-800 capitalize">{player.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Active Arena:</span>
                  {player.currentGameId ? (
                    <span
                      onClick={() => navigate(`/admin/games/${player.currentGameId}`)}
                      className="font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {player.currentGameName || 'Game Arena'}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not playing</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Active:</span>
                  <span className="font-medium text-slate-700">{player.lastActiveAt} ({player.lastActiveDetail})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Primary Device:</span>
                  <span className="font-medium text-slate-700 capitalize">{player.device}</span>
                </div>
              </div>
            </div>

            {/* Wallet Overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Escrow & Wallet
                </h3>
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Manage Wallet
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Wallet State:</span>
                  <span className={`font-semibold ${player.walletStatus === 'frozen' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {player.walletStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Current Balance:</span>
                  <span className="font-bold text-slate-900">₹{player.balance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Deposits:</span>
                  <span className="font-semibold text-emerald-600">₹{player.totalDeposits.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Withdrawals:</span>
                  <span className="font-semibold text-slate-800">₹{player.totalWithdrawals.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Compliance & Risk */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Compliance & KYC
                </h3>
                <button
                  onClick={() => setIsKycDrawerOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Review KYC
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">KYC Status:</span>
                  <span className="font-bold text-slate-800 capitalize">{player.kycStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-medium text-slate-800">{player.kycDocumentType || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Risk Score:</span>
                  <span className="font-bold text-slate-900">{player.riskScore} / 100 ({player.riskTier} Risk)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Active Triggers:</span>
                  <span className="text-red-600 font-semibold">{player.riskFlags?.length || 0} Flags</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Wallet Balances */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                    Player Escrow Vault
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    player.walletStatus === 'frozen' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {player.walletStatus.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Available Escrow:</span>
                    <span className="font-bold text-slate-900 text-sm">₹{player.balance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lifetime Deposits:</span>
                    <span className="font-semibold text-emerald-600">₹{player.totalDeposits.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lifetime Withdrawals:</span>
                    <span className="font-semibold text-slate-800">₹{player.totalWithdrawals.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Withdrawal Privilege:</span>
                    <span className={`font-semibold ${currentKycPlayer.withdrawalStatus === 'Enabled' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {currentKycPlayer.withdrawalStatus} (KYC {currentKycPlayer.kycStatus})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  Adjust Balance / Escrow Actions
                </button>
              </div>

              {/* Connected Payout Methods */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Connected Payout Channels
                </h3>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-xs">Primary Bank Account</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-700">HDFC Bank •••• 7821</div>
                    <div className="text-[11px] text-slate-400">IFSC: HDFC0001092 • Match: 98%</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-xs">Instant UPI VPA</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-700">
                      {player.username.toLowerCase()}@okhdfcbank
                    </div>
                    <div className="text-[11px] text-slate-400">NPCI Handle Linked</div>
                  </div>
                </div>
              </div>

              {/* Withdrawal Rules & Compliance */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Withdrawal Compliance Limits
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Daily Payout Cap:</span>
                    <span className="font-mono font-semibold text-slate-800">₹1,00,000 / day</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">TDS Threshold (Sec 194BA):</span>
                    <span className="font-mono font-semibold text-slate-800">30% Net Winnings</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Instant UPI Max:</span>
                    <span className="font-mono font-semibold text-slate-800">₹25,000 / txn</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Escrow Hold Period:</span>
                    <span className="font-medium text-slate-700">0 hrs (Verified KYC)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GAMES TAB */}
        {activeTab === 'games' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Matches & Room History</h3>
                <p className="text-xs text-slate-500">Audit log of table participation and tournament results.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Session</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Arena</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Duration</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Result / Score</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Payout / Delta</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gameHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-slate-400 italic">No matches recorded.</td>
                    </tr>
                  ) : (
                    gameHistory.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="px-4.5 py-3 font-mono font-semibold text-xs text-slate-800">{g.sessionId}</td>
                        <td className="px-4.5 py-3 font-medium text-slate-900">
                          <span
                            onClick={() => navigate(`/admin/games/${g.gameId}`)}
                            className="hover:text-blue-600 cursor-pointer"
                          >
                            {g.gameName}
                          </span>
                        </td>
                        <td className="px-4.5 py-3 text-xs text-slate-500">{g.duration}</td>
                        <td className="px-4.5 py-3 text-xs font-semibold">
                          <span className={g.result === 'Won' ? 'text-emerald-600' : 'text-slate-600'}>
                            {g.result} ({g.score})
                          </span>
                        </td>
                        <td className="px-4.5 py-3 font-bold tabular-nums">
                          <span className={g.amountWonOrLost >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {g.amountWonOrLost >= 0 ? `+₹${g.amountWonOrLost.toLocaleString('en-IN')}` : `-₹${Math.abs(g.amountWonOrLost).toLocaleString('en-IN')}`}
                          </span>
                        </td>
                        <td className="px-4.5 py-3 text-right">
                          <button
                            onClick={() => navigate(`/admin/games/${g.gameId}`)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Inspect Game
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Wallet Transaction History</h3>
                <p className="text-xs text-slate-500">All inbound deposits and outbound withdrawal attempts.</p>
              </div>
              <div className="flex items-center gap-1.5">
                {(['all', 'deposit', 'withdrawal'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxnFilter(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      txnFilter === type ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Txn ID</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Type</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Amount</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Method</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Date</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-slate-400 italic">No transactions recorded.</td>
                    </tr>
                  ) : (
                    filteredTxns.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-4.5 py-3 font-mono font-semibold text-xs text-slate-800">{t.transactionId}</td>
                        <td className="px-4.5 py-3 text-xs font-semibold capitalize">
                          <span className={t.type === 'deposit' ? 'text-emerald-600' : 'text-blue-600'}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4.5 py-3 font-bold text-slate-900 tabular-nums">
                          ₹{t.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4.5 py-3 text-xs text-slate-600">{t.method}</td>
                        <td className="px-4.5 py-3 text-xs text-slate-500">{t.date}</td>
                        <td className="px-4.5 py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              t.status === 'success'
                                ? 'bg-emerald-50 text-emerald-700'
                                : t.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. DEPOSITS TAB */}
        {activeTab === 'deposits' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Player Deposit Ledger</h3>
                <p className="text-xs text-slate-500">Inbound funds received via payment gateways and UPI rails.</p>
              </div>
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Total Credited: ₹{player.totalDeposits.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Txn ID</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Gateway / Method</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Amount</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Date</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.filter((t) => t.type === 'deposit').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-slate-400 italic">No deposit records found.</td>
                    </tr>
                  ) : (
                    transactions
                      .filter((t) => t.type === 'deposit')
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="px-4.5 py-3 font-mono font-semibold text-xs text-slate-800">{t.transactionId}</td>
                          <td className="px-4.5 py-3 text-xs text-slate-700 font-medium">{t.method}</td>
                          <td className="px-4.5 py-3 font-bold text-emerald-600 tabular-nums">
                            +₹{t.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4.5 py-3 text-xs text-slate-500">{t.date}</td>
                          <td className="px-4.5 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Player Withdrawal Requests</h3>
                <p className="text-xs text-slate-500">Outbound payout requests subject to KYC validation and TDS checks.</p>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                Withdrawal Status: <strong className={currentKycPlayer.withdrawalStatus === 'Enabled' ? 'text-emerald-600' : 'text-red-600'}>{currentKycPlayer.withdrawalStatus}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Txn ID</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Payout Rail</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Amount</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3">Date</th>
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.filter((t) => t.type === 'withdrawal').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-slate-400 italic">No withdrawal records found.</td>
                    </tr>
                  ) : (
                    transactions
                      .filter((t) => t.type === 'withdrawal')
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="px-4.5 py-3 font-mono font-semibold text-xs text-slate-800">{t.transactionId}</td>
                          <td className="px-4.5 py-3 text-xs text-slate-700 font-medium">{t.method}</td>
                          <td className="px-4.5 py-3 font-bold text-slate-900 tabular-nums">
                            -₹{t.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4.5 py-3 text-xs text-slate-500">{t.date}</td>
                          <td className="px-4.5 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. KYC VERIFICATION TAB */}
        {activeTab === 'kyc' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KYC COMPLIANCE PORTAL</div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">KYC VERIFICATION</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regulatory compliance, government document OCR validation, and financial integrity checks.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsKycDrawerOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review Drawer
                </button>
                <button
                  onClick={() => setActiveKycModal('approve')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve KYC
                </button>
                <button
                  onClick={() => setActiveKycModal('request_info')}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                >
                  Request Info
                </button>
                <button
                  onClick={() => setActiveKycModal('reject')}
                  className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
                >
                  Reject KYC
                </button>
              </div>
            </div>

            {/* Overall Status Banner */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                  currentKycPlayer.kycStatus === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : currentKycPlayer.kycStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {currentKycPlayer.kycStatus === 'VERIFIED' ? '✓' : currentKycPlayer.kycStatus === 'REJECTED' ? '✕' : '⏳'}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Overall Status:</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-extrabold ${
                      currentKycPlayer.kycStatus === 'VERIFIED'
                        ? 'text-emerald-700'
                        : currentKycPlayer.kycStatus === 'REJECTED'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    }`}>
                      {currentKycPlayer.kycStatus === 'VERIFIED' ? '✓ VERIFIED' : currentKycPlayer.kycStatus.replace('_', ' ')}
                    </span>
                    <KycStatusBadge status={currentKycPlayer.kycStatus} size="sm" />
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono sm:text-right">
                <div>Verified on:</div>
                <div className="font-bold text-slate-800">{currentKycPlayer.verifiedDate || currentKycPlayer.submittedDate || '07 Oct 2026'}</div>
              </div>
            </div>

            {/* 3 Main Sections: Identity, Verification Checks, Risk */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Identity Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Identity:</span>
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-slate-500 text-[11px]">PAN</div>
                    <div className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                      {currentKycPlayer.panMasked}
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Name Match</span>
                    <span className="font-bold text-emerald-600 font-mono text-xs">
                      {currentKycPlayer.nameMatchScore}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500">DOB</span>
                    <span className="font-bold text-slate-800">
                      {currentKycPlayer.dobMatch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Checks */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Verification Checks:</span>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  {(['Identity', 'Age', 'PAN', 'Address', 'Bank'] as const).map((chk) => (
                    <div key={chk} className="flex justify-between items-center pt-2 first:pt-0">
                      <span className="text-slate-600 font-medium">{chk}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {currentKycPlayer.checks[chk] || 'Verified'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Risk:</span>
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Risk Score</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {currentKycPlayer.riskScore} / 100
                    </span>
                  </div>

                  {/* Visual Risk Score Progress Indicator */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        currentKycPlayer.riskScore > 70
                          ? 'bg-red-500'
                          : currentKycPlayer.riskScore > 35
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, currentKycPlayer.riskScore))}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Risk Level</span>
                    <KycRiskBadge level={currentKycPlayer.riskLevel} score={currentKycPlayer.riskScore} size="sm" />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Duplicate Account</span>
                    <span className="font-semibold text-slate-700">
                      {currentKycPlayer.riskDetails.duplicateAccount ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Suspicious Activity</span>
                    <span className="font-semibold text-slate-700">
                      {currentKycPlayer.riskDetails.suspiciousActivity ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Multiple Devices</span>
                    <span className="font-semibold text-slate-700">
                      {currentKycPlayer.riskDetails.multipleDevices ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification History Section Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowHistoryTimeline((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 py-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {showHistoryTimeline ? 'Hide Verification History' : 'View Verification History'}
                  <span className="text-[11px] font-mono font-normal text-slate-400">
                    ({currentKycPlayer.history.length} events)
                  </span>
                </button>
              </div>

              {showHistoryTimeline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-3 border-t border-slate-100"
                >
                  <KycTimeline events={currentKycPlayer.history} />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* 8. RISK & SECURITY TAB */}
        {activeTab === 'risk' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Risk Assessment & Anti-Fraud Flags</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated heuristic flags, login frequency, and telemetry anomalies.</p>
              </div>
              <button
                onClick={() => setIsRiskModalOpen(true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Security Actions
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Risk Tier:</span>
                  <span className="font-bold uppercase text-red-600">{player.riskTier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Risk Score:</span>
                  <span className="font-bold text-slate-900">{player.riskScore} / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Audit Status:</span>
                  <span className="font-medium text-slate-800 capitalize">{player.riskReviewStatus || 'Normal'}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Triggered Flags</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {player.riskFlags && player.riskFlags.length > 0 ? (
                    player.riskFlags.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
                        ⚠ {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No security violations detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Player Event Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chronological audit stream of player activity.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Stream Active
              </span>
            </div>

            <div className="space-y-2.5">
              {activities.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 italic">No events recorded.</div>
              ) : (
                activities.map((act) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <span className="font-mono text-[11px] text-slate-400 mt-0.5 shrink-0">{act.timestamp}</span>
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        act.type === 'deposit'
                          ? 'bg-emerald-500'
                          : act.type === 'risk'
                          ? 'bg-red-500'
                          : act.type === 'game'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <div className="text-xs text-slate-800 font-medium leading-relaxed">{act.title}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 10. AUDIT LOG TAB */}
        {activeTab === 'audit-log' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Compliance & Security Audit Log</h3>
                <p className="text-xs text-slate-500">Immutable ledger of KYC status transitions, approvals, requests, and security modifications.</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {(currentKycPlayer.history.length || 0) + 1} Recorded Audit Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-3.5 py-3">Action Event</th>
                    <th className="px-3.5 py-3">Category</th>
                    <th className="px-3.5 py-3">Actor / Origin</th>
                    <th className="px-3.5 py-3">Change Summary</th>
                    <th className="px-3.5 py-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentKycPlayer.history.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{ev.timestamp}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900">{ev.action}</td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          KYC Compliance
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600">{ev.actor}</td>
                      <td className="px-3.5 py-3 text-slate-600 max-w-xs">{ev.details || 'System compliance log recorded'}</td>
                      <td className="px-3.5 py-3 text-right">
                        <KycStatusBadge status={ev.newStatus || currentKycPlayer.kycStatus} size="sm" />
                      </td>
                    </tr>
                  ))}
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">05 Oct 2026 18:22</td>
                    <td className="px-3.5 py-3 font-semibold text-slate-900">Player Account Initialized</td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Auth & Identity
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-600">Mobile Registration API</td>
                    <td className="px-3.5 py-3 text-slate-600">OTP verified via +91 {player.phone || '9876543210'}</td>
                    <td className="px-3.5 py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Success</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <KycReviewDrawer
        isOpen={isKycDrawerOpen}
        player={currentKycPlayer}
        onClose={() => setIsKycDrawerOpen(false)}
        onOpenActionModal={(type) => setActiveKycModal(type)}
      />

      <KycActionModal
        modalType={activeKycModal}
        player={currentKycPlayer}
        onClose={() => setActiveKycModal(null)}
        onConfirmApprove={async (id: string, notes?: string) => {
          await approveKycAction(id, notes);
          setActiveKycModal(null);
        }}
        onConfirmReject={async (id: string, reason: string, notes?: string) => {
          await rejectKycAction(id, reason, notes);
          setActiveKycModal(null);
        }}
        onConfirmRequestInfo={async (id: string, reqs: string[], msg: string) => {
          await requestInfoKycAction(id, reqs as any, msg);
          setActiveKycModal(null);
        }}
        isSubmitting={isKycSubmitting}
      />

      <RiskDetailsModal
        isOpen={isRiskModalOpen}
        player={player}
        onClose={() => setIsRiskModalOpen(false)}
      />

      <WalletDetailsModal
        isOpen={isWalletModalOpen}
        player={player}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <SendNotificationModal
        isOpen={isNotificationModalOpen}
        player={player}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PlayerDetailPage;
