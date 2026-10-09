import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ActivityDataPoint, ActivityRange } from '../types';
import { api } from '../lib/api';
import { useReducedMotion } from '../hooks/useReducedMotion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PlayerActivityChartProps {
  initialRange?: ActivityRange;
}

export const PlayerActivityChart: React.FC<PlayerActivityChartProps> = ({
  initialRange = '7d',
}) => {
  const [range, setRange] = useState<ActivityRange>(initialRange);
  const [chartData, setChartData] = useState<ActivityDataPoint[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;
    api.getActivity(range)
      .then((data) => {
        if (isMounted) setChartData(data);
      })
      .catch((error: unknown) => {
        console.error('Could not load player activity data:', error);
        if (isMounted) setChartData([]);
      });

    return () => {
      isMounted = false;
    };
  }, [range]);

  const labels = chartData.map((d) => d.label);
  const activeSeries = chartData.map((d) => d.active);
  const playingSeries = chartData.map((d) => d.playing);

  const data = {
    labels,
    datasets: [
      {
        label: 'Active Players',
        data: activeSeries,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#2563EB',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Playing Now',
        data: playingSeries,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.07)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#6366F1',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: reducedMotion ? 0 : 400,
    },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        titleColor: '#111827',
        bodyColor: '#6B7280',
        padding: 10,
        callbacks: {
          label(ctx) {
            const val = ctx.parsed.y !== null ? ctx.parsed.y.toLocaleString() : '0';
            return `  ${ctx.dataset.label}: ${val}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#9CA3AF', padding: 4 },
        border: { display: false },
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: {
          color: '#9CA3AF',
          padding: 8,
          callback(val) {
            const num = Number(val);
            return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
          },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="chart-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col" id="player-activity-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4.5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Player & Game Activity</h2>
          <p className="text-xs text-slate-500 mt-0.5">Accounts with wallet transactions and recorded game rounds.</p>
        </div>

        {/* Filter Tabs with Framer Motion layoutId */}
        <div className="inline-flex self-start sm:self-auto p-0.5 bg-slate-100 border border-slate-200 rounded-md gap-0.5 shrink-0" role="tablist">
          {(['today', '7d', '30d'] as ActivityRange[]).map((r) => {
            const isSelected = range === r;
            return (
              <button
                key={r}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setRange(r)}
                className={`relative px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  isSelected ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId={reducedMotion ? undefined : 'activity-range-pill'}
                    className="absolute inset-0 bg-white rounded shadow-2xs z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">
                  {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4.5 pt-3.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          Players with transactions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          Game rounds
        </span>
      </div>

      {/* Canvas Wrap with subtle dataset crossfade */}
      <div className="p-4 sm:p-4.5 h-64 sm:h-72 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={range}
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.65 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {chartData.length ? <Line data={data} options={options} /> : <p className="h-full flex items-center justify-center text-sm text-slate-400">No activity data for this period.</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlayerActivityChart;
