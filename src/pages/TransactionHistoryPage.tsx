import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import {
  transactionHistoryService,
  type MasterTransaction,
  type TransactionHistoryStats
} from '../services/transactionHistoryService';

type TypeFilter = 'all' | 'Deposit' | 'Withdrawal';
type StatusFilter = 'all' | 'Completed' | 'Pending' | 'Declined';

const emptyStats: TransactionHistoryStats = {
  totalVolume: 0,
  depositVolume: 0,
  withdrawalVolume: 0,
  rakeVolume: 0,
  completedCount: 0,
  pendingCount: 0,
  declinedCount: 0,
  successRate: 0
};

const currency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

export const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<MasterTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(emptyStats);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const result = await transactionHistoryService.getTransactions({
          search,
          type,
          status,
          sortBy: 'time_desc',
          page,
          pageSize
        });
        if (cancelled) return;
        setTransactions(result.items);
        setTotal(result.total);
        setStats(result.stats);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load transactions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, type, status, page, refreshKey]);

  const exportCsv = () => transactionHistoryService.exportCsv(transactions);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="mx-auto max-w-[1440px] space-y-5 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Transactions</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Transaction history</h1>
          <p className="mt-1 text-sm text-slate-500">Deposits and withdrawals recorded by the backend. No simulated ledger entries.</p>
        </div>
        <button onClick={exportCsv} disabled={!transactions.length} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Download className="h-4 w-4" /> Export current page
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Transaction volume" value={currency(stats.totalVolume)} />
        <Metric label="Deposits" value={currency(stats.depositVolume)} />
        <Metric label="Withdrawals" value={currency(stats.withdrawalVolume)} />
        <Metric label="Pending" value={stats.pendingCount.toLocaleString('en-IN')} />
        <Metric label="Completed / failed" value={`${stats.completedCount} / ${stats.declinedCount}`} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search transaction, player, phone, or reference" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <select value={type} onChange={(event) => { setType(event.target.value as TypeFilter); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All types</option>
            <option value="Deposit">Deposits</option>
            <option value="Withdrawal">Withdrawals</option>
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Declined">Failed</option>
          </select>
          <button onClick={() => setRefreshKey((key) => key + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600" aria-label="Refresh transaction list">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && <div role="alert" className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading && !transactions.length ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading transactions…</p>
        ) : !transactions.length ? (
          <p className="p-8 text-center text-sm text-slate-500">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{transaction.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{transaction.playerName}</div>
                      <div className="font-mono text-xs text-slate-400">{transaction.playerId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{transaction.type}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{currency(transaction.amount)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{transaction.gatewayRef}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(transaction.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${transaction.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : transaction.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>{total.toLocaleString('en-IN')} transactions · Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </footer>
      </section>
    </main>
  );
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

export default TransactionHistoryPage;
