import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminProfileDropdown from './auth/AdminProfileDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
  isBackendConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isBackendConnected = true,
}) => {
  const location = useLocation();

  const getPageMeta = (pathname: string) => {
    if (pathname.includes('/deposits')) {
      return {
        title: 'Player Deposits',
        subtitle: 'Real-time feed of wallet top-ups via UPI, NetBanking, and cards.',
      };
    }
    if (pathname.includes('/withdrawals')) {
      return {
        title: 'Player Withdrawals',
        subtitle: 'Audit-ready queue of cashout requests, compliance verification, and payouts.',
      };
    }
    if (pathname.includes('/games/live')) {
      return {
        title: 'Live Games Operations',
        subtitle: 'Multiplayer room telemetry, active seating occupancy, and live controls.',
      };
    }
    if (pathname.includes('/games/history')) {
      return {
        title: 'Game Match History',
        subtitle: 'Audit ledger of completed multiplayer rounds, rake, and payouts.',
      };
    }
    if (pathname.includes('/games')) {
      return {
        title: 'Game Catalog & Tables',
        subtitle: 'Create, edit, and configure active platform games and arena tables.',
      };
    }
    if (pathname.includes('/players/blocked')) {
      return {
        title: 'Blocked Players & Risk',
        subtitle: 'Enforce fraud prevention, investigate flagged anomalies, and apply restrictions.',
      };
    }
    if (pathname.includes('/players/active')) {
      return {
        title: 'Active Players',
        subtitle: 'Real-time active participants currently seated or navigating.',
      };
    }
    if (pathname.includes('/players')) {
      return {
        title: 'All Players',
        subtitle: 'Comprehensive player registry, wallet balances, and account statuses.',
      };
    }
    if (pathname.includes('/transactions')) {
      return {
        title: 'Transaction History',
        subtitle: 'Audit-grade chronological log of deposit collections, payouts, and rake transfers.',
      };
    }
    if (pathname.includes('/reports/financial')) {
      return {
        title: 'Financial Reports',
        subtitle: 'Gross gaming revenue, rake yields, deposit settlement volume, and margins.',
      };
    }
    if (pathname.includes('/reports/player')) {
      return {
        title: 'Player Analytics',
        subtitle: 'Retention, lifetime volume, player segmentation, and turnover ratios.',
      };
    }
    if (pathname.includes('/reports/game')) {
      return {
        title: 'Game Performance Reports',
        subtitle: 'Rounds played, house margins, and popularity benchmarks.',
      };
    }
    if (pathname.includes('/settings')) {
      return {
        title: 'System Settings',
        subtitle: 'Payment rail configurations, security limits, and platform preferences.',
      };
    }
    return {
      title: 'Dashboard',
      subtitle: 'Monitor your platform activity and performance in real time.',
    };
  };

  const { title, subtitle } = getPageMeta(location.pathname);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="sidebarToggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="text-base md:text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions: Search, Notifications, System Online, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id="header-search"
            type="text"
            placeholder="Search players, games…"
            className="w-48 lg:w-56 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* Notifications Button */}
        <button
          id="notif-btn"
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2a6 6 0 00-6 6c0 3-1.5 4.5-2 5h16c-.5-.5-2-2-2-5a6 6 0 00-6-6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M8.5 17a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            4
          </span>
        </button>

        {/* System Status Pill */}
        <div
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"
          title={isBackendConnected ? 'Backend API connected' : 'Local cached data mode'}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isBackendConnected ? 'System Online' : 'Local Mode'}</span>
        </div>

        {/* Admin Profile Dropdown */}
        <AdminProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
