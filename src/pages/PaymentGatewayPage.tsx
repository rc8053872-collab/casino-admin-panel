import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Sliders,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { paymentGatewayService } from '../services/paymentGatewayService';
import type { PaymentMethodItem, GatewayStatus } from '../types/paymentGateway';
import PaymentGatewayKpis from '../components/payments/PaymentGatewayKpis';
import PaymentMethodsList from '../components/payments/PaymentMethodsList';
import DepositFlowDiagram from '../components/payments/DepositFlowDiagram';
import AddPaymentMethodModal from '../components/payments/AddPaymentMethodModal';
import AadhaarKycModal from '../components/payments/AadhaarKycModal';
import { pageVariants } from '../animations/variants';
import { useToast } from '../hooks/useToast';

export const PaymentGatewayPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [methods, setMethods] = useState<PaymentMethodItem[]>(() =>
    paymentGatewayService.getPaymentMethods()
  );
  const [kpis, setKpis] = useState(() => paymentGatewayService.getOverviewKpis());
  const upiConfig = paymentGatewayService.getUpiConfig();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);

  const handleUpdateMethod = (updated: PaymentMethodItem) => {
    const list = paymentGatewayService.updateMethod(updated);
    setMethods(list);
    setKpis(paymentGatewayService.getOverviewKpis());
  };

  const handleToggleStatus = (id: string, newStatus: GatewayStatus) => {
    const list = paymentGatewayService.updateMethodStatus(id, newStatus);
    setMethods(list);
    setKpis(paymentGatewayService.getOverviewKpis());
  };

  const handleAddMethod = (newItem: Omit<PaymentMethodItem, 'id' | 'lastSyncAt'>) => {
    const list = paymentGatewayService.addPaymentMethod(newItem);
    setMethods(list);
    setKpis(paymentGatewayService.getOverviewKpis());
  };

  const handleRefresh = () => {
    setMethods(paymentGatewayService.getPaymentMethods());
    setKpis(paymentGatewayService.getOverviewKpis());
    toast.info('Gateway Status Synced', 'Refreshed active rails and settlement queues.');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Payment Gateway
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Payment System Online</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage payment methods, UPI collection, QR payments, deposits and settlement configuration.
          </p>
        </div>

        {/* Top-Right Status & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Refresh Gateway Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsAadhaarModalOpen(true)}
            className="px-3.5 py-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Aadhaar Card KYC</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/payments/settings')}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Gateway Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* 2. Gateway Overview KPIs (5 Cards) */}
      <PaymentGatewayKpis kpis={kpis} upiVpa={upiConfig.vpa} />

      {/* 3. Payment Methods Management (UPI, Bank Transfer, Card, Other) */}
      <PaymentMethodsList
        methods={methods}
        onUpdateMethod={handleUpdateMethod}
        onToggleStatus={handleToggleStatus}
      />

      {/* 4. Transaction Lifecycle Flow (Deposit & Withdrawal Pipeline) */}
      <DepositFlowDiagram onOpenAadhaarKyc={() => setIsAadhaarModalOpen(true)} />

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMethod}
      />

      {/* Aadhaar Card KYC Modal */}
      <AadhaarKycModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
      />
    </motion.div>
  );
};

export default PaymentGatewayPage;
