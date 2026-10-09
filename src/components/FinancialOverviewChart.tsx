import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { FinancialDataPoint, FinancialRange } from '../types';
import { api } from '../lib/api';
import { useReducedMotion } from '../hooks/useReducedMotion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialOverviewChartProps {
  initialRange?: FinancialRange;
}

function formatRupees(amount: number): string {
  if (amount >= 100000) {
    return '₹' + (amount / 100000).toFixed(2) + 'L';
  }
  return '₹' + amount.toLocaleString('en-IN');
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({
  initialRange = '30d',
}) => {
  const [range, setRange] = useState<FinancialRange>(initialRange);
  const [chartData, setChartData] = useState<FinancialDataPoint[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;
    api.getFinancial(range)
      .then((data) => {
        if (isMounted) setChartData(data);
      })
      .catch((error: unknown) => {
        console.error('Could not load financial dashboard data:', error);
        if (isMounted) setChartData([]);
      });

    return () => {
      isMounted = false;
    };
  }, [range]);

  const labels = chartData.map((d) => d.label);
  const deposits = chartData.map((d) => d.deposits);
  const withdrawals = chartData.map((d) => d.withdrawals);

  const data = {
    labels,
    datasets: [
      {
        label: 'Deposits',
        data: deposits,
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderColor: 'rgba(34,197,94,1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: 'Withdrawals',
        data: withdrawals,
        backgroundColor: 'rgba(239,68,68,0.65)',
        borderColor: 'rgba(239,68,68,1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
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
            const val = ctx.parsed.y !== null ? ctx.parsed.y : 0;
            return `  ${ctx.dataset.label}: ${formatRupees(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
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
            if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
            if (num >= 1000) return '₹' + (num / 1000).toFixed(0) + 'K';
            return '₹' + num;
          },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="chart-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col" id="financial-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4.5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Deposits vs Withdrawals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Financial flow over selected period.</p>
        </div>

        {/* Filter Tabs with Framer Motion layoutId */}
        <div className="inline-flex self-start sm:self-auto p-0.5 bg-slate-100 border border-slate-200 rounded-md gap-0.5 shrink-0" role="tablist">
          {(['7d', '30d', '3m'] as FinancialRange[]).map((r) => {
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
                    layoutId={reducedMotion ? undefined : 'financial-range-pill'}
                    className="absolute inset-0 bg-white rounded shadow-2xs z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">{r.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4.5 pt-3.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          Deposits
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          Withdrawals
        </span>
      </div>

      {/* Canvas Wrap with crossfade */}
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
            {chartData.length ? <Bar data={data} options={options} /> : <p className="h-full flex items-center justify-center text-sm text-slate-400">No transaction data for this period.</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinancialOverviewChart;
