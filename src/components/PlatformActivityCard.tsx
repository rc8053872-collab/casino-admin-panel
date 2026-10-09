import AnimatedNumber from './ui/AnimatedNumber';
import type { PlatformActivity } from '../types';

interface PlatformActivityCardProps {
  activity: PlatformActivity;
}

function PlatformMetricValue({ value }: { value: number }) {
  return (
    <AnimatedNumber
      value={value}
      format="number"
      className="text-xl font-bold tracking-tight leading-tight text-slate-900"
    />
  );
}

export const PlatformActivityCard: React.FC<PlatformActivityCardProps> = ({
  activity,
}) => {
  return (
    <section className="platform-card w-full" aria-label="Platform operational activity">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="platform-activity-card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4.5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Platform Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time operational snapshot.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 10a7 7 0 0114 0M17 10v3h-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refreshed just now
          </span>
        </div>

        {/* Database-backed operational metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Stat 1 */}
          <div className="p-4 sm:p-4.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 5l1.5 1.5L17 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <PlatformMetricValue value={activity.newPlayersToday} />
              <div className="text-xs text-slate-500 truncate">New accounts today</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-4 sm:p-4.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <PlatformMetricValue value={activity.depositsLastHour} />
              <div className="text-xs text-slate-500 truncate">Deposits in last hour</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-4 sm:p-4.5 flex items-center gap-3 relative">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none">
                <path d="M16 10H4M8 14l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <PlatformMetricValue value={activity.withdrawalsPending} />
              <div className="text-xs text-slate-500 truncate">Withdrawals pending</div>
            </div>
            <span className="absolute top-2.5 right-3 text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
              Action needed
            </span>
          </div>

          {/* Stat 4 */}
          <div className="p-4 sm:p-4.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="10.5" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0">
              <PlatformMetricValue value={activity.gamesAvailable} />
              <div className="text-xs text-slate-500 truncate">Games available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformActivityCard;
