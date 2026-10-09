import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Download,
  RotateCcw,
  Eye,
  UserCheck,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { usePlayers, useUnblockPlayer, useBulkUnblock } from '../hooks/usePlayersQuery';
import { useToast } from '../hooks/useToast';
import { formatINR } from '../utils/currency';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import BlockedPlayerKpiCards from '../components/blocked/BlockedPlayerKpiCards';
import BlockedPlayerFilterBar, { type BlockedFilters } from '../components/blocked/BlockedPlayerFilterBar';
import BlockedPlayerDossierDrawer from '../components/blocked/BlockedPlayerDossierDrawer';
import UnblockConfirmModal from '../components/blocked/UnblockConfirmModal';
import SecurityRulesModal from '../components/blocked/SecurityRulesModal';
import type { Player } from '../types/player';

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.28,
      ease: 'easeOut',
    },
  }),
};

export const BlockedPlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { data: allPlayers = [], isLoading, refetch, isFetching } = usePlayers();
  const unblockMutation = useUnblockPlayer();
  const bulkUnblockMutation = useBulkUnblock();

  // Filter only blocked accounts
  const blockedPlayers = useMemo(
    () => allPlayers.filter((p) => p.status === 'blocked'),
    [allPlayers]
  );

  // Filters State
  const [filters, setFilters] = useState<BlockedFilters>({
    search: '',
    cluster: 'all',
    trigger: 'all',
    riskTier: 'all',
    sortBy: 'risk_desc',
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers State
  const [inspectingPlayer, setInspectingPlayer] = useState<Player | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [unblockingPlayer, setUnblockingPlayer] = useState<Player | null>(null);
  const [isBulkUnblockOpen, setIsBulkUnblockOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Available Filter Options
  const availableClusters = useMemo(() => {
    const set = new Set<string>();
    blockedPlayers.forEach((p) => {
      if (p.cluster) set.add(p.cluster);
    });
    return Array.from(set);
  }, [blockedPlayers]);

  const availableTriggers = useMemo(() => {
    const set = new Set<string>();
    blockedPlayers.forEach((p) => {
      if (p.riskFlags?.[0]) set.add(p.riskFlags[0]);
    });
    return Array.from(set);
  }, [blockedPlayers]);

  // Filter & Sort Logic
  const filteredPlayers = useMemo(() => {
    let result = blockedPlayers.filter((player) => {
      // 1. Search (username, playerId, email, IP, trigger reason, cluster)
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchUser = player.username.toLowerCase().includes(q);
        const matchId = player.playerId.toLowerCase().includes(q);
        const matchEmail = player.email.toLowerCase().includes(q);
        const matchCluster = player.cluster.toLowerCase().includes(q);
        const matchIp = (player.ipAddress || '').toLowerCase().includes(q);
        const matchFlag = (player.riskFlags || []).some((f) => f.toLowerCase().includes(q));
        const matchDetail = (player.lastActiveDetail || '').toLowerCase().includes(q);
        if (!matchUser && !matchId && !matchEmail && !matchCluster && !matchIp && !matchFlag && !matchDetail) {
          return false;
        }
      }

      // 2. Cluster Filter
      if (filters.cluster !== 'all' && player.cluster !== filters.cluster) {
        return false;
      }

      // 3. Trigger Filter
      if (filters.trigger !== 'all') {
        const primaryFlag = player.riskFlags?.[0] || '';
        if (primaryFlag !== filters.trigger) return false;
      }

      // 4. Risk Tier Filter
      if (filters.riskTier !== 'all' && player.riskTier !== filters.riskTier) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'risk_desc':
          return b.riskScore - a.riskScore;
        case 'risk_asc':
          return a.riskScore - b.riskScore;
        case 'balance_desc':
          return b.balance - a.balance;
        case 'name_asc':
          return a.username.localeCompare(b.username);
        default:
          return 0;
      }
    });

    return result;
  }, [blockedPlayers, filters]);

  // Metrics computations
  const totalFrozenAmount = useMemo(
    () => blockedPlayers.reduce((acc, p) => acc + (p.balance || 0), 0),
    [blockedPlayers]
  );
  const criticalThreatsCount = useMemo(
    () => blockedPlayers.filter((p) => p.riskTier === 'critical').length,
    [blockedPlayers]
  );
  const avgRiskScore = useMemo(() => {
    if (blockedPlayers.length === 0) return 0;
    const sum = blockedPlayers.reduce((acc, p) => acc + p.riskScore, 0);
    return sum / blockedPlayers.length;
  }, [blockedPlayers]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredPlayers.length && filteredPlayers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlayers.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Unblock Handlers
  const handleConfirmSingleUnblock = (resolutionNote: string) => {
    if (!unblockingPlayer) return;
    unblockMutation.mutate(unblockingPlayer.id, {
      onSuccess: () => {
        toast.success(
          'Player Access Restored',
          `@${unblockingPlayer.username} unblocked. ${resolutionNote}`
        );
        setSelectedIds((prev) => prev.filter((id) => id !== unblockingPlayer.id));
        setUnblockingPlayer(null);
      },
      onError: () => {
        toast.error('Action Failed', 'Unable to unblock player account.');
      },
    });
  };

  const handleConfirmBulkUnblock = (resolutionNote: string) => {
    if (selectedIds.length === 0) return;
    bulkUnblockMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(
          'Batch Unblock Complete',
          `Restored access for ${selectedIds.length} players. Note: ${resolutionNote}`
        );
        setSelectedIds([]);
        setIsBulkUnblockOpen(false);
      },
      onError: () => {
        toast.error('Batch Failed', 'Could not complete batch unblock action.');
      },
    });
  };

  // CSV Export
  const handleExportCSV = (playersToExport: Player[]) => {
    if (playersToExport.length === 0) {
      toast.info('No Records', 'No accounts available to export.');
      return;
    }
    const headers = [
      'Player ID',
      'Username',
      'Full Name',
      'Email',
      'Phone',
      'Cluster',
      'Region',
      'Risk Tier',
      'Risk Score',
      'Primary Violation',
      'KYC Document',
      'Frozen Balance (INR)',
      'Lifetime Deposits (INR)',
      'Lifetime Withdrawals (INR)',
      'Device',
      'IP Address',
    ];
    const rows = playersToExport.map((p) => [
      p.playerId,
      p.username,
      `"${p.firstName} ${p.lastName}"`,
      p.email,
      p.phone,
      p.cluster,
      p.region,
      p.riskTier,
      p.riskScore,
      `"${(p.riskFlags?.[0] || p.lastActiveDetail || 'Policy Violation').replace(/"/g, '""')}"`,
      `"${(p.kycDocumentType || 'Unverified').replace(/"/g, '""')}"`,
      p.balance,
      p.totalDeposits,
      p.totalWithdrawals,
      p.device,
      p.ipAddress || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `fraud_blocked_players_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      'Incident Log Exported',
      `Exported ${playersToExport.length} quarantined account records.`
    );
  };

  const renderDeviceIcon = (device?: string) => {
    switch (device) {
      case 'desktop':
        return (
          <span title="Desktop Device">
            <Laptop className="w-3 h-3 text-slate-400" />
          </span>
        );
      case 'mobile':
        return (
          <span title="Mobile Device">
            <Smartphone className="w-3 h-3 text-slate-400" />
          </span>
        );
      case 'tablet':
        return (
          <span title="Tablet Device">
            <Tablet className="w-3 h-3 text-slate-400" />
          </span>
        );
      default:
        return (
          <span title="Desktop Device">
            <Laptop className="w-3 h-3 text-slate-400" />
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-14 text-slate-800 text-xs">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Anti-Fraud Sentinel Active</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-400">Escrow Containment</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Blocked Players & Fraud Isolation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accounts quarantined due to anti-fraud detection, multi-accounting sybil clusters, or financial violations (<AnimatedNumber value={blockedPlayers.length} /> under active isolation).
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Security Protocols Rules Button */}
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Inspect platform isolation rules"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Security Rules</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => handleExportCSV(filteredPlayers)}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export incident dossier to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Incident Log</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              refetch();
              toast.info('Telemetry Synchronized', 'Updated player quarantine registry.');
            }}
            disabled={isFetching}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh registry"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Active Badge Counter */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-bold shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span><AnimatedNumber value={blockedPlayers.length} /> Blocked Accounts</span>
          </span>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <BlockedPlayerKpiCards
        blockedCount={blockedPlayers.length}
        totalFrozenAmount={totalFrozenAmount}
        criticalThreatsCount={criticalThreatsCount}
        avgRiskScore={avgRiskScore}
        clusters={availableClusters}
        isLoading={isLoading}
      />

      {/* 3. Filters Toolbar */}
      <BlockedPlayerFilterBar
        filters={filters}
        availableClusters={availableClusters}
        availableTriggers={availableTriggers}
        onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        onReset={() =>
          setFilters({
            search: '',
            cluster: 'all',
            trigger: 'all',
            riskTier: 'all',
            sortBy: 'risk_desc',
          })
        }
        filteredCount={filteredPlayers.length}
        totalCount={blockedPlayers.length}
      />

      {/* 4. Batch Selection Toolbar (Appears when 1+ checkboxes are checked) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            className="bg-slate-900 text-white rounded-2xl p-3 px-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-mono font-bold text-xs flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="font-semibold text-xs text-slate-200">
                Accounts selected for compliance batch review
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  handleExportCSV(blockedPlayers.filter((p) => selectedIds.includes(p.id)))
                }
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkUnblockOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Batch Restore Access ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium"
              >
                Deselect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Main Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-24 text-xs text-slate-400 space-y-2">
            <div className="w-7 h-7 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>Synchronizing fraud quarantine ledger...</div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">
                {blockedPlayers.length === 0
                  ? 'No Quarantined Players'
                  : 'No Accounts Match Filters'}
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                {blockedPlayers.length === 0
                  ? 'All accounts are compliant. Zero players are currently barred by anti-fraud protocols.'
                  : 'Try clearing your search keyword, cluster selection, or threat tier filter.'}
              </p>
            </div>
            {blockedPlayers.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: '',
                    cluster: 'all',
                    trigger: 'all',
                    riskTier: 'all',
                    sortBy: 'risk_desc',
                  })
                }
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-left border-collapse text-xs"
              aria-label="Blocked players table"
            >
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  {/* Select */}
                  <th className="px-3 py-3 w-8">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="p-0.5 text-slate-400 hover:text-slate-700"
                      title="Select All"
                    >
                      {selectedIds.length === filteredPlayers.length && filteredPlayers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </th>

                  {/* Player */}
                  <th className="px-4 py-3">PLAYER</th>

                  {/* Security Trigger / Reason */}
                  <th className="px-4 py-3">SECURITY TRIGGER / REASON</th>

                  {/* Risk Tier */}
                  <th className="px-4 py-3">RISK TIER</th>

                  {/* Frozen Wallet */}
                  <th className="px-4 py-3">FROZEN WALLET</th>

                  {/* Cluster */}
                  <th className="px-4 py-3">CLUSTER & GEO</th>

                  {/* Actions */}
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPlayers.map((player, idx) => {
                  const isSelected = selectedIds.includes(player.id);
                  const primaryViolation =
                    player.riskFlags?.[0] || player.lastActiveDetail || 'Policy Violation';

                  return (
                    <motion.tr
                      key={player.id}
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      className={`hover:bg-slate-50/70 transition-colors group ${
                        isSelected ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* 1. SELECT */}
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelect(player.id, e)}
                          className="p-0.5 text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* 2. PLAYER */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar with lock warning badge */}
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-slate-700">
                              {player.avatarInitials}
                            </div>
                            <div
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center border-2 border-white"
                              title="Account Quarantined"
                            >
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setInspectingPlayer(player);
                                setIsDossierOpen(true);
                              }}
                              className="font-bold text-slate-900 hover:text-rose-600 transition-colors text-left block text-xs"
                            >
                              {player.username}
                            </button>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{player.playerId}</span>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">{player.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                              {renderDeviceIcon(player.device)}
                              <span className="font-mono">{player.ipAddress || 'IP Hidden'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. SECURITY TRIGGER / REASON */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80 shadow-2xs">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>{primaryViolation}</span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="text-slate-400">Doc:</span>
                            <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {player.kycDocumentType || 'Not Provided'}
                            </span>
                          </div>

                          {player.riskFlags && player.riskFlags.length > 1 && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span className="bg-rose-100/70 text-rose-800 px-1 rounded font-semibold">
                                +{player.riskFlags.length - 1} more flags
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. RISK TIER */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            <span>
                              {player.riskTier} ({player.riskScore}/100)
                            </span>
                          </span>

                          {/* Mini Risk Gauge Meter */}
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-amber-500 to-rose-600 rounded-full"
                              style={{ width: `${player.riskScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 5. FROZEN WALLET */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 font-mono">
                          <div className="font-bold text-rose-600 text-xs flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-500" />
                            <span>{formatINR(player.balance)} (Frozen)</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Deposits: {formatINR(player.totalDeposits)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Withdraws: {formatINR(player.totalWithdrawals)}
                          </div>
                        </div>
                      </td>

                      {/* 6. CLUSTER & GEO */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {player.cluster}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{player.region}</div>
                        </div>
                      </td>

                      {/* 7. ACTIONS */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Dossier / Details Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingPlayer(player);
                              setIsDossierOpen(true);
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            title="Inspect fraud dossier"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>

                          {/* Unblock Button */}
                          <button
                            type="button"
                            onClick={() => setUnblockingPlayer(player)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 hover:text-emerald-800 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            title="Restore player access"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Unblock Player</span>
                          </button>

                          {/* Full Profile Link */}
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/players/${player.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Open full admin profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Single Player Unblock Confirmation Modal */}
      <UnblockConfirmModal
        isOpen={Boolean(unblockingPlayer)}
        player={unblockingPlayer}
        isLoading={unblockMutation.isPending}
        onConfirm={handleConfirmSingleUnblock}
        onClose={() => setUnblockingPlayer(null)}
      />

      {/* 7. Bulk Unblock Confirmation Modal */}
      <UnblockConfirmModal
        isOpen={isBulkUnblockOpen}
        player={null}
        isBulk={true}
        selectedPlayers={blockedPlayers.filter((p) => selectedIds.includes(p.id))}
        isLoading={bulkUnblockMutation.isPending}
        onConfirm={handleConfirmBulkUnblock}
        onClose={() => setIsBulkUnblockOpen(false)}
      />

      {/* 8. Fraud Incident Dossier Drawer */}
      <BlockedPlayerDossierDrawer
        isOpen={isDossierOpen}
        player={inspectingPlayer}
        onClose={() => {
          setIsDossierOpen(false);
          setInspectingPlayer(null);
        }}
        onUnblockClick={(p) => {
          setIsDossierOpen(false);
          setUnblockingPlayer(p);
        }}
      />

      {/* 9. Platform Security Rules Protocol Modal */}
      <SecurityRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};

export default BlockedPlayersPage;
