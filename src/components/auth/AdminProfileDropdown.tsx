import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Clock,
  Settings,
  LogOut,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export const AdminProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Compute initials dynamically
  const initials = React.useMemo(() => {
    if (!user?.name) return 'SA';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user?.name]);

  const roleLabel = React.useMemo(() => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'Super Administrator';
      case 'ADMIN':
        return 'Platform Administrator';
      case 'FINANCE':
        return 'Financial Operations';
      case 'SUPPORT':
        return 'Support Specialist';
      case 'MANAGER':
        return 'Game Operations Manager';
      default:
        return 'Administrator';
    }
  }, [user?.role]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsLogoutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    setIsOpen(false);
    toast.info('Signed Out', 'You have been disconnected from the session.');
    await logout();
    navigate('/admin/login', { replace: true, state: { loggedOut: true } });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Admin account menu"
        className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer select-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs transition-colors">
          {initials}
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Profile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 py-1.5 z-50 overflow-hidden"
            role="menu"
          >
            {/* User Header */}
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {user?.name || 'Super Admin'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.email || 'admin@gamesystem.com'}
                </div>
                <div className="mt-1">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-block">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu Items */}
            <div className="p-1.5 space-y-0.5 text-xs text-slate-700">
              <button
                type="button"
                onClick={() => handleNavigate('/admin/settings/profile')}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                role="menuitem"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/admin/settings/security')}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                role="menuitem"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Security</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/admin/settings/activity')}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                role="menuitem"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Activity Log</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/admin/settings')}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 my-1" />

            {/* Sign Out Option */}
            <div className="p-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl space-y-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-dialog-title"
              >
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200/80">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h3 id="logout-dialog-title" className="text-base font-bold text-slate-900">
                    Sign out?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You will need to sign in again to access the Game Admin Panel.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLogout}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-rose-600/20 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfileDropdown;
