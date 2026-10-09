import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { LiveGame } from '../types';
import { animateTableRows } from '../animations/gsapUtils';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LiveGamesCardProps {
  games: LiveGame[];
}

export const LiveGamesCard: React.FC<LiveGamesCardProps> = ({ games }) => {
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const tween = animateTableRows(tbodyRef.current, reducedMotion);
    return () => {
      tween?.kill();
    };
  }, [reducedMotion]);

  return (
    <div className="data-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between" id="live-games-card">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4.5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Available Games</h2>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span>{games.length} active</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]" aria-label="Live games in progress">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Game</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Catalog status</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef} className="divide-y divide-slate-100">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4.5 py-3 font-medium text-slate-900">{game.name}</td>
                  <td className="px-4.5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                      Available
                    </span>
                  </td>
                </tr>
              ))}
              {!games.length && <tr><td colSpan={2} className="px-4.5 py-6 text-center text-xs text-slate-400">No active games returned by the backend.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4.5 py-3 bg-slate-50/50 border-t border-slate-100">
        <Link
          to="/admin/games/live"
          id="view-all-games"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
        >
          View all games →
        </Link>
      </div>
    </div>
  );
};

export default LiveGamesCard;
