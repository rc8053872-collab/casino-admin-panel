import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { PlayerGrowthDataPoint } from '../../types/playerReport';

interface PlayerGrowthChartProps {
  data: PlayerGrowthDataPoint[];
  isLoading?: boolean;
}

type MetricKey = 'all' | 'newPlayers' | 'activePlayers' | 'returningPlayers';
type ChartRange = '7D' | '30D' | '3M';

export const PlayerGrowthChart: React.FC<PlayerGrowthChartProps> = ({
  data,
  isLoading = false,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('all');
  const [selectedRange, setSelectedRange] = useState<ChartRange>('30D');

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs h-80 flex items-center justify-center animate-pulse">
        <div className="h-48 w-full bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Player Growth & Activity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trajectories for new registrations, active concurrents, and recurring returns.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Pills */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setSelectedMetric('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedMetric === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All Metrics
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('newPlayers')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedMetric === 'newPlayers'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              New Players
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('activePlayers')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedMetric === 'activePlayers'
                  ? 'bg-white text-emerald-600 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('returningPlayers')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedMetric === 'returningPlayers'
                  ? 'bg-white text-purple-600 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Returning
            </button>
          </div>

          {/* Range Pills */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            {(['7D', '30D', '3M'] as ChartRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRange(r)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedRange === r
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-lg text-xs space-y-1">
                    <div className="font-bold text-slate-800 mb-1">{label}</div>
                    {payload.map((entry: any) => (
                      <div
                        key={entry.dataKey}
                        className="flex items-center justify-between gap-4 font-medium"
                      >
                        <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}:
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {entry.value?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            {(selectedMetric === 'all' || selectedMetric === 'activePlayers') && (
              <Area
                type="monotone"
                dataKey="activePlayers"
                name="Active Players"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActive)"
              />
            )}

            {(selectedMetric === 'all' || selectedMetric === 'returningPlayers') && (
              <Area
                type="monotone"
                dataKey="returningPlayers"
                name="Returning Players"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReturning)"
              />
            )}

            {(selectedMetric === 'all' || selectedMetric === 'newPlayers') && (
              <Area
                type="monotone"
                dataKey="newPlayers"
                name="New Players"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNew)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlayerGrowthChart;
