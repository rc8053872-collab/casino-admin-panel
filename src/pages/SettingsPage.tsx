import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Clock,
  Sliders,
  CheckCircle2,
  Lock,
  Key,
  Laptop,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { useReducedMotion } from '../hooks/useReducedMotion';

type SettingsTab = 'general' | 'profile' | 'security' | 'activity';

interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  time: string;
  status: 'success' | 'warning' | 'info';
  ip: string;
}

const MOCK_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act-1',
    action: 'Administrator Signed In',
    details: 'Console session authenticated via TLS 1.3 gateway',
    time: 'Just now',
    status: 'success',
    ip: '157.48.201.88 (Mumbai)',
  },
  {
    id: 'act-2',
    action: 'Approved Withdrawal Request',
    details: 'Dispatched payout of ₹1,200 (TXN-90411) via IMPS rail',
    time: '12 min ago',
    status: 'success',
    ip: '157.48.201.88 (Mumbai)',
  },
  {
    id: 'act-3',
    action: 'Exported Master Ledger',
    details: 'Compiled and downloaded 500 transaction records (.CSV)',
    time: '28 min ago',
    status: 'info',
    ip: '157.48.201.88 (Mumbai)',
  },
  {
    id: 'act-4',
    action: 'Viewed Financial Statement',
    details: 'Audited October 2026 MTD platform rake yields',
    time: '45 min ago',
    status: 'info',
    ip: '157.48.201.88 (Mumbai)',
  },
  {
    id: 'act-5',
    action: 'Rejected Risk Withdrawal',
    details: 'Flagged transaction for AML velocity breach threshold',
    time: '1h 15m ago',
    status: 'warning',
    ip: '157.48.201.88 (Mumbai)',
  },
  {
    id: 'act-6',
    action: 'Updated Player Isolation Status',
    details: 'Applied risk tier quarantine to multi-accounting cluster',
    time: '2h 10m ago',
    status: 'warning',
    ip: '157.48.201.88 (Mumbai)',
  },
];

export const SettingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const { user } = useAuth();

  // Determine active tab from route
  const getTabFromPath = (): SettingsTab => {
    if (location.pathname.includes('/profile')) return 'profile';
    if (location.pathname.includes('/security')) return 'security';
    if (location.pathname.includes('/activity')) return 'activity';
    return 'general';
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (tab === 'general') navigate('/admin/settings');
    else navigate(`/admin/settings/${tab}`);
  };

  // General settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [platformRake, setPlatformRake] = useState('3.5');
  const [autoApprovalLimit, setAutoApprovalLimit] = useState('2000');
  const [isSaving, setIsSaving] = useState(false);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const handleSaveGeneral = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings Saved', 'Platform parameters updated successfully.');
    }, 300);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Validation Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', 'New passwords do not match.');
      return;
    }
    setIsPasswordSaving(true);
    setTimeout(() => {
      setIsPasswordSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password Updated', 'Administrator credentials updated securely.');
    }, 450);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-16 text-slate-800 text-xs">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & Account Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your administrator profile, security credentials, audit logs, and platform operating limits.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 shrink-0 items-center" role="tablist">
          {[
            { id: 'general', label: 'Platform', icon: Sliders },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'activity', label: 'Activity Log', icon: Clock },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleTabChange(tab.id as SettingsTab)}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId={reducedMotion ? undefined : 'settings-tab-indicator'}
                    className="absolute inset-0 bg-white rounded-lg shadow-2xs z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: General Platform Limits */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Maintenance Toggle */}
            <div className="p-4.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Maintenance Mode</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Temporarily halts new game matching and displays a maintenance banner to players.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={maintenanceMode}
                onClick={() => setMaintenanceMode((prev) => !prev)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                  maintenanceMode ? 'bg-red-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transition-transform ${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Email Alerts Toggle */}
            <div className="p-4.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">High-Value Transaction Alerts</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Instantly notify security administrators on single deposits or withdrawals over ₹25,000.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailAlerts}
                onClick={() => setEmailAlerts((prev) => !prev)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                  emailAlerts ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transition-transform ${
                    emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Platform Rake Fee */}
            <div className="p-4.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Platform Rake Rate (%)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Percentage automatically retained by platform house escrow on each completed game pot.
                </div>
              </div>
              <div className="w-32 flex items-center justify-center shrink-0">
                <input
                  type="number"
                  step="0.1"
                  value={platformRake}
                  onChange={(e) => setPlatformRake(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-center font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Auto Approval Threshold */}
            <div className="p-4.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Auto-Approval Threshold (INR)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Payouts below this threshold clear automatically if verified KYC and zero fraud risk.
                </div>
              </div>
              <div className="w-32 flex items-center justify-center shrink-0">
                <input
                  type="number"
                  value={autoApprovalLimit}
                  onChange={(e) => setAutoApprovalLimit(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-center font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* TAB 2: Profile Settings */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                {user?.name?.slice(0, 2).toUpperCase() || 'SA'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{user?.name || 'Super Admin'}</h2>
                <p className="text-xs text-slate-500">{user?.email || 'admin@gamesystem.com'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {user?.role || 'SUPER_ADMIN'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Active Account</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || 'Super Admin'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Username</label>
                <input
                  type="text"
                  readOnly
                  value={user?.username || 'admin'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || 'admin@gamesystem.com'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Role Assignment</label>
                <input
                  type="text"
                  readOnly
                  value={user?.role || 'SUPER_ADMIN'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Account Status</label>
                <input
                  type="text"
                  readOnly
                  value="Active (Authenticated Clearance)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Last Login Recorded</label>
                <input
                  type="text"
                  readOnly
                  value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Active session'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: Security & Credentials */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Change Password Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Lock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Change Console Password</h2>
            </div>

            <form
              onSubmit={handleUpdatePassword}
              className="space-y-3 max-w-md"
              autoComplete="off"
              data-lpignore="true"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Current Password</label>
                <input
                  type="password"
                  autoComplete="off"
                  data-lpignore="true"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  autoComplete="off"
                  data-lpignore="true"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters with symbols"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  autoComplete="off"
                  data-lpignore="true"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isPasswordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions & 2FA Info */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Active Administrative Sessions</h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Current Device
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Desktop Workstation (Chrome on Windows)</div>
                  <div className="text-[11px] text-slate-500">IP: 157.48.201.88 • Session Token Active</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-bold">Online Now</span>
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs text-blue-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Two-Factor Authentication (2FA) Readiness</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Hardware token (FIDO2/WebAuthn) and TOTP authenticator app verification available on server nodes. Contact infrastructure security to link a physical YubiKey.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: Activity Log */}
      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Administrator Operational Activity Log</h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Audit Trail (Immutable)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_ACTIVITY_LOGS.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'success'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.status === 'warning'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{item.action}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">{item.details}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">Audit Node: {item.ip}</div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 font-medium">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
