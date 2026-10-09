import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Player, PlayerStatus, PlayerKycStatus, PlayerRiskTier, PlayerDevice } from '../../types/player';

export const playerFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
  region: z.string().min(2, 'Region is required'),
  device: z.enum(['desktop', 'mobile', 'tablet']),

  status: z.enum(['active', 'in_match', 'offline', 'suspended', 'blocked']),
  kycStatus: z.enum(['verified', 'pending', 'under_review', 'rejected', 'needs_information']),
  riskTier: z.enum(['low', 'medium', 'high', 'critical']),

  balance: z.number().min(0, 'Balance cannot be negative'),

  notifications: z.boolean(),
  language: z.string(),
});

export type PlayerFormData = z.infer<typeof playerFormSchema>;

interface PlayerFormProps {
  initialData?: Partial<Player>;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: PlayerFormData) => void;
  onCancel: () => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({
  initialData,
  isEditing = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
}) => {
  const defaultValues: PlayerFormData = {
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '+91 ',
    region: initialData?.region || 'Maharashtra',
    device: (initialData?.device as PlayerDevice) || 'mobile',

    status: (initialData?.status as PlayerStatus) || 'active',
    kycStatus: (initialData?.kycStatus as PlayerKycStatus) || 'pending',
    riskTier: (initialData?.riskTier as PlayerRiskTier) || 'low',

    balance: initialData?.balance ?? 1000,

    notifications: initialData?.preferences?.notifications ?? true,
    language: initialData?.preferences?.language || 'en',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 1. Basic Information */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
              1
            </span>
            Basic Profile & Contact Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Player credentials, identity contact details, and location cluster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rohit"
              {...register('firstName')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.firstName && <p className="text-[11px] text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kumar"
              {...register('lastName')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.lastName && <p className="text-[11px] text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. rohit_kumar"
              {...register('username')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.username && <p className="text-[11px] text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. rohit.k@example.com"
              {...register('email')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mobile Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              {...register('phone')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Region / Cluster</label>
            <select
              {...register('region')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="Maharashtra">Maharashtra (MUM-IN)</option>
              <option value="Delhi NCR">Delhi NCR (DEL-IN)</option>
              <option value="Karnataka">Karnataka (BLR-IN)</option>
              <option value="Rajasthan">Rajasthan (JAI-IN)</option>
              <option value="Telangana">Telangana (HYD-IN)</option>
              <option value="West Bengal">West Bengal (KOL-IN)</option>
              <option value="Tamil Nadu">Tamil Nadu (CHE-IN)</option>
              <option value="Other">Other Region</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Account & Compliance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-semibold">
              2
            </span>
            Account Status & Security Tier
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Control live match authorization and risk screening.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account State</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="active">Active (Normal Operation)</option>
              <option value="in_match">In Match (Currently Playing)</option>
              <option value="offline">Offline (Idle)</option>
              <option value="suspended">Suspended (Temporary Freeze)</option>
              <option value="blocked">Blocked (Permanent Security Bar)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">KYC Verification</label>
            <select
              {...register('kycStatus')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="verified">Verified (Approved)</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Risk Rating</label>
            <select
              {...register('riskTier')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Wallet Allocation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-semibold">
              3
            </span>
            Wallet Balance Initial Allocation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Deposit starter credits into player ledger.</p>
        </div>

        <div className="max-w-xs text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Wallet Balance (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('balance', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.balance && <p className="text-[11px] text-red-500 mt-1">{errors.balance.message}</p>}
        </div>
      </div>

      {/* 4. Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-semibold">
              4
            </span>
            Communication & Preferences
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Notification dispatch and localized platform language.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
            <select
              {...register('language')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="en">English (India)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                {...register('notifications')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Enable Push & Transaction Notifications
            </label>
          </div>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Player'}
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;
