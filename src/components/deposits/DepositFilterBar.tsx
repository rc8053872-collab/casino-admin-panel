import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  RotateCcw,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import type { DepositFilters, PaymentRail, DepositStatus } from '../../types/deposit';

interface DepositFilterBarProps {
  filters: DepositFilters;
  onFilterChange: (filters: Partial<DepositFilters>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
  isLiveStreaming?: boolean;
  onToggleLiveStream?: () => void;
  onExportCsv?: () => void;
  onRefresh?: () => void;
}

export const DepositFilterBar: React.FC<DepositFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
  isLiveStreaming = true,
  onToggleLiveStream,
  onExportCsv,
  onRefresh,
}) => {
  const statusTabs: Array<{ id: 'all' | DepositStatus; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'All Deposits', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    {
      id: 'success',
      label: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: 'processing',
      label: 'Processing',
      icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'failed',
      label: 'Failed',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
    },
  ];

  const paymentRails: Array<{ id: PaymentRail; label: string }> = [
    { id: 'all', label: 'All Channels' },
    { id: 'upi', label: 'UPI (PhonePe, GPay, Paytm)' },
    { id: 'netbanking', label: 'NetBanking (HDFC, ICICI)' },
    { id: 'cards', label: 'Cards & Cred' },
    { id: 'razorpay', label: 'RazorpayX' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
      {/* 1. Status Tabs & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Tabs with Animated Indicator */}
        <div className="inline-flex p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl gap-1 overflow-x-auto scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange({ status: tab.id })}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="deposit-status-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-200/60 z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Live Stream Beacon Toggle */}
          {onToggleLiveStream && (
            <button
              type="button"
              onClick={onToggleLiveStream}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isLiveStreaming
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle live telemetry stream simulation"
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isLiveStreaming ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span>{isLiveStreaming ? 'Live Feed On' : 'Feed Paused'}</span>
            </button>
          )}

          {/* Export CSV Button */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Export filtered deposits to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
              title="Refresh deposits data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Rail Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {paymentRails.map((rail) => {
          const isSelected = filters.rail === rail.id;
          return (
            <button
              key={rail.id}
              type="button"
              onClick={() => onFilterChange({ rail: rail.id })}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {rail.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search and Secondary Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search deposit ID (DEP-88192), player ID (#10482), name, or UTR..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="hour">Last 1 Hour (18 txns)</option>
              <option value="today">Today's Inflow (46 txns)</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">This Month</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Filter Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Displaying <strong className="text-slate-800">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> deposit records
          </span>
          {(filters.search || filters.status !== 'all' || filters.rail !== 'all' || filters.dateRange !== 'hour') && (
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span>Filtered</span>
              <button
                type="button"
                onClick={onReset}
                className="hover:underline font-bold text-emerald-800 ml-1 cursor-pointer"
              >
                Clear
              </button>
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gateway Webhooks Active • SLA 99.98%</span>
        </span>
      </div>
    </div>
  );
};

export default DepositFilterBar;
