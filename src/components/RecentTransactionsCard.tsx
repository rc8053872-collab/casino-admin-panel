import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Transaction } from '../types';
import { animateTableRows } from '../animations/gsapUtils';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
}) => {
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const tween = animateTableRows(tbodyRef.current, reducedMotion);
    return () => {
      tween?.kill();
    };
  }, [reducedMotion]);

  return (
    <div className="data-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between" id="recent-txn-card">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4.5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Recent Transactions</h2>
          <span className="text-xs text-slate-400 whitespace-nowrap">Last updated just now</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]" aria-label="Recent transactions">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Player</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Type</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Amount</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Time</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4.5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef} className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4.5 py-3 font-semibold text-xs text-slate-600 tabular-nums">
                    {tx.playerId}
                  </td>
                  <td className="px-4.5 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                        tx.type === 'deposit'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </span>
                  </td>
                  <td className="px-4.5 py-3 font-semibold text-slate-900 tabular-nums">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4.5 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {tx.timeAgo}
                  </td>
                  <td className="px-4.5 py-3">
                    <motion.span
                      layout={!reducedMotion}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold transition-colors duration-200 ${
                        tx.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {tx.status === 'success' && 'Success'}
                      {tx.status === 'pending' && 'Pending'}
                      {tx.status === 'failed' && 'Failed'}
                    </motion.span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4.5 py-3 bg-slate-50/50 border-t border-slate-100">
        <Link
          to="/admin/transactions/history"
          id="view-all-txn"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
        >
          View all transactions →
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactionsCard;
