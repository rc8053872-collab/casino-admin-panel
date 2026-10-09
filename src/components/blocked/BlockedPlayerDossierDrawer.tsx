import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShieldAlert,
  Lock,
  UserCheck,
  AlertTriangle,
  FileText,
  CreditCard,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  MapPin,
  ArrowDownLeft,
} from 'lucide-react';
import type { Player } from '../../types/player';
import { formatINR } from '../../utils/currency';
import { drawerVariants, modalBackdropVariants } from '../../animations/variants';

interface BlockedPlayerDossierDrawerProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onUnblockClick: (player: Player) => void;
}

export const BlockedPlayerDossierDrawer: React.FC<BlockedPlayerDossierDrawerProps> = ({
  player,
  isOpen,
  onClose,
  onUnblockClick,
}) => {
  const navigate = useNavigate();

  // Keyboard shortcut: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!player) return null;

  const handleNavigateToDeposits = () => {
    onClose();
    const query = player.playerId || player.username;
    navigate(`/admin/transactions/deposits?search=${encodeURIComponent(query)}`);
  };

  const renderDeviceIcon = (device?: string) => {
    switch (device) {
      case 'desktop':
        return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
          />

          {/* Slide-Over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Fraud Incident Dossier</h2>
                    <p className="text-[11px] text-slate-400 font-mono">Case ID: {player.id}</p>
                  </div>
                </div>

                {/* ESC & Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs group cursor-pointer"
                  title="Close drawer (or press Esc key)"
                >
                  <kbd className="text-[10px] font-mono bg-slate-100 group-hover:bg-slate-200 text-slate-600 border border-slate-200/80 px-1.5 py-0.5 rounded font-bold transition-colors">
                    ESC
                  </kbd>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-600">
                {/* 1. Player Identity Card */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {player.avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase border border-rose-200">
                          Blocked
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        @{player.username} • {player.playerId}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email:</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {player.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone:</span>
                      <span className="font-medium text-slate-800">{player.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Region & Cluster:</span>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{player.region} ({player.cluster})</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Device & Network:</span>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        {renderDeviceIcon(player.device)}
                        <span className="font-mono text-[10px]">{player.ipAddress || 'IP Hidden'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Security Trigger & Risk Evaluation */}
                <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Security Violation Breakdown</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                      Score: {player.riskScore}/100
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
                      Active Threat Flags
                    </div>
                    {player.riskFlags && player.riskFlags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {player.riskFlags.map((flag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 text-[11px] font-semibold shadow-2xs"
                          >
                            🚨 {flag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-rose-700 italic text-[11px]">
                        Security trigger: {player.lastActiveDetail || 'Administrative sanction'}
                      </div>
                    )}
                  </div>

                  {/* Risk Meter Gauge */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-semibold text-rose-700 uppercase">
                      <span>Threat Index Level</span>
                      <span className="font-bold">{player.riskTier.toUpperCase()} THREAT</span>
                    </div>
                    <div className="w-full h-2 bg-rose-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-amber-500 to-rose-600 rounded-full"
                        style={{ width: `${player.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Frozen Escrow & Exposure */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Frozen Escrow & Exposure</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                      <Lock className="w-3 h-3" />
                      <span>Wallet Frozen</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Frozen Balance
                      </span>
                      <div className="text-base font-bold text-rose-600 font-mono">
                        {formatINR(player.balance)}
                      </div>
                    </div>

                    {/* Lifetime Deposits Button Card */}
                    <button
                      type="button"
                      onClick={handleNavigateToDeposits}
                      className="p-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 rounded-xl space-y-0.5 text-left transition-all group cursor-pointer shadow-2xs"
                      title="Inspect deposits in player deposit ledger"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 uppercase transition-colors">
                          Lifetime Deposits
                        </span>
                        <ArrowDownLeft className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div className="text-base font-bold text-slate-800 group-hover:text-emerald-700 font-mono transition-colors">
                        {formatINR(player.totalDeposits)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium group-hover:underline flex items-center gap-0.5">
                        <span>View Deposits</span>
                        <span>→</span>
                      </div>
                    </button>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Lifetime Withdrawals
                      </span>
                      <div className="text-base font-bold text-slate-800 font-mono">
                        {formatINR(player.totalWithdrawals)}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Games Played
                      </span>
                      <div className="text-base font-bold text-slate-800 font-mono">
                        {player.gamesPlayed} ({player.winRate}% Win)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. KYC Status & Documents */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs pb-1 border-b border-slate-200/60">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>KYC & Document Verification</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Document Provided:</span>
                    <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {player.kycDocumentType || 'Not Provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Verification Outcome:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                        player.kycStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : player.kycStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {player.kycStatus}
                    </span>
                  </div>
                  {player.kycReviewNotes && (
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-500 italic mt-1">
                      Note: {player.kycReviewNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/admin/players/${player.id}`);
                    }}
                    className="px-3 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Open full player profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Full Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNavigateToDeposits}
                    className="px-3 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="View player deposits in transaction ledger"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Deposits</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUnblockClick(player);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Restore Access</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BlockedPlayerDossierDrawer;
