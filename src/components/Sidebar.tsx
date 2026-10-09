import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItemData {
  label: string;
  to: string;
  icon: string;
  end?: boolean;
}

interface NavSectionData {
  label: string;
  items: NavItemData[];
}

const NAV_SECTIONS: NavSectionData[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: 'grid', end: true },
    ],
  },
  {
    label: 'Players',
    items: [
      { label: 'All Players',     to: '/admin/players',        icon: 'user', end: true },
      { label: 'Active Players',  to: '/admin/players/active',  icon: 'user-active' },
      { label: 'Blocked Players', to: '/admin/players/blocked', icon: 'user-blocked' },
    ],
  },
  {
    label: 'Games',
    items: [
      { label: 'All Games',    to: '/admin/games',         icon: 'gamepad', end: true },
      { label: 'Live Games',   to: '/admin/games/live',    icon: 'gamepad-live' },
      { label: 'Game History', to: '/admin/games/history', icon: 'chart' },
    ],
  },
  {
    label: 'Payments',
    items: [
      { label: 'Payment Gateway', to: '/admin/payments/gateway',  icon: 'credit-card' },
      { label: 'UPI / QR',        to: '/admin/payments/upi',      icon: 'qr-code' },
      { label: 'Payment Settings',to: '/admin/payments/settings', icon: 'sliders' },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { label: 'Deposits',            to: '/admin/transactions/deposits',    icon: 'arrow-down-left' },
      { label: 'Withdrawals',         to: '/admin/transactions/withdrawals', icon: 'arrow-up-right' },
      { label: 'Transaction History', to: '/admin/transactions/history',     icon: 'list' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'KYC & Compliance', to: '/admin/compliance/kyc', icon: 'shield-check' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Player Reports',    to: '/admin/reports/players',   icon: 'doc' },
      { label: 'Game Reports',      to: '/admin/reports/games',     icon: 'doc-chart' },
      { label: 'Financial Reports', to: '/admin/reports/financial', icon: 'doc-bars' },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  const iconCls = 'w-4 h-4 shrink-0 transition-colors relative z-10';

  switch (name) {
    case 'grid':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'user':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'user-active':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="7" r="1.2" fill="#22C55E" />
          <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'user-blocked':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 12l2 2 3-3" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 10h2m1 0h2M10 9v1m0 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'gamepad-live':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10.5" r="1.5" fill="#22C55E" />
        </svg>
      );
    case 'chart':
    case 'doc-chart':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 14l3-4 3 2 3-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'arrow-down-left':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <path d="M16 10H4M8 14l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'list':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'doc':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'qr-code':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 12h2v2h-2zM15 15h2v2h-2zM15 12h2v1h-2zM12 15h1v2h-1z" fill="currentColor" />
        </svg>
      );
    case 'sliders':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <path d="M4 15V9M4 5V3M10 17v-4M10 9V3M16 17v-8M16 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="4" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg className={iconCls} viewBox="0 0 20 20" fill="none">
          <path d="M10 2L3 5.5v5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5v-5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 10.5l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const { user } = useAuth();

  const initials = React.useMemo(() => {
    if (!user?.name) return 'SA';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user?.name]);

  const roleLabel = React.useMemo(() => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'SUPER ADMIN';
      case 'ADMIN':
        return 'ADMIN';
      case 'FINANCE':
        return 'FINANCE';
      case 'SUPPORT':
        return 'SUPPORT';
      case 'MANAGER':
        return 'MANAGER';
      default:
        return 'ADMIN';
    }
  }, [user?.role]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Persistent Left Sidebar */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center gap-2.5 px-4.5 py-4 border-b border-slate-100 shrink-0">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path d="M6 11h10M11 6v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">Game Admin</span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              <span className="block px-2.5 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </span>
              {section.items.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    onClick={() => {
                      if (isOpen) onToggle();
                    }}
                    className="relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors group"
                  >
                    {/* Framer Motion Active Indicator using layoutId */}
                    {isActive && (
                      <motion.div
                        layoutId={reducedMotion ? undefined : 'sidebar-active-indicator'}
                        className="absolute inset-0 bg-blue-50 rounded-md z-0"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}

                    <NavIcon name={item.icon} />
                    <span
                      className={`relative z-10 truncate ${
                        isActive
                          ? 'text-blue-600 font-semibold'
                          : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-2 space-y-1 shrink-0">
          <NavLink
            to="/admin/settings"
            onClick={() => {
              if (isOpen) onToggle();
            }}
            className="relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors group"
          >
            {location.pathname === '/admin/settings' && (
              <motion.div
                layoutId={reducedMotion ? undefined : 'sidebar-active-indicator'}
                className="absolute inset-0 bg-blue-50 rounded-md z-0"
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 34,
                }}
              />
            )}
            <svg className="w-4 h-4 shrink-0 relative z-10 text-slate-600" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              className={`relative z-10 truncate ${
                location.pathname === '/admin/settings'
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              Settings
            </span>
          </NavLink>

          {/* Admin Profile */}
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-slate-50/50 mt-1">
            <div className="w-7.5 h-7.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-[13px] font-semibold text-slate-900 leading-tight truncate">
                {user?.name || 'Super Admin'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wider">{roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
