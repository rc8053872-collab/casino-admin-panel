import React, { useState } from 'react';
import { Eye, Lock, Unlock, FileSearch } from 'lucide-react';
import type { KycPlayer } from '../types/kyc.types';
import { KycStatusBadge } from './KycStatusBadge';
import { KycRiskBadge } from './KycRiskBadge';

interface KycTableProps {
  players: KycPlayer[];
  isLoading?: boolean;
  onSelectPlayer: (player: KycPlayer) => void;
}

export const KycTable: React.FC<KycTableProps> = ({
  players,
  isLoading = false,
  onSelectPlayer,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(players.length / pageSize) || 1;
  const paginatedPlayers = players.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="w-32 h-4 bg-slate-200 rounded" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
            <div className="w-20 h-4 bg-slate-200 rounded" />
            <div className="w-16 h-4 bg-slate-200 rounded" />
            <div className="flex-1" />
            <div className="w-16 h-7 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <FileSearch className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No KYC records match your criteria</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try resetting filters or searching with a different player name, identifier, or PAN snippet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" aria-label="KYC verification queue table">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
              <th className="px-4 py-3.5">Player</th>
              <th className="px-3.5 py-3.5">PAN</th>
              <th className="px-3.5 py-3.5">KYC Status</th>
              <th className="px-3.5 py-3.5">Risk Tier</th>
              <th className="px-3.5 py-3.5">Withdrawal</th>
              <th className="px-3.5 py-3.5">Verification Type</th>
              <th className="px-3.5 py-3.5">Submitted</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPlayers.map((player) => {
              const isLocked = player.withdrawalStatus === 'Locked';

              return (
                <tr
                  key={player.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-default"
                >
                  {/* 1. Player (Name + ID + Avatar) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {player.avatar || player.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate leading-tight group-hover:text-blue-600 transition-colors">
                          {player.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {player.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. PAN (Masked) */}
                  <td className="px-3.5 py-3">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/60">
                      {player.panMasked}
                    </span>
                  </td>

                  {/* 3. KYC Status */}
                  <td className="px-3.5 py-3">
                    <KycStatusBadge status={player.kycStatus} size="sm" />
                  </td>

                  {/* 4. Risk */}
                  <td className="px-3.5 py-3">
                    <KycRiskBadge level={player.riskLevel} score={player.riskScore} size="sm" showScore />
                  </td>

                  {/* 5. Withdrawal Status */}
                  <td className="px-3.5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        isLocked
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-rose-600" />
                      ) : (
                        <Unlock className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{player.withdrawalStatus}</span>
                    </span>
                  </td>

                  {/* 6. Verification Type */}
                  <td className="px-3.5 py-3 text-slate-600 font-medium">
                    <span className="truncate block max-w-[120px]" title={player.verificationType}>
                      {player.verificationType}
                    </span>
                  </td>

                  {/* 7. Submitted Date */}
                  <td className="px-3.5 py-3 text-slate-500 font-mono text-[11px]">
                    {player.submittedDate}
                  </td>

                  {/* 8. Action Button */}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectPlayer(player)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ml-auto cursor-pointer active:scale-95 ${
                        player.kycStatus === 'VERIFIED'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{player.kycStatus === 'VERIFIED' ? 'View' : 'Review'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
        <div>
          Showing{' '}
          <span className="font-bold text-slate-800">
            {Math.min(players.length, (currentPage - 1) * pageSize + 1)}
          </span>{' '}
          to{' '}
          <span className="font-bold text-slate-800">
            {Math.min(players.length, currentPage * pageSize)}
          </span>{' '}
          of <span className="font-bold text-slate-800">{players.length}</span> records
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycTable;
