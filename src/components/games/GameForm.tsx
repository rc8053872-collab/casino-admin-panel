import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Game, GameCategory, GameStatus } from '../../types/game';

// Zod Schema with matching input/output types
export const gameFormSchema = z
  .object({
    id: z.string().min(2, 'Game ID must have at least 2 characters'),
    name: z.string().min(3, 'Game Name must be at least 3 characters'),
    subtitle: z.string(),
    description: z.string(),
    category: z.string().min(1, 'Category is required'),
    status: z.enum(['live', 'enabled', 'disabled', 'scheduled', 'completed']),
    visibility: z.enum(['public', 'private']),

    // Dates
    startDate: z.string().optional(),
    startTime: z.string().optional(),
    endDate: z.string().optional(),
    endTime: z.string().optional(),

    // Players
    minPlayers: z.number().min(1, 'Min players must be at least 1'),
    maxPlayers: z.number().min(1, 'Max players must be at least 1'),
    recommendedPlayers: z.number().min(1, 'Recommended players must be at least 1'),
    allowSpectators: z.boolean(),
    autoStart: z.boolean(),
    autoRestart: z.boolean(),

    // Rules
    rounds: z.number().min(1, 'Rounds must be at least 1'),
    roundDuration: z.number().min(5, 'Round duration must be at least 5s'),
    turnDuration: z.number().min(0, 'Turn duration cannot be negative'),
    maxRounds: z.number().min(1, 'Max rounds must be at least 1'),
    enableTimer: z.boolean(),
    allowReconnect: z.boolean(),
    reconnectionTime: z.number().min(0, 'Reconnection time cannot be negative'),

    // Financial
    entryAmount: z.number().min(0, 'Entry amount cannot be negative'),
    minEntry: z.number().min(0, 'Min entry cannot be negative'),
    maxEntry: z.number().min(0, 'Max entry cannot be negative'),
    currency: z.string(),
    rakePercent: z.string(),

    // Display
    accentColor: z.string(),
    thumbnail: z.string().optional(),
    banner: z.string().optional(),
    rules: z.string().optional(),
    instructions: z.string().optional(),

    // Advanced
    advanced: z.object({
      enableLogging: z.boolean(),
      enableStatistics: z.boolean(),
      allowReplay: z.boolean(),
      enableNotifications: z.boolean(),
      maintenanceMode: z.boolean(),
      allowManualStart: z.boolean(),
      allowManualStop: z.boolean(),
    }),
  })
  .refine((data) => data.minPlayers <= data.maxPlayers, {
    message: 'Minimum players must be less than or equal to maximum players',
    path: ['minPlayers'],
  });

export type GameFormData = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  initialData?: Partial<Game>;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: GameFormData) => void;
  onCancel: () => void;
  onSaveDraft?: (data: Partial<GameFormData>) => void;
}

