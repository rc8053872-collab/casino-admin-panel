import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminRequest } from '../lib/adminApi';

interface PlayerRecord {
  id: string;
  username: string;
  email: string | null;
  mobile: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  wallet: {
    balance: number;
    currency: string;
    status: 'ACTIVE' | 'INACTIVE';
    totalDeposited: number;
    totalWithdrawn: number;
  } | null;
}

interface PlayersResponse {
  users: PlayerRecord[];
  pagination: { total: number; totalPages: number };
}

const money = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

export const AllPlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ limit: '100', search });
      const firstPage = await adminRequest<PlayersResponse>(`/admin/users?${query.toString()}`);
      const pages = await Promise.all(
        Array.from({ length: Math.max(0, firstPage.pagination.totalPages - 1) }, (_, index) =>
          adminRequest<PlayersResponse>(`/admin/users?${new URLSearchParams({ limit: '100', page: String(index + 2), search }).toString()}`)
        )
      );
      setPlayers([...firstPage.users, ...pages.flatMap((page) => page.users)]);
      setTotal(firstPage.pagination.total);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load players.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPlayers(), 250);
    return () => window.clearTimeout(timer);
  }, [loadPlayers]);

  const walletTotal = useMemo(
    () => players.reduce((sum, player) => sum + (player.wallet?.balance ?? 0), 0),
    [players]
  );
  const activeCount = useMemo(() => players.filter((player) => player.status === 'ACTIVE').length, [players]);

  const changeStatus = async (player: PlayerRecord) => {
    const status = player.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    setUpdatingId(player.id);
    setError('');
    try {
      await adminRequest<{ id: string; status: PlayerRecord['status'] }>(`/admin/users/${player.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await loadPlayers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update player status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCsv = () => {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ['ID', 'Username', 'Email', 'Phone', 'Status', 'Wallet balance', 'Deposited', 'Withdrawn', 'Created'],
      ...players.map((player) => [
        player.id,
        player.username,
        player.email ?? '',
        player.mobile ?? '',
        player.status,
        player.wallet?.balance ?? 0,
        player.wallet?.totalDeposited ?? 0,
        player.wallet?.totalWithdrawn ?? 0,
        player.createdAt
      ])
    ];
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `players-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-[1440px] space-y-5 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Players / Directory</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Players</h1>
          <p className="mt-1 text-sm text-slate-500">Registered player accounts and wallet figures from the backend.</p>
        </div>
        <button onClick={exportCsv} disabled={!players.length} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
          Export CSV
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Registered players" value={total.toLocaleString('en-IN')} />
        <Metric label="Active accounts in loaded results" value={activeCount.toLocaleString('en-IN')} />
        <Metric label="Wallet balances in loaded results" value={money(walletTotal)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search username, email, phone, or ID"
            className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button onClick={() => void loadPlayers()} disabled={loading} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {error && <div role="alert" className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading && !players.length ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading players…</p>
        ) : !players.length ? (
          <p className="p-8 text-center text-sm text-slate-500">No players match this search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Deposited</th>
                  <th className="px-4 py-3">Withdrawn</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{player.username}</div>
                      <div className="font-mono text-xs text-slate-400">{player.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{player.email || '—'}</div>
                      <div className="text-xs text-slate-400">{player.mobile || '—'}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{player.wallet ? money(player.wallet.balance, player.wallet.currency) : '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{player.wallet ? money(player.wallet.totalDeposited, player.wallet.currency) : '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{player.wallet ? money(player.wallet.totalWithdrawn, player.wallet.currency) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(player.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${player.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : player.status === 'BANNED' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void changeStatus(player)}
                        disabled={updatingId === player.id}
                        className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {updatingId === player.id ? 'Saving…' : player.status === 'ACTIVE' ? 'Ban' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

export default AllPlayersPage;
