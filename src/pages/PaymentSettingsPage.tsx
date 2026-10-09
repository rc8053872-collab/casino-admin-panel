import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, QrCode } from 'lucide-react';
import { paymentSettingsService } from '../services/paymentSettingsService';
import { useToast } from '../hooks/useToast';

export const PaymentSettingsPage: React.FC = () => {
  const toast = useToast();
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [withdrawFeePercent, setWithdrawFeePercent] = useState<number>(0);
  const [configured, setConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    paymentSettingsService.get()
      .then(settings => {
        if (!active) return;
        setUpiId(settings.upiId ?? '');
        setQrCodeUrl(settings.qrCodeUrl ?? '');
        setWithdrawFeePercent(settings.withdrawFeePercent ?? 0);
        setConfigured(settings.configured);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load payment settings.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const result = await paymentSettingsService.save({ upiId, qrCodeUrl, withdrawFeePercent });
      setConfigured(result.configured);
      toast.success('Payment settings saved', 'The player deposit page will now use this UPI ID and QR image.');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Could not save payment settings.';
      setError(message);
      toast.error('Could not save payment settings', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2_100_000) {
      setError('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQrCodeUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl space-y-5 pb-12">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">Player Deposit Settings</h1>
        <p className="mt-1 text-xs text-slate-500">Configure the UPI ID and QR image shown to players for manual deposits. Payment transfer is verified by Admin; this is not an automated banking gateway.</p>
        <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {configured ? 'Configured' : 'Not configured'}
        </span>
      </header>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {isLoading ? <p className="text-sm text-slate-500">Loading settings…</p> : <>
          <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
            <span>UPI ID (Deposit)</span>
            <input required maxLength={320} value={upiId} onChange={event => setUpiId(event.target.value)} placeholder="name@bank" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-500" />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
            <span>Platform Withdrawal Fee (%)</span>
            <input required type="number" min="0" max="100" step="0.1" value={withdrawFeePercent} onChange={event => setWithdrawFeePercent(parseFloat(event.target.value))} placeholder="10" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-500" />
            <p className="text-[10px] font-normal text-slate-500">This percentage is deducted from user withdrawal requests as an admin fee.</p>
          </label>
          <div className="block space-y-1.5 text-xs font-semibold text-slate-700">
            <span>Upload QR Code Image</span>
            <div className="mt-1 flex items-center gap-4">
              <label className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 hover:bg-slate-100 transition-colors">
                <span>Choose Image</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-[10px] text-slate-500 font-normal">Supports PNG, JPG, WebP (Max 2MB)</span>
            </div>
            {/* Hidden URL input to keep it compatible with existing state logic but allow manual overrides if really needed */}
            <input type="hidden" value={qrCodeUrl} />
          </div>
          {qrCodeUrl && <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <img src={qrCodeUrl} alt="Configured deposit QR" className="h-24 w-24 rounded-lg bg-white object-contain" />
            <div className="min-w-0 text-xs text-slate-500 flex flex-col items-start gap-2">
               <div className="flex items-center gap-1"><QrCode className="h-4 w-4" /><p className="break-all">{upiId || 'UPI ID not entered'}</p></div>
               <button type="button" onClick={() => setQrCodeUrl('')} className="text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1">Remove Image</button>
            </div>
          </div>}
          <button type="submit" disabled={isSaving || !qrCodeUrl} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
            <Save className="h-4 w-4" />{isSaving ? 'Saving…' : 'Save deposit settings'}
          </button>
        </>}
      </form>
    </motion.div>
  );
};

export default PaymentSettingsPage;
