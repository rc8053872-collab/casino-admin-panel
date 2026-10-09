import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Calendar, Shield, CreditCard } from 'lucide-react';
import type { WithdrawalFilterParams, PaymentRail, RiskTier } from '../../types/withdrawal';

interface WithdrawalFilterBarProps {
  filters: WithdrawalFilterParams;
  onFilterChange: (filters: Partial<WithdrawalFilterParams>) => void;
  onReset: () => void;
}

export const WithdrawalFilterBar: React.FC<WithdrawalFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(filters.dateRange === 'custom');

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange({ search: searchTerm, page: 1 });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const handleDateChange = (val: 'today' | 'yesterday' | '7d' | '30d' | 'custom') => {
    if (val === 'custom') {
      setIsCustomDateOpen(true);
      onFilterChange({ dateRange: 'custom', page: 1 });
    } else {
      setIsCustomDateOpen(false);
      onFilterChange({ dateRange: val, customStartDate: undefined, customEndDate: undefined, page: 1 });
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2.5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Payout ID, Player ID, Account or UPI ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onFilterChange({ search: '', page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Date Range Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.dateRange || 'today'}
              onChange={(e) => handleDateChange(e.target.value as any)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Payment Rail Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.paymentRail || 'all'}
              onChange={(e) => onFilterChange({ paymentRail: e.target.value as PaymentRail | 'all', page: 1 })}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Rails</option>
              <option value="IMPS">IMPS</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.riskTier || 'all'}
              onChange={(e) => onFilterChange({ riskTier: e.target.value as RiskTier | 'all', page: 1 })}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsCustomDateOpen(false);
              onReset();
            }}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Custom Date Range Sub-Bar */}
      {isCustomDateOpen && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600 animate-fadeIn">
          <span className="font-semibold text-slate-500">Custom Date:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={(e) => onFilterChange({ customStartDate: e.target.value, page: 1 })}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={(e) => onFilterChange({ customEndDate: e.target.value, page: 1 })}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalFilterBar;
