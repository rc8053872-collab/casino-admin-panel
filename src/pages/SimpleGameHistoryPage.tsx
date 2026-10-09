import React, { useEffect, useState } from "react";
import { adminRequest } from "../lib/adminApi";

export const GameHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await adminRequest<any>("/admin/games/history");
        setHistory(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <main className="mx-auto max-w-[1440px] space-y-5 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Game History</h1>
        <p className="mt-1 text-sm text-slate-500">Live feed of all bets and wins</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Bet</th>
                <th className="px-4 py-3">Win</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Loading..." : "No game history found"}
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(h.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{h.user?.email || h.userId}</td>
                    <td className="px-4 py-3">{h.game?.name || h.gameId}</td>
                    <td className="px-4 py-3">{h.game?.provider || "-"}</td>
                    <td className="px-4 py-3">₹{h.betAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3">₹{h.winAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        h.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
export default GameHistoryPage;

