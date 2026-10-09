import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  QrCode,
  ArrowDownLeft,
  Percent,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { GatewayOverviewKpis } from '../../types/paymentGateway';

interface PaymentGatewayKpisProps {
  kpis: GatewayOverviewKpis;
  upiVpa: string;
}

export const PaymentGatewayKpis: React.FC<PaymentGatewayKpisProps> = ({ kpis, upiVpa }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. ACTIVE GATEWAYS */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
            ACTIVE GATEWAYS
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            <AnimatedNumber value={kpis.activeGateways} duration={0.8} />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
            <span>of {kpis.totalGateways} payment channels</span>
          </p>
        </div>
      </motion.div>

      {/* 2. UPI COLLECTION */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
            UPI COLLECTION
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-black text-emerald-700 tracking-tight font-mono">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate font-mono" title={upiVpa}>
            {upiVpa}
          </p>
        </div>
      </motion.div>

      {/* 3. TODAY'S DEPOSITS */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
            TODAY'S DEPOSITS
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            <AnimatedNumber
              value={kpis.todayDepositsVolume}
              format="compactCurrency"
              prefix="₹"
              duration={1}
            />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1 font-mono">
            <span>+{kpis.todayDepositsGrowth}%</span>
            <span className="text-slate-400 font-normal">vs yesterday</span>
          </p>
        </div>
      </motion.div>

      {/* 4. SUCCESS RATE */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
            SUCCESS RATE
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            <AnimatedNumber
              value={kpis.successRate}
              decimals={1}
              suffix="%"
              duration={0.9}
            />
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>Avg latency 1.1s</span>
          </p>
        </div>
      </motion.div>

      {/* 5. PENDING SETTLEMENT */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
            PENDING SETTLEMENT
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-amber-900 tracking-tight font-mono">
            <AnimatedNumber
              value={kpis.pendingSettlementAmount}
              format="currency"
              prefix="₹"
              duration={1}
            />
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5 font-mono">
            {kpis.pendingSettlementCount} txns in queue
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGatewayKpis;
