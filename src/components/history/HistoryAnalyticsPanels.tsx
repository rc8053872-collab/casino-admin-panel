import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { BarChart3, TrendingUp, Flame, Trophy } from 'lucide-react';
import { formatCompactINR, formatINR } from '../../utils/currency';
import { useGamePerformance, useGameValuePerformance } from '../../hooks/useGameHistoryQuery';

export const HistoryAnalyticsPanels: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M'>('7D');
  const { data: performanceData = [] } = useGamePerformance(timeRange);
  const { data: valueData = [] } = useGameValuePerformance();

  const mostPlayed = [
    { name: 'Arena 01 (Grandmaster)', sessions: 42120, pct: 100 },
    { name: 'Arena 03 (Apex)', sessions: 31820, pct: 75.5 },
    { name: 'Arena 02 (Diamond)', sessions: 28410, pct: 67.4 },
    { name: 'Arena 05 (Crash Flight)', sessions: 21900, pct: 52.0 },
  ];

  const highestValue = [
    { name: 'Arena 01 (Grandmaster)', pot: 1840000, label: '₹18.4L total pot', pct: 100 },
    { name: 'Arena 04 (Mega Wheel)', pot: 1420000, label: '₹14.2L total pot', pct: 77.1 },
    { name: 'Arena 02 (Diamond)', pot: 1180000, label: '₹11.8L total pot', pct: 64.1 },
    { name: 'Arena 05 (Crash Flight)', pot: 890000, label: '₹8.9L total pot', pct: 48.3 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs text-slate-700">
      {/* 1. Games Completed Over Time & Value Performance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Games Completed Over Time</h4>
              <p className="text-[11px] text-slate-400">Match outcomes frequency by day/week</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
            {(['7D', '30D', '3M'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  timeRange === r ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-40 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white rounded-lg p-2 text-[11px] space-y-0.5 border border-slate-800">
                        <div className="font-bold">{data.day}</div>
                        <div className="text-emerald-400">Completed: {data.completed.toLocaleString('en-IN')}</div>
                        <div className="text-rose-400">Cancelled: {data.cancelled}</div>
                        <div className="text-amber-400">Abandoned: {data.abandoned}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Game Value Over Time (Pot vs Payout) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Game Value & Payouts Over Time</h4>
              <p className="text-[11px] text-slate-400">Gross table pool vs player payouts settled</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Gross Pot</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-500">Net Payouts</span>
            </div>
          </div>
        </div>

        <div className="h-40 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={valueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickFormatter={(val) => formatCompactINR(val)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white rounded-lg p-2 text-[11px] space-y-0.5 border border-slate-800">
                        <div className="font-bold">{data.day}</div>
                        <div className="text-emerald-400">Total Pot: {formatINR(data.pot)}</div>
                        <div className="text-blue-400">Payouts: {formatINR(data.payout)}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="pot" stroke="#10B981" strokeWidth={2} fill="url(#potGrad)" />
              <Area type="monotone" dataKey="payout" stroke="#2563EB" strokeWidth={2} fill="url(#payoutGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Most Played Games Horizontal Bars */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Most Played Games</h4>
            <p className="text-[11px] text-slate-400">Top games ranked by session count</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {mostPlayed.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-800">{item.name}</span>
                <span className="font-mono font-bold text-slate-700">
                  {item.sessions.toLocaleString('en-IN')} sessions
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Highest Value Games Horizontal Bars */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Highest Value Games</h4>
            <p className="text-[11px] text-slate-400">Ranked by aggregate pot liquidity volume</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {highestValue.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-800">{item.name}</span>
                <span className="font-mono font-bold text-emerald-700">{item.label}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryAnalyticsPanels;
