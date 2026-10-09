import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Copy,
  Check,
  Eye,
  IndianRupee,
  Shield,
  Download,
  Plus,
  Trash2,
  Grid,
  Layers,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { paymentGatewayService } from '../../services/paymentGatewayService';
import type { MultiQrItem } from '../../types/paymentGateway';
import { useToast } from '../../hooks/useToast';

interface QrGeneratorCardProps {
  upiVpa: string;
  onPreviewPlayerPayment: (amount: number) => void;
}

const DEFAULT_MULTI_ITEMS: Array<{ id: string; amount: number; label: string; note?: string }> = [
  { id: 'mqr-100', amount: 100, label: 'Starter', note: 'Deposit ₹100' },
  { id: 'mqr-200', amount: 200, label: 'Casual', note: 'Deposit ₹200' },
  { id: 'mqr-500', amount: 500, label: 'Standard', note: 'Deposit ₹500' },
  { id: 'mqr-1000', amount: 1000, label: 'Pro Pack', note: 'Deposit ₹1,000' },
  { id: 'mqr-2000', amount: 2000, label: 'High Roller', note: 'Deposit ₹2,000' },
  { id: 'mqr-5000', amount: 5000, label: 'VIP Club', note: 'Deposit ₹5,000' },
];

const PACK_PRESETS = [
  {
    name: 'Standard Pack',
    items: [
      { id: 'p-100', amount: 100, label: 'Starter', note: 'Deposit ₹100' },
      { id: 'p-200', amount: 200, label: 'Casual', note: 'Deposit ₹200' },
      { id: 'p-500', amount: 500, label: 'Standard', note: 'Deposit ₹500' },
      { id: 'p-1000', amount: 1000, label: 'Pro Pack', note: 'Deposit ₹1,000' },
      { id: 'p-2000', amount: 2000, label: 'High Roller', note: 'Deposit ₹2,000' },
      { id: 'p-5000', amount: 5000, label: 'VIP Club', note: 'Deposit ₹5,000' },
    ],
  },
  {
    name: 'VIP High Roller',
    items: [
      { id: 'v-2500', amount: 2500, label: 'VIP Bronze', note: 'Deposit ₹2,500' },
      { id: 'v-5000', amount: 5000, label: 'VIP Silver', note: 'Deposit ₹5,000' },
      { id: 'v-10000', amount: 10000, label: 'VIP Gold', note: 'Deposit ₹10,000' },
      { id: 'v-25000', amount: 25000, label: 'VIP Platinum', note: 'Deposit ₹25,000' },
      { id: 'v-50000', amount: 50000, label: 'VIP Diamond', note: 'Deposit ₹50,000' },
    ],
  },
  {
    name: 'Micro-Pay Pack',
    items: [
      { id: 'm-50', amount: 50, label: 'Trial', note: 'Deposit ₹50' },
      { id: 'm-100', amount: 100, label: 'Tier 1', note: 'Deposit ₹100' },
      { id: 'm-200', amount: 200, label: 'Tier 2', note: 'Deposit ₹200' },
      { id: 'm-300', amount: 300, label: 'Tier 3', note: 'Deposit ₹300' },
      { id: 'm-500', amount: 500, label: 'Tier 4', note: 'Deposit ₹500' },
    ],
  },
  {
    name: 'Tournaments',
    items: [
      { id: 't-250', amount: 250, label: 'Entry Fee', note: 'Tourney ₹250' },
      { id: 't-500', amount: 500, label: 'Challenger', note: 'Tourney ₹500' },
      { id: 't-750', amount: 750, label: 'Masters', note: 'Tourney ₹750' },
      { id: 't-1500', amount: 1500, label: 'Grand Prix', note: 'Tourney ₹1,500' },
      { id: 't-3000', amount: 3000, label: 'Champion', note: 'Tourney ₹3,000' },
    ],
  },
];

const SINGLE_PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

const MULTI_QR_STORAGE_KEY = 'game_admin_multi_qr_items_v1';

export const QrGeneratorCard: React.FC<QrGeneratorCardProps> = ({
  upiVpa,
  onPreviewPlayerPayment,
}) => {
  const toast = useToast();

  // Primary view mode: 'multi' (Batch / Matrix) vs 'single' (Single inspection)
  const [viewMode, setViewMode] = useState<'multi' | 'single'>('multi');

  // Multi-QR state - persisted in localStorage so deletions stick after page refresh
  const [multiItems, setMultiItems] = useState<Array<{ id: string; amount: number; label: string; note?: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MULTI_QR_STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed reading stored multi QR items:', err);
      }
    }
    return DEFAULT_MULTI_ITEMS;
  });

  // Automatically save to localStorage whenever items are added or deleted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MULTI_QR_STORAGE_KEY, JSON.stringify(multiItems));
      } catch (err) {
        console.warn('Failed saving multi QR items:', err);
      }
    }
  }, [multiItems]);

  const [generatedMultiQrs, setGeneratedMultiQrs] = useState<MultiQrItem[]>([]);
  const [isMultiGenerating, setIsMultiGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New item form state
  const [newAmountInput, setNewAmountInput] = useState<string>('');
  const [newLabelInput, setNewLabelInput] = useState<string>('');

  // Single QR state
  const [singleMode, setSingleMode] = useState<'fixed' | 'custom'>('fixed');
  const [singleAmount, setSingleAmount] = useState<number>(500);
  const [customAmountInput, setCustomAmountInput] = useState<string>('500');
  const [singleQrDataUrl, setSingleQrDataUrl] = useState<string>('');
  const [isSingleGenerating, setIsSingleGenerating] = useState<boolean>(false);
  const [copiedSingleUri, setCopiedSingleUri] = useState<boolean>(false);

  // ── Multi-QR Generation Effect ──
  const refreshMultiQrs = useCallback(async () => {
    if (multiItems.length === 0) {
      setGeneratedMultiQrs([]);
      return;
    }
    setIsMultiGenerating(true);
    try {
      const qrs = await paymentGatewayService.generateMultiQrs(multiItems);
      setGeneratedMultiQrs(qrs);
    } catch (e) {
      console.error('Failed generating multi QRs', e);
      toast.error('Generation Error', 'Failed generating multiple QR batch.');
    } finally {
      setIsMultiGenerating(false);
    }
  }, [multiItems, toast]);

  useEffect(() => {
    refreshMultiQrs();
  }, [refreshMultiQrs, upiVpa]);

  // ── Single QR Generation Effect ──
  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      setIsSingleGenerating(true);
      const url = await paymentGatewayService.generateQrDataUrl(
        singleAmount > 0 ? singleAmount : undefined,
        `Deposit ₹${singleAmount} Demo`
      );
      if (!isCancelled) {
        setSingleQrDataUrl(url);
        setIsSingleGenerating(false);
      }
    };
    generate();

    return () => {
      isCancelled = true;
    };
  }, [singleAmount, upiVpa]);

  // ── Multi-QR Handlers ──
  const handleAddCustomMultiQr = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    const newItem = {
      id: `mqr-${Date.now()}`,
      amount: parsedAmount,
      label: newLabelInput.trim() || `Custom ₹${parsedAmount}`,
      note: `Deposit ₹${parsedAmount}`,
    };

    setMultiItems((prev) => [...prev, newItem]);
    setNewAmountInput('');
    setNewLabelInput('');
    toast.success('QR Added', `Generated payment QR for ₹${parsedAmount.toLocaleString('en-IN')}.`);
  };

  const handleRemoveMultiQr = (id: string, amount: number) => {
    setMultiItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('QR Removed', `Removed ₹${amount} from active batch.`);
  };

  const handleApplyPresetPack = (packName: string) => {
    const pack = PACK_PRESETS.find((p) => p.name === packName);
    if (pack) {
      setMultiItems(pack.items);
      toast.success('Pack Loaded', `Loaded ${pack.name} with ${pack.items.length} QR codes.`);
    }
  };

  const handleResetDefaults = () => {
    setMultiItems(DEFAULT_MULTI_ITEMS);
    toast.info('Batch Reset', 'Restored default standard pack denominations.');
  };

  const handleCopySingleItemUri = (item: MultiQrItem) => {
    if (!item.uri) return;
    navigator.clipboard.writeText(item.uri);
    setCopiedId(item.id);
    toast.success('URI Copied', `Payment link for ₹${item.amount} copied.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSingleItem = (item: MultiQrItem) => {
    if (!item.dataUrl) return;
    paymentGatewayService.downloadQrPng(
      item.dataUrl,
      `UPI_QR_₹${item.amount}_${item.label.replace(/\s+/g, '_')}`
    );
    toast.success('QR Downloaded', `Saved PNG for ₹${item.amount}.`);
  };

  const handleDownloadAllQrs = () => {
    if (generatedMultiQrs.length === 0) {
      toast.info('Empty Batch', 'No QR codes to download.');
      return;
    }
    generatedMultiQrs.forEach((item, index) => {
      setTimeout(() => {
        if (item.dataUrl) {
          paymentGatewayService.downloadQrPng(
            item.dataUrl,
            `UPI_QR_₹${item.amount}_${item.label.replace(/\s+/g, '_')}`
          );
        }
      }, index * 200);
    });
    toast.success('Batch Download Started', `Downloading ${generatedMultiQrs.length} QR codes.`);
  };

  const handleCopyAllUpiLinks = () => {
    if (generatedMultiQrs.length === 0) return;
    const text = generatedMultiQrs
      .map((item) => `₹${item.amount} (${item.label}): ${item.uri}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All Links Copied', `Copied ${generatedMultiQrs.length} UPI payment URIs.`);
  };

  // ── Single QR Handlers ──
  const handleSelectSinglePreset = (val: number) => {
    setSingleAmount(val);
    setCustomAmountInput(val.toString());
  };

  const handleSingleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmountInput);
    if (!isNaN(parsed) && parsed > 0) {
      setSingleAmount(parsed);
      toast.success('QR Updated', `Dynamic QR code updated for ₹${parsed}.`);
    } else {
      toast.error('Invalid Amount', 'Please enter a valid positive deposit amount.');
    }
  };

  const currentSingleUri = paymentGatewayService.buildUpiPayUri(
    singleAmount,
    `Deposit ₹${singleAmount}`
  );

  const handleCopySingleUri = () => {
    navigator.clipboard.writeText(currentSingleUri);
    setCopiedSingleUri(true);
    toast.success('UPI URI Copied', 'Deep link copied to clipboard.');
    setTimeout(() => setCopiedSingleUri(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
      {/* ── Top Header & Mode Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Player Payment QR Generator
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Multi-Pay Enabled</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate multiple simultaneous UPI QR codes for various deposit denominations or test individual dynamic payments.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('multi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'multi'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-blue-600" />
            <span>Multiple QRs (Multi-Pay Batch)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'single'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Single Pay QR</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODE 1: MULTIPLE QRs (MULTI-PAY BATCH MATRIX)                     */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {viewMode === 'multi' ? (
        <div className="space-y-6">
          {/* Quick Packs & Preset Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 mr-1">
                Preset Packs:
              </span>
              {PACK_PRESETS.map((pack) => (
                <button
                  key={pack.name}
                  type="button"
                  onClick={() => handleApplyPresetPack(pack.name)}
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                >
                  {pack.name} ({pack.items.length})
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Reset default denominations"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Batch Global Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadAllQrs}
                disabled={generatedMultiQrs.length === 0}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download All ({generatedMultiQrs.length})</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAllUpiLinks}
                disabled={generatedMultiQrs.length === 0}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy All Links</span>
              </button>
            </div>
          </div>

          {/* Add Custom QR into Multi-Batch Form */}
          <form
            onSubmit={handleAddCustomMultiQr}
            className="p-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="500000"
                  step="1"
                  value={newAmountInput}
                  onChange={(e) => setNewAmountInput(e.target.value)}
                  placeholder="Enter QR Amount (e.g. 750, 2500)"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-hidden focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  placeholder="Optional Label (e.g. VIP Booster, Weekend Pass)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to QR Matrix</span>
            </button>
          </form>

          {/* Multi-QR Generated Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Active Multi-Pay QRs ({generatedMultiQrs.length})
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  UPI ID: <span className="text-slate-700 font-semibold">{upiVpa}</span>
                </span>
              </div>

              {isMultiGenerating && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Regenerating matrix...</span>
                </div>
              )}
            </div>

            {generatedMultiQrs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-600">No QR codes in the current batch</p>
                <p className="text-xs text-slate-400 mt-1">Select a preset pack above or add custom amounts.</p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Load Default Pack
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                <AnimatePresence mode="popLayout">
                  {generatedMultiQrs.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-slate-200/90 hover:border-blue-400/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-slate-900 font-mono tracking-tight leading-tight">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider truncate max-w-[110px]" title={item.label}>
                            {item.label}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMultiQr(item.id, item.amount)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove this QR from batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Crisp QR Code Container */}
                      <div className="relative aspect-square w-full max-w-[180px] mx-auto bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center justify-center my-1 group-hover:border-blue-300 transition-colors">
                        {item.dataUrl ? (
                          <img
                            src={item.dataUrl}
                            alt={`UPI QR ₹${item.amount}`}
                            className="w-full h-full object-contain rounded-md"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-[9px] font-mono">Generating...</span>
                          </div>
                        )}
                      </div>

                      {/* Meta Text */}
                      <p className="text-[10px] text-slate-400 text-center font-mono my-1.5 truncate" title={`Scan to pay ₹${item.amount}`}>
                        Scan to Pay ₹{item.amount}
                      </p>

                      {/* Card Action Buttons */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        {/* Preview Player Payment Trigger */}
                        <button
                          type="button"
                          onClick={() => onPreviewPlayerPayment(item.amount)}
                          className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>Preview Pay</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1">
                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopySingleItemUri(item)}
                            className="py-1 px-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Copy UPI Deep Link"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy URI</span>
                              </>
                            )}
                          </button>

                          {/* Download PNG */}
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleItem(item)}
                            className="py-1 px-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Download Standalone PNG"
                          >
                            <Download className="w-3 h-3 text-slate-400" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────────── */
        /* MODE 2: SINGLE PAY QR (INSPECTOR MODE)                            */
        /* ───────────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Single QR Code Frame */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="p-4 bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/90 rounded-2xl shadow-inner text-center max-w-[280px] w-full">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block mb-2">
                SINGLE PLAYER PAYMENT QR
              </span>

              {/* QR Image Box */}
              <div className="relative aspect-square w-full max-w-[220px] mx-auto bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-center">
                {isSingleGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-[10px] font-mono">Generating QR...</span>
                  </div>
                ) : singleQrDataUrl ? (
                  <img
                    src={singleQrDataUrl}
                    alt="Player UPI QR Code"
                    className="w-full h-full object-contain rounded-md"
                  />
                ) : (
                  <div className="text-slate-400 text-xs font-mono">QR Unavailable</div>
                )}
              </div>

              {/* Price Badge */}
              <div className="mt-3">
                <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                  ₹{singleAmount.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate" title={upiVpa}>
                  UPI: {upiVpa}
                </p>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 text-center mt-2 max-w-xs leading-relaxed">
              Scan using PhonePe, GPay, Paytm or BHIM in sandbox testing.
            </p>
          </div>

          {/* Right Column: Amount Controls & Generator Actions */}
          <div className="lg:col-span-7 space-y-4 text-xs">
            {/* Details Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Configured UPI ID:</span>
                <span className="font-mono font-bold text-slate-900">{upiVpa}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Current QR Amount:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  ₹{singleAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Sub-Switch for Single Mode: Fixed vs Custom */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 w-fit">
              <button
                type="button"
                onClick={() => setSingleMode('fixed')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  singleMode === 'fixed'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Fixed Presets
              </button>
              <button
                type="button"
                onClick={() => setSingleMode('custom')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  singleMode === 'custom'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Custom Number
              </button>
            </div>

            {/* Amount Selection */}
            {singleMode === 'fixed' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Select Fixed Amount (₹)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SINGLE_PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectSinglePreset(val)}
                      className={`py-2 px-2 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                        singleAmount === val
                          ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-600/20'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSingleCustomSubmit} className="space-y-2">
                <label className="block font-semibold text-slate-700">
                  Enter Custom Amount (₹)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="10"
                      value={customAmountInput}
                      onChange={(e) => setCustomAmountInput(e.target.value)}
                      placeholder="Enter deposit amount"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate QR</span>
                  </button>
                </div>
              </form>
            )}

            {/* Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onPreviewPlayerPayment(singleAmount)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preview Player Payment</span>
              </button>

              <button
                type="button"
                onClick={handleCopySingleUri}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSingleUri ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">URI Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy UPI URI</span>
                  </>
                )}
              </button>

              {singleQrDataUrl && (
                <button
                  type="button"
                  onClick={() =>
                    paymentGatewayService.downloadQrPng(
                      singleQrDataUrl,
                      `UPI_QR_₹${singleAmount}`
                    )
                  }
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download PNG</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sandbox Demo Notice ── */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl flex items-start gap-2 text-[11px] text-amber-800">
        <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Sandbox Demo QR System:</strong> Generated for demo UPI URI representation and rapid simulated counter deposits. Live banking settlement requires connecting an authorized Payment Aggregator (Razorpay / Cashfree) via backend keys.
        </p>
      </div>
    </div>
  );
};

export default QrGeneratorCard;
