import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { paymentGatewayService } from '../../services/paymentGatewayService';
import type { AadhaarKycRecord } from '../../types/paymentGateway';
import { useToast } from '../../hooks/useToast';

interface AadhaarKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlayerId?: string;
  defaultPlayerName?: string;
  onSuccess?: (record: AadhaarKycRecord) => void;
}

export const AadhaarKycModal: React.FC<AadhaarKycModalProps> = ({
  isOpen,
  onClose,
  defaultPlayerId = 'PLR-10482',
  defaultPlayerName = 'Rohit Kumar',
  onSuccess,
}) => {
  const toast = useToast();

  const [playerId, setPlayerId] = useState(defaultPlayerId);
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [dob, setDob] = useState('1994-08-15');

  const [gender, setGender] = useState<'M' | 'F' | 'O'>('M');
  const [state, setState] = useState('Maharashtra');
  const [notes, setNotes] = useState('Aadhaar verified for high-volume deposits and withdrawal eligibility.');
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlayerId(defaultPlayerId);
      setPlayerName(defaultPlayerName);
    }
  }, [isOpen, defaultPlayerId, defaultPlayerName]);

  // ESC key listener to close modal
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

  if (!isOpen) return null;

  // Format Aadhaar: 1234 5678 9012
  const handleAadhaarChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    setAadhaarRaw(digitsOnly);
  };

  const formattedAadhaarDisplay = () => {
    if (!aadhaarRaw) return '';
    const parts = aadhaarRaw.match(/.{1,4}/g) || [];
    return parts.join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarRaw.length !== 12) {
      toast.error('Invalid Aadhaar', 'Aadhaar number must contain exactly 12 digits.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const record = paymentGatewayService.addAadhaarRecord({
        playerId,
        playerName,
        aadhaarNumber: aadhaarRaw,
        dob,
        gender,
        state,
        notes,
      });

      setIsVerifying(false);
      toast.success(
        'Aadhaar KYC Verified',
        `Aadhaar card for ${playerName} (${record.aadhaarNumberMasked}) has been successfully authenticated.`
      );
      if (onSuccess) onSuccess(record);
      onClose();
    }, 900);
  };

  const existingRecords = paymentGatewayService.getAadhaarRecords();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Aadhaar Card KYC Verification
                </h3>
                <p className="text-[11px] text-slate-500">
                  Authenticate UIDAI identity for deposit and withdrawal compliance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                title="Close (ESC)"
                aria-label="Close modal (ESC)"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-5 space-y-5 text-xs">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Player ID</label>
                  <input
                    type="text"
                    required
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="As printed on Aadhaar"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* 12-Digit Aadhaar Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">12-Digit Aadhaar Number</label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {aadhaarRaw.length}/12 Digits
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formattedAadhaarDisplay()}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    placeholder="5421 8901 2345"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm tracking-wider focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  Card will be stored with privacy-compliant masking (XXXX-XXXX-••••).
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'O')}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="O">Other (O)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Document Mock Upload Area */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aadhaar Document Copy (Front & Back)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-semibold text-slate-700">
                    Click to attach Aadhaar PDF / JPEG or drag files
                  </p>
                </div>
              </div>

              {/* Compliance Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit & Compliance Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-emerald-600 resize-none"
                  placeholder="Compliance review remarks..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || aadhaarRaw.length !== 12}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying with UIDAI...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authenticate Aadhaar Card</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Existing Records Section */}
            {existingRecords.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-900 block mb-2 font-mono uppercase">
                  Verified Aadhaar Cards ({existingRecords.length})
                </span>
                <div className="space-y-2">
                  {existingRecords.map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10.5px]">
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{r.playerName}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {r.playerId}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 font-semibold">
                            {r.aadhaarNumberMasked}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Verified
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {r.verifiedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AadhaarKycModal;
