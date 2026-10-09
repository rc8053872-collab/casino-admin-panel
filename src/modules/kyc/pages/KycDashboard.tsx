import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  RotateCcw,
  Filter,
} from 'lucide-react';
import type { KycPlayer, KycModalType, KycFilterParams } from '../types/kyc.types';
import { useKycPlayers, useKycStats, useKycActions } from '../hooks/useKyc';
import { KycStats } from '../components/KycStats';
import { KycTable } from '../components/KycTable';
import { KycReviewDrawer } from '../components/KycReviewDrawer';
import { KycActionModal } from '../components/KycActionModal';
import { pageVariants } from '../../../animations/variants';

export const KycDashboard: React.FC = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const filterParams: KycFilterParams = {
    search: searchTerm,
    status: statusFilter,
    risk: riskFilter,
    dateRange: dateFilter,
    verificationType: verificationFilter,
  };

  const { players, isLoading: isPlayersLoading } = useKycPlayers(filterParams);
  const { stats, isLoading: isStatsLoading } = useKycStats();
  const { approve, reject, requestInfo, isSubmitting } = useKycActions();

  // Selected Player for Drawer & Modals
  const [selectedPlayer, setSelectedPlayer] = useState<KycPlayer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<KycModalType>(null);

  const handleOpenReview = (player: KycPlayer) => {
    setSelectedPlayer(player);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenActionModal = (type: KycModalType) => {
    setActiveModalType(type);
  };

  const handleCloseActionModal = () => {
    setActiveModalType(null);
  };

  const handleConfirmApprove = async (playerId: string, notes?: string) => {
    const updated = await approve(playerId, notes);
    setSelectedPlayer(updated);
  };

  const handleConfirmReject = async (playerId: string, reason: string, notes?: string) => {
    const updated = await reject(playerId, reason, notes);
    setSelectedPlayer(updated);
  };

  const handleConfirmRequestInfo = async (
    playerId: string,
    requirements: string[],
    message: string
  ) => {
    const updated = await requestInfo(playerId, requirements, message);
    setSelectedPlayer(updated);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRiskFilter('all');
    setDateFilter('all');
    setVerificationFilter('all');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    riskFilter !== 'all' ||
    dateFilter !== 'all' ||
    verificationFilter !== 'all';

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12 font-sans"
    >
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              KYC &amp; COMPLIANCE
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>KYC Verification Node Operational</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance monitoring, regulatory identity screening, and operator document verification queue.
          </p>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <span className="text-slate-400">Queue Active:</span>
            <span className="font-bold text-amber-700">
              {stats?.pending ?? 184} Pending
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Section (Animated with GSAP) */}
      <KycStats stats={stats} isLoading={isStatsLoading} />

      {/* 3. Filters & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Queue Filtering &amp; Screening</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          {/* Search Player */}
          <div className="lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player name, ID (e.g. PLR-10892) or PAN..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by KYC status"
              className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="needs_information">Needs Information</option>
            </select>
          </div>

          {/* Risk Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter by risk level"
              className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">Risk: All</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="lg:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter by date submitted"
              className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">Date: All</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Verification Type Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              aria-label="Filter by verification type"
              className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="all">Type: All</option>
              <option value="Identity">Identity</option>
              <option value="PAN">PAN</option>
              <option value="Bank">Bank</option>
              <option value="Full KYC">Full KYC</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Verification Queue Table */}
      <KycTable
        players={players}
        isLoading={isPlayersLoading}
        onSelectPlayer={handleOpenReview}
      />

      {/* 5. KYC Review Drawer (Right-side Framer Motion drawer) */}
      <KycReviewDrawer
        isOpen={isDrawerOpen}
        player={selectedPlayer}
        onClose={handleCloseDrawer}
        onOpenActionModal={handleOpenActionModal}
      />

      {/* 6. Action Modals (Approve / Reject / Request More Info) */}
      <KycActionModal
        modalType={activeModalType}
        player={selectedPlayer}
        onClose={handleCloseActionModal}
        onConfirmApprove={handleConfirmApprove}
        onConfirmReject={handleConfirmReject}
        onConfirmRequestInfo={handleConfirmRequestInfo}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
};

export default KycDashboard;
