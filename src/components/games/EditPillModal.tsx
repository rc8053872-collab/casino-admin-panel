import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

export interface ArenaCategoryPill {
  id: string;
  name: string;
  category?: string;
  keyword?: string;
  isDefault?: boolean;
}

interface EditPillModalProps {
  isOpen: boolean;
  pill: ArenaCategoryPill | null;
  isNew?: boolean;
  onSave: (pill: ArenaCategoryPill) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const EditPillModal: React.FC<EditPillModalProps> = ({
  isOpen,
  pill,
  isNew = false,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (pill) {
      setName(pill.name);
      setCategory(pill.category || 'all');
      setKeyword(pill.keyword || '');
    } else {
      setName('');
      setCategory('all');
      setKeyword('');
    }
  }, [pill, isNew]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = isNew
      ? `pill_${Date.now()}`
      : pill?.id || `pill_${Date.now()}`;

    onSave({
      id,
      name: name.trim(),
      category,
      keyword: keyword.trim() || undefined,
      isDefault: pill?.isDefault,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          variants={modalDialogVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 z-10 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isNew ? 'Create New Arena Tab' : `Edit Arena Tab: ${pill?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Customize tab label, category criteria, and search keywords.
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Tab Label */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tab Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. High Rollers, Rummy Rooms, Crash Arenas..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Target Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Filter by Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="all">All Categories (Any)</option>
                <option value="Card">Card Games (Poker / Rummy)</option>
                <option value="Board">Board Games (Ludo / Carrom)</option>
                <option value="Arcade">Arcade Games</option>
                <option value="Strategy">Strategy Games</option>
                <option value="Wheel">Wheel & Roulette</option>
                <option value="Crash">Crash & Flight</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Optional Keyword */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Filter Keyword (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. poker, ludo, blitz, turbo..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Matches arena titles, subtitles, or tags containing this word.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onDelete && !isNew && pill && pill.id !== 'all' ? (
                <button
                  type="button"
                  onClick={() => pill && onDelete(pill.id)}
                  className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                >
                  Delete Tab
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  {isNew ? 'Create Tab' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPillModal;
