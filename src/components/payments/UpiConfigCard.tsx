import React, { useState } from 'react';
import {
  QrCode,
  Edit2,
  Copy,
  Check,
  Shield,
} from 'lucide-react';
import type { UpiConfigData } from '../../types/paymentGateway';
import { useToast } from '../../hooks/useToast';

interface UpiConfigCardProps {
  config: UpiConfigData;
  onUpdateVpa: (newVpa: string) => void;
}

export const UpiConfigCard: React.FC<UpiConfigCardProps> = ({
  config,
  onUpdateVpa,
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [vpaInput, setVpaInput] = useState(config.vpa);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(config.vpa);
    setCopied(true);
    toast.success('UPI ID Copied', `${config.vpa} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveVpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpaInput.trim()) return;
    onUpdateVpa(vpaInput.trim());
    setIsEditing(false);
    toast.success('UPI ID Updated', `Collection identity set to ${vpaInput.trim()}`);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                UPI Collection Configuration
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary Virtual Payment Address (VPA) for player deposits & automated dynamic QR generation.
            </p>
          </div>
        </div>

        {/* Sandbox Flag */}
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            SANDBOX / DEMO
          </span>
        </div>
      </div>

      {/* Main UPI VPA Display Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              UPI COLLECTION ID
            </span>
            {isEditing ? (
              <form onSubmit={handleSaveVpa} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={vpaInput}
                  onChange={(e) => setVpaInput(e.target.value)}
                  placeholder="payments@demo"
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-hidden focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  {config.vpa}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  VERIFIED
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
              <span>Merchant: {config.merchantName}</span>
              <span>•</span>
              <span>Settlement: {config.bankName}</span>
              <span>•</span>
              <span>A/C: {config.accountNumberMasked}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setVpaInput(config.vpa);
                  setIsEditing(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit UPI ID</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Security & Sandbox Guidance */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">
            Sandbox Isolation & Payment Security
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            This identity is currently running in sandbox mode for safe administrative testing. No real bank accounts are debited. Private merchant keys and PSP webhooks will be connected when moving to production in Payment Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpiConfigCard;
