import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Zap,
  ShieldCheck,
  PlusCircle,
  Info,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const WithdrawalOperationsPanels: React.FC = () => {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs text-slate-700">
      {/* Left 8 Cols: Integrated Payout Rails & Node Latency */}
      <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                Integrated Payout Rails & Node Latency
              </h3>
              <p className="text-[10px] text-slate-400">
                Live automated gateway dispatch telemetry • Simulated node health
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Rails Operational</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rail 1: RazorpayX */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">RazorpayX</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                99.8% Uptime
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">IMPS / UPI Rail</div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-400">Avg Latency:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>1.2 sec</span>
              </span>
            </div>
          </div>

          {/* Rail 2: Cashfree Auto */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Cashfree Auto</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                99.5% Uptime
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Direct Bank Rail</div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-400">Avg Latency:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>1.8 sec</span>
              </span>
            </div>
          </div>

          {/* Rail 3: ICICI Direct IMPS */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">ICICI Direct IMPS</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                99.9% Uptime
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">High-Volume RTGS</div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-400">Avg Latency:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>0.9 sec</span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic flex items-center gap-1">
          <Info className="w-3 h-3" />
          <span>Note: Latency metrics are telemetry simulations connected to banking node health probes.</span>
        </div>
      </div>

      {/* Right 4 Cols: Settlement Reserve Panel */}
      <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs">Settlement Reserve</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Safe Headroom
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatINR(1480000)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Available liquidity across banking pools. Safe payout headroom: <strong>48 hours</strong>.
            </p>
          </div>

          {/* Reserve Capacity Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase">
              <span>Available Liquidity</span>
              <span className="text-emerald-700 font-bold">84% Capacity</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full"
                style={{ width: '84%' }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsTopUpModalOpen(true)}
          className="w-full mt-2 py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Top Up Pool Reserve</span>
        </button>
      </div>

      {/* Top Up Modal Disclaimer */}
      <AnimatePresence>
        {isTopUpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTopUpModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 z-10 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Pool Liquidity Management</h3>
                </div>
                <button
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-slate-600">
                <p>
                  Pool liquidity top-ups require authorization from the connected banking API gateway (RazorpayX corporate current account or ICICI Direct virtual account).
                </p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
                  <div className="font-bold">Automated Rebalancing Enabled:</div>
                  <div>Pool auto-replenishes when reserve dips below ₹5,00,000 threshold.</div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WithdrawalOperationsPanels;
