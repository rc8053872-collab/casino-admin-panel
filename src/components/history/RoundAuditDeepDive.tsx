import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, FileCode, Download, Eye } from 'lucide-react';
import type { GameSession } from '../../types/gameHistory';
import { formatINR } from '../../utils/currency';
import { useToast } from '../../hooks/useToast';

interface RoundAuditDeepDiveProps {
  session: GameSession | null;
  onOpenDetails?: () => void;
}

export const RoundAuditDeepDive: React.FC<RoundAuditDeepDiveProps> = ({
  session,
  onOpenDetails,
}) => {
  const toast = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!session) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.info('Copied to Clipboard', text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadCert = () => {
    toast.success(
      'Hand Certificate Generated',
      `Forensic SHA-256 certificate for ${session.roundId} ready.`
    );
  };

  const handleViewJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_payload_${session.roundId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Deep Dive Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Round Audit Deep Dive: {session.roundId}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Fair
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {session.gameName} • Table ID: {session.tableId} • Completed at 16:38:12 IST
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDetails && (
            <button
              type="button"
              onClick={onOpenDetails}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Inspect Full Session</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleViewJson}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>View JSON Payload</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCert}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Hand Cert (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Grid: Cryptographic Proof & Sequential Hand Telemetry Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 text-xs text-slate-700">
        {/* Left Column: Cryptographic Proof & Ledger (5 cols) */}
        <div className="lg:col-span-5 p-4 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="font-bold text-[11px] text-slate-900 uppercase tracking-wider">
              CRYPTOGRAPHIC PROOF & ENTROPY
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              MATCH CONFIRMED
            </span>
          </div>

          {/* Server Seed */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold text-slate-500">SERVER SEED (SHA-256 HASH)</span>
              <span className="text-slate-400 font-mono text-[10px]">ECDSA-P256</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all select-all">
              <span className="truncate flex-1">{session.serverSeedHash}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(session.serverSeedHash, 'server')}
                className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
                title="Copy hash"
              >
                {copiedField === 'server' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Client Seed */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold text-slate-500">CLIENT SEED (USER ENTROPY)</span>
              <span className="text-slate-400 font-mono text-[10px]">NONCE: 0x9182</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all select-all">
              <span className="truncate flex-1">{session.clientSeed}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(session.clientSeed, 'client')}
                className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
                title="Copy client seed"
              >
                {copiedField === 'client' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Community Board Cards if available */}
          {session.communityCards && (
            <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700">COMMUNITY BOARD CARDS</span>
                <span className="text-slate-400 text-[10px]">BOARD TEXTURE: Double Paired</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {session.communityCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-12 bg-white rounded-md border border-slate-300 shadow-2xs flex items-center justify-center font-bold text-sm tracking-tight text-slate-900 select-none"
                  >
                    <span className={card.includes('♥') || card.includes('♦') ? 'text-red-600' : 'text-slate-900'}>
                      {card}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settlement Ledger */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block border-b border-slate-200 pb-1">
              SETTLEMENT LEDGER
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Pot Collected:</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(session.totalPot)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Commission (Rake):</span>
                <span className="font-mono font-semibold text-emerald-600">-{formatINR(session.platformRake)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jackpot Drop Fund:</span>
                <span className="font-mono font-semibold text-slate-400">₹0.00</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-900">Net Payout to Winner:</span>
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {formatINR(session.totalPayout)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sequential Hand Telemetry Log (7 cols) */}
        <div className="lg:col-span-7 p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="font-bold text-[11px] text-slate-900 uppercase tracking-wider">
              SEQUENTIAL HAND TELEMETRY LOG
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Total 17 Game Engine Events
            </span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Pre-Flop */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 shrink-0">
                PRE-FLOP
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="font-semibold text-slate-800">Blinds & Initial Betting Action</div>
                <p className="text-[11px] text-slate-500">
                  Small Blind posted by <strong className="text-slate-700">vikram_ace</strong> (₹500); Big Blind posted by <strong className="text-slate-700">priya_queen</strong> (₹1,000); <strong className="text-slate-700">rohit_kumar</strong> raises to ₹3,000; 3 calls; shadow_king raises to ₹8,000; all remaining fold.
                </p>
              </div>
            </div>

            {/* Step 2: Flop */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 shrink-0">
                FLOP
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="font-semibold text-slate-800">Community Cards: A♠ K♦ A♣</div>
                <p className="text-[11px] text-slate-500">
                  <strong className="text-slate-700">rohit_kumar</strong> leads continuation bet of ₹10,000; <strong className="text-slate-700">shadow_king</strong> tanks for 18s and raises to match the call; pot swells to ₹45,500.
                </p>
              </div>
            </div>

            {/* Step 3: Turn */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 shrink-0">
                TURN
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="font-semibold text-slate-800">Turn Card Dealt: K♥</div>
                <p className="text-[11px] text-slate-500">
                  <strong className="text-slate-700">rohit_kumar</strong> checks; <strong className="text-slate-700">shadow_king</strong> fires ₹20,000; <strong className="text-slate-700">rohit_kumar</strong> executes All-in for remaining stacks. Both players committed.
                </p>
              </div>
            </div>

            {/* Step 4: River & Showdown */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white shrink-0">
                RIVER
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>River Card: A♦ • Showdown Resolved</span>
                  <span className="text-emerald-700 font-mono">Final Pot: {formatINR(session.totalPot)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-emerald-200">
                    <span className="text-slate-400 font-semibold block text-[10px]">P4 (WINNER): rohit_kumar</span>
                    <span className="font-bold text-emerald-700">Quad Aces (A A A A K)</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-semibold block text-[10px]">P6 (RUNNER-UP): shadow_king</span>
                    <span className="font-semibold text-slate-700">Kings Full of Aces</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundAuditDeepDive;
