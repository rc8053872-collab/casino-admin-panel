import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit3,
  Gamepad2,
  Coins,
  Users,
  Activity,
  Save,
} from 'lucide-react';
import type { Game, GameCategory } from '../../types/game';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

interface EditLiveGameModalProps {
  isOpen: boolean;
  game: Game | null;
  isLoading?: boolean;
  onSave: (updatedData: Partial<Game>) => void;
  onClose: () => void;
}

export const EditLiveGameModal: React.FC<EditLiveGameModalProps> = ({
  isOpen,
  game,
  isLoading = false,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<GameCategory>('Card');
  const [currentPlayers, setCurrentPlayers] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [currentPot, setCurrentPot] = useState(0);
  const [entryAmount, setEntryAmount] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundStatus, setRoundStatus] = useState('');
  const [duration, setDuration] = useState('05:00');
  const [activityLabel, setActivityLabel] = useState('Normal Activity');
  const [pingMs, setPingMs] = useState(20);

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

  // Sync form when game opens
  useEffect(() => {
    if (game) {
      setName(game.name || '');
      setSubtitle(game.subtitle || '');
      setCategory(game.category || 'Card');
      setCurrentPlayers(game.currentPlayers || 0);
      setMaxPlayers(game.maxPlayers || 6);
      setCurrentPot(game.currentPot > 0 ? game.currentPot : game.totalPot || 0);
      setEntryAmount(game.entryAmount || game.minEntry || 100);
      setCurrentRound(game.currentRound || 1);
      setRoundStatus(game.roundStatus || '');
      setDuration(game.duration || '05:00');
      setActivityLabel(game.activityLabel || 'Normal Activity');
      setPingMs(game.pingMs || 20);
    }
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      subtitle: subtitle.trim(),
      category,
      currentPlayers: Number(currentPlayers),
      maxPlayers: Number(maxPlayers),
      currentPot: Number(currentPot),
      totalPot: Number(currentPot),
      prizePool: Number(currentPot),
      entryAmount: Number(entryAmount),
      currentRound: Number(currentRound),
      roundStatus: roundStatus.trim(),
      duration: duration.trim(),
      activityLabel: activityLabel.trim(),
      pingMs: Number(pingMs),
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
        />

        {/* Modal Dialog */}
        <motion.div
          variants={modalDialogVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 z-10 space-y-4.5 text-xs text-slate-700 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shadow-2xs">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Edit Live Arena</h3>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                    {game.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Update table details, seating occupancy, live pot, and round telemetry.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <kbd className="text-[10px] font-mono bg-white px-1 py-0.2 rounded border border-slate-300 shadow-2xs">
                ESC
              </kbd>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Identity */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <Gamepad2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Arena Identity & Category</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Arena Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Game Arena 01"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GameCategory)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Card">Card</option>
                    <option value="Board">Board</option>
                    <option value="Wheel">Wheel</option>
                    <option value="Crash">Crash</option>
                    <option value="Arcade">Arcade</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. High Roller Texas Hold'em"
                  />
                </div>
              </div>
            </div>

            {/* 2. Players & Financial Stakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Seating */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Seating & Capacity</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                      Current Seated
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={currentPlayers}
                      onChange={(e) => setCurrentPlayers(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Stakes & Pot */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Pot & Entry Fee</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                      Current Pot (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={currentPot}
                      onChange={(e) => setCurrentPot(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                      Entry Stake (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={entryAmount}
                      onChange={(e) => setEntryAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Round & Telemetry */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Round State & Live Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Current Round
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentRound}
                    onChange={(e) => setCurrentRound(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Duration (mm:ss)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                    placeholder="18:42"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Ping Latency (ms)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pingMs}
                    onChange={(e) => setPingMs(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Round Status Tag
                  </label>
                  <input
                    type="text"
                    value={roundStatus}
                    onChange={(e) => setRoundStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                    placeholder="e.g. Turn: River Round or Flight Multiplier 4.82x"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Activity Status
                  </label>
                  <select
                    value={activityLabel}
                    onChange={(e) => setActivityLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 cursor-pointer"
                  >
                    <option value="Normal Activity">Normal Activity</option>
                    <option value="Ultra Low Latency">Ultra Low Latency</option>
                    <option value="Fair RNG Active">Fair RNG Active</option>
                    <option value="Auto-payout">Auto-payout</option>
                    <option value="High Turnover">High Turnover</option>
                    <option value="State Consistent">State Consistent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 italic">
                Changes apply in real time to live telemetry
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onClose}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditLiveGameModal;