export const GameForm: React.FC<GameFormProps> = ({
  initialData,
  isEditing = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onSaveDraft,
}) => {
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | undefined>(initialData?.thumbnail);

  const defaultValues: GameFormData = {
    id: initialData?.id || '',
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    category: (initialData?.category as GameCategory) || 'Card',
    status: (initialData?.status as GameStatus) || 'enabled',
    visibility: initialData?.visibility || 'public',

    startDate: initialData?.startDate || '',
    startTime: initialData?.startTime || '',
    endDate: initialData?.endDate || '',
    endTime: initialData?.endTime || '',

    minPlayers: initialData?.minPlayers ?? 2,
    maxPlayers: initialData?.maxPlayers ?? 6,
    recommendedPlayers: initialData?.recommendedPlayers ?? 4,
    allowSpectators: initialData?.allowSpectators ?? true,
    autoStart: initialData?.autoStart ?? true,
    autoRestart: initialData?.autoRestart ?? true,

    rounds: initialData?.rounds ?? 10,
    roundDuration: initialData?.roundDuration ?? 90,
    turnDuration: initialData?.turnDuration ?? 20,
    maxRounds: initialData?.maxRounds ?? 20,
    enableTimer: initialData?.enableTimer ?? true,
    allowReconnect: initialData?.allowReconnect ?? true,
    reconnectionTime: initialData?.reconnectionTime ?? 45,

    entryAmount: initialData?.entryAmount ?? 100,
    minEntry: initialData?.minEntry ?? 100,
    maxEntry: initialData?.maxEntry ?? 1000,
    currency: initialData?.currency || 'INR',
    rakePercent: initialData?.rakePercent || '3.5%',

    accentColor: initialData?.accentColor || '#3B82F6',
    thumbnail: initialData?.thumbnail || '',
    banner: initialData?.banner || '',
    rules: initialData?.rules || 'Standard rules apply.',
    instructions: initialData?.instructions || 'Join the table and place your bet.',

    advanced: {
      enableLogging: initialData?.advanced?.enableLogging ?? true,
      enableStatistics: initialData?.advanced?.enableStatistics ?? true,
      allowReplay: initialData?.advanced?.allowReplay ?? true,
      enableNotifications: initialData?.advanced?.enableNotifications ?? true,
      maintenanceMode: initialData?.advanced?.maintenanceMode ?? false,
      allowManualStart: initialData?.advanced?.allowManualStart ?? true,
      allowManualStop: initialData?.advanced?.allowManualStop ?? true,
    },
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues,
  });

  const category = watch('category');
  const accentColor = watch('accentColor');

  // Handle mock image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
      setValue('thumbnail', url);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. BASIC INFORMATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
              1
            </span>
            Basic Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Primary identifier, category, and display metadata.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Game Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Game Arena 01"
              {...register('name')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Game ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GAME-001"
              disabled={isEditing}
              {...register('id')}
              className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                isEditing ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-200'
              }`}
            />
            {errors.id && <p className="text-[11px] text-red-500 mt-1">{errors.id.message}</p>}
            {!isEditing && (
              <p className="text-[11px] text-slate-400 mt-0.5">Leave blank or provide custom ID format.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              placeholder="e.g. Slots, Card, Aviator"
              {...register('category')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Mode Tagline</label>
            <input
              type="text"
              placeholder="e.g. High Roller Texas Hold'em"
              {...register('subtitle')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Operational description of game arena mechanics, player incentives..."
              {...register('description')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Icon / Thumbnail Upload & Preview */}
          <div className="md:col-span-2 flex items-center gap-4 pt-2">
            <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              {thumbPreview ? (
                <img src={thumbPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 uppercase">{category.substring(0, 3)}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Game Icon / Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. GAME AVAILABILITY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-semibold">
              2
            </span>
            Game Availability & Scheduling
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Control live operational state and scheduling windows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="enabled">Enabled (Open for matchmaking)</option>
              <option value="disabled">Disabled (Maintenance / Paused)</option>
              <option value="scheduled">Scheduled (Timed launch)</option>
              <option value="live">Live (Active running session)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
            <select
              {...register('visibility')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="public">Public (All platform players)</option>
              <option value="private">Private (Password / VIP invite only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              {...register('startTime')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time (Optional)</label>
            <input
              type="time"
              {...register('endTime')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. PLAYER CONFIGURATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">
              3
            </span>
            Player Capacity & Automation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Enforce seat limits and auto-start policies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Players</label>
            <input
              type="number"
              {...register('minPlayers', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.minPlayers && <p className="text-[11px] text-red-500 mt-1">{errors.minPlayers.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Players</label>
            <input
              type="number"
              {...register('maxPlayers', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.maxPlayers && <p className="text-[11px] text-red-500 mt-1">{errors.maxPlayers.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Players</label>
            <input
              type="number"
              {...register('recommendedPlayers', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              {...register('allowSpectators')}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            Allow Spectators
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              {...register('autoStart')}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            Auto Start When Full
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              {...register('autoRestart')}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            Auto Restart Next Match
          </label>
        </div>
      </div>

      {/* 4. GAME RULES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-semibold">
              4
            </span>
            Game Rules & Timers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Rounds, shot clocks, reconnection buffers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rounds</label>
            <input
              type="number"
              {...register('rounds', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Round Duration (sec)</label>
            <input
              type="number"
              {...register('roundDuration', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Turn Duration (sec)</label>
            <input
              type="number"
              {...register('turnDuration', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reconnection Time (sec)</label>
            <input
              type="number"
              {...register('reconnectionTime', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              {...register('enableTimer')}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            Enable Turn Countdown Timer
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              {...register('allowReconnect')}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            Allow Player Reconnect on Disconnect
          </label>
        </div>
      </div>

      {/* 5. FINANCIAL / ENTRY CONFIGURATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-semibold">
              5
            </span>
            Financial & Entry Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Buy-in stakes, currencies, and platform rake.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Amount (₹)</label>
            <input
              type="number"
              {...register('entryAmount', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Entry (₹)</label>
            <input
              type="number"
              {...register('minEntry', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Entry (₹)</label>
            <input
              type="number"
              {...register('maxEntry', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Rake Fee</label>
            <input
              type="text"
              placeholder="e.g. 3.5%"
              {...register('rakePercent')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 6. GAME DISPLAY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-xs font-semibold">
              6
            </span>
            Game Display & Guidelines
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Aesthetic themes, color badges, and in-game guide texts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Accent Theme Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...register('accentColor')}
                className="w-10 h-8 rounded border border-slate-200 cursor-pointer p-0"
              />
              <span className="text-xs font-mono text-slate-500">{accentColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              {...register('banner')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Game Rules Description</label>
            <textarea
              rows={2}
              {...register('rules')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Player Instructions</label>
            <textarea
              rows={2}
              {...register('instructions')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 7. ADVANCED SETTINGS (Expandable) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
        >
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-semibold">
                7
              </span>
              Advanced Settings & Telemetry Controls
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Audit logging, match replays, manual overrides.</p>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${advancedExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {advancedExpanded && (
          <div className="p-5 pt-0 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.enableLogging')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Enable Socket Logging
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.enableStatistics')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Enable Live Statistics
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.allowReplay')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Allow Match Replay Archive
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.enableNotifications')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Enable Push Notifications
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.maintenanceMode')}
                className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500"
              />
              Maintenance Mode Lock
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.allowManualStart')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Allow Admin Manual Start
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                {...register('advanced.allowManualStop')}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              Allow Admin Manual Stop
            </label>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2.5">
          {onSaveDraft && (
            <button
              type="button"
              onClick={() => onSaveDraft(watch())}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Save Draft
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Game'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default GameForm;
