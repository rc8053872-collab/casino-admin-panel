import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentSettingsService, type PaymentSettingsRecord } from '../services/paymentSettingsService';
import { depositService } from '../services/depositService';
import type { DepositItem } from '../types/deposit';

export const UpiQrPaymentsPage: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettingsRecord | null>(null);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      paymentSettingsService.get(),
      depositService.getDeposits({ rail: 'upi' })
    ]).then(([paymentSettings, recentDeposits]) => {
      if (!active) return;
      setSettings(paymentSettings);
      setDeposits(recentDeposits.slice(0, 5));
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load UPI payment data.');
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">UPI Deposit Configuration</h1>
          <p className="mt-1 text-xs text-slate-500">Current UPI details and deposit requests fetched from the backend.</p>
        </div>
        <Link to="/admin/payments/settings" className="rounded-xl bg-blue-600 px-4 py-2 text-center text-xs font-bold text-white">Edit payment settings</Link>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Configured player payment details</h2>
          {settings?.configured
            ? <><p className="mt-3 font-mono text-lg font-bold text-slate-800">{settings.upiId}</p><p className="mt-1 text-xs text-slate-500">Last updated {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : '—'}</p></>
            : <p className="mt-3 text-sm text-amber-700">No active UPI ID and QR are configured.</p>}
        </div>
        {settings?.qrCodeUrl && <img src={settings.qrCodeUrl} alt="Player deposit QR code" className="h-36 w-36 rounded-xl border border-slate-200 bg-white object-contain p-2" />}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-bold text-slate-900">Recent deposit requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="p-3">Reference</th><th className="p-3">Player</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Requested</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {deposits.map(deposit => <tr key={deposit.id}><td className="p-3 font-mono">{deposit.gatewayRef || deposit.id}</td><td className="p-3">{deposit.playerName}</td><td className="p-3">₹{deposit.amount.toLocaleString('en-IN')}</td><td className="p-3 capitalize">{deposit.status}</td><td className="p-3">{new Date(deposit.timestamp).toLocaleString()}</td></tr>)}
              {!deposits.length && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No deposit requests found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UpiQrPaymentsPage;
