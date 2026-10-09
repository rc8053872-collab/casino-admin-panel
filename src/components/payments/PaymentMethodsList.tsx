import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QrCode,
  Building,
  CreditCard,
  Layers,
  Settings,
  Power,
  ExternalLink,
} from 'lucide-react';
import type { PaymentMethodItem, GatewayStatus } from '../../types/paymentGateway';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ConfigureMethodModal } from './ConfigureMethodModal';
import { useToast } from '../../hooks/useToast';

interface PaymentMethodsListProps {
  methods: PaymentMethodItem[];
  onUpdateMethod: (updated: PaymentMethodItem) => void;
  onToggleStatus: (id: string, newStatus: GatewayStatus) => void;
}

function getMethodIcon(category: PaymentMethodItem['category']) {
  switch (category) {
    case 'upi':
      return <QrCode className="w-5 h-5 text-emerald-600" />;
    case 'bank_transfer':
      return <Building className="w-5 h-5 text-blue-600" />;
    case 'card':
      return <CreditCard className="w-5 h-5 text-indigo-600" />;
    case 'other':
    default:
      return <Layers className="w-5 h-5 text-purple-600" />;
  }
}

function getStatusBadge(status: GatewayStatus) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </span>
      );
    case 'configured':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Configured</span>
        </span>
      );
    case 'disabled':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-semibold font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Disabled</span>
        </span>
      );
  }
}

export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  methods,
  onUpdateMethod,
  onToggleStatus,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [configuringMethod, setConfiguringMethod] = useState<PaymentMethodItem | null>(null);

  const handleToggle = (m: PaymentMethodItem) => {
    const nextStatus: GatewayStatus = m.status === 'active' ? 'disabled' : 'active';
    onToggleStatus(m.id, nextStatus);
    toast.info(
      'Gateway Status Updated',
      `${m.name} is now ${nextStatus.toUpperCase()}.`
    );
  };

  const handleViewTransactions = (m: PaymentMethodItem) => {
    if (m.category === 'upi') {
      navigate('/admin/transactions/deposits?rail=upi');
    } else if (m.category === 'bank_transfer') {
      navigate('/admin/transactions/deposits?rail=netbanking');
    } else {
      navigate('/admin/transactions/deposits');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Payment Methods</h2>
          <p className="text-xs text-slate-500">
            Active collection rails, routing rules, and settlement status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">
            {methods.filter((m) => m.status === 'active').length} of {methods.length} rails active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => {
          const isActive = method.status === 'active';

          return (
            <motion.div
              key={method.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`bg-white border rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-slate-200/90 hover:border-blue-300/80'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-90'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                      {getMethodIcon(method.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-950 font-mono tracking-tight">
                          {method.name}
                        </h3>
                        {getStatusBadge(method.status)}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Sandbox Banner */}
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[9.5px] font-mono font-bold uppercase tracking-wider">
                      SANDBOX / DEMO
                    </span>
                  </div>
                </div>

                {/* Sub-Methods Tags */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10.5px] font-semibold text-slate-400 mr-1">Methods:</span>
                  {method.subMethods.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 text-[10.5px] font-medium font-mono"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  {/* Metric 1: Success Rate */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Success Rate
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                      {method.status === 'disabled' ? (
                        '—'
                      ) : (
                        <AnimatedNumber
                          value={method.successRate}
                          decimals={1}
                          suffix="%"
                          duration={0.8}
                        />
                      )}
                    </span>
                  </div>

                  {/* Metric 2: Today's Volume */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Today's Volume
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                      {method.todayVolume === 0 ? (
                        '₹0'
                      ) : (
                        <AnimatedNumber
                          value={method.todayVolume}
                          format="compactCurrency"
                          prefix="₹"
                          duration={0.9}
                        />
                      )}
                    </span>
                  </div>

                  {/* Metric 3: Settlement Speed */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Settlement
                    </span>
                    <span
                      className="text-[11px] font-bold text-slate-800 font-mono mt-1 block truncate"
                      title={method.settlementSpeed}
                    >
                      {method.settlementSpeed}
                    </span>
                  </div>

                  {/* Metric 4: Last Sync */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Last Sync
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-1 block truncate">
                      {method.lastSyncAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfiguringMethod(method)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Configure</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(method)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Disable' : 'Enable'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewTransactions(method)}
                  className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Transactions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configure Modal */}
      <ConfigureMethodModal
        method={configuringMethod}
        isOpen={Boolean(configuringMethod)}
        onClose={() => setConfiguringMethod(null)}
        onSave={onUpdateMethod}
      />
    </div>
  );
};

export default PaymentMethodsList;
