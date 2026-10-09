import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Download,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { usePlayerReport } from '../hooks/usePlayerReportsQuery';
import type { PlayerReportFilters, ReportPeriod } from '../types/playerReport';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Subcomponents
import PlayerReportKpiCards from '../components/reports/PlayerReportKpiCards';
import PlayerReportFiltersBar from '../components/reports/PlayerReportFiltersBar';
import PlayerGrowthChart from '../components/reports/PlayerGrowthChart';
import PlayerCohortRetention from '../components/reports/PlayerCohortRetention';
import PlayerEngagementSection from '../components/reports/PlayerEngagementSection';
import PlayerActivityDonutChart from '../components/reports/PlayerActivityDonutChart';
import PlayerAcquisitionChannels from '../components/reports/PlayerAcquisitionChannels';
import PlayerSegmentsTable from '../components/reports/PlayerSegmentsTable';
import PlayerValueDistribution from '../components/reports/PlayerValueDistribution';
import PlayerRiskMonitor from '../components/reports/PlayerRiskMonitor';
import PlayerRetentionInsights from '../components/reports/PlayerRetentionInsights';
import RecentPlayerActivityTable from '../components/reports/RecentPlayerActivityTable';
import ExportReportModal from '../components/reports/ExportReportModal';

export const PlayerReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reducedMotion = useReducedMotion();

  // Read filter params from URL
  const initialPeriod = (searchParams.get('period') as ReportPeriod) || '30d';
  const initialSegment = searchParams.get('segment') || 'all';
  const initialActivity = searchParams.get('activity') || 'all';
  const initialRisk = searchParams.get('risk') || 'all';
  const initialChannel = searchParams.get('channel') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState<PlayerReportFilters>({
    period: initialPeriod,
    segment: initialSegment,
    activity: initialActivity,
    risk: initialRisk,
    channel: initialChannel,
    search: initialSearch,
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync state to URL search parameters
  const updateUrlParams = (newFilters: PlayerReportFilters) => {
    const params = new URLSearchParams();
    if (newFilters.period && newFilters.period !== '30d') params.set('period', newFilters.period);
    if (newFilters.segment && newFilters.segment !== 'all') params.set('segment', newFilters.segment);
    if (newFilters.activity && newFilters.activity !== 'all') params.set('activity', newFilters.activity);
    if (newFilters.risk && newFilters.risk !== 'all') params.set('risk', newFilters.risk);
    if (newFilters.channel && newFilters.channel !== 'all') params.set('channel', newFilters.channel);
    if (newFilters.search) params.set('search', newFilters.search);
    setSearchParams(params, { replace: true });
  };

  const handleFilterChange = (updated: Partial<PlayerReportFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };
      updateUrlParams(next);
      return next;
    });
  };

  const handleResetFilters = () => {
    const defaultFilters: PlayerReportFilters = {
      period: '30d',
      segment: 'all',
      activity: 'all',
      risk: 'all',
      channel: 'all',
      search: '',
    };
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Fetch report data via TanStack Query
  const { data: report, isLoading, isError, refetch } = usePlayerReport(filters);

  // Stagger entrance container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.08,
      },
    },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  if (isError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-md text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Unable to load player analytics.</h2>
          <p className="text-xs text-slate-500">
            A network error occurred while compiling player telemetry reports.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-16 text-slate-800"
    >
      {/* 1. Page Header */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Player Analytics & Retention
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand player growth, engagement, retention, wallet behavior and risk across the platform.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analytics data synced</span>
            </span>
            <span className="text-[11px] text-slate-400">Updated 2 min ago</span>
          </div>
        </div>

        {/* Header Right Actions: Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Period Selector Dropdown */}
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange({ period: e.target.value as ReportPeriod })}
              className="pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer transition-colors"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month (MTD)</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Export Report Action */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Reusable Report Filter System */}
      <motion.div variants={sectionVariants}>
        <PlayerReportFiltersBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          onApply={() => refetch()}
        />
      </motion.div>

      {/* 3. Top 5 KPI Cards Row */}
      <motion.div variants={sectionVariants}>
        <PlayerReportKpiCards
          kpis={
            report?.kpis || {
              newPlayers: 1248,
              newPlayersTrend: 18.2,
              newPlayersSub: '412 today',
              dailyActiveUsers: 2421,
              dauTrend: 8.4,
              dauSub: 'Peak: 386 concurrent',
              retentionRate: 24.1,
              retentionTrend: 2.8,
              retentionSub: '30-day retention',
              averagePlayerValue: 4280,
              arpuTrend: 6.4,
              arpuSub: 'Average wallet + game value',
              fraudRiskRate: 0.65,
              flaggedAccounts: 84,
              highRiskCount: 12,
              fraudSub: '12 high-risk',
            }
          }
          isLoading={isLoading}
        />
      </motion.div>

      {/* 4. Player Growth Chart & Cohort Retention (2 Columns) */}
      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 min-w-0">
          <PlayerGrowthChart data={report?.growth || []} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <PlayerCohortRetention cohorts={report?.retention || []} isLoading={isLoading} />
        </div>
      </motion.div>

      {/* 5. Player Engagement Overview (4 Compact Cards) */}
      <motion.div variants={sectionVariants}>
        <PlayerEngagementSection
          engagement={
            report?.engagement || {
              avgSessionDuration: '18m 42s',
              sessionsPerPlayer: 4.8,
              gamesPerPlayer: 7.2,
              peakConcurrent: 386,
            }
          }
          isLoading={isLoading}
        />
      </motion.div>

      {/* 6. Activity Distribution & Acquisition Channels (2 Columns) */}
      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 min-w-0">
          <PlayerActivityDonutChart
            distribution={report?.activityDistribution || []}
            isLoading={isLoading}
            onSelectSegment={(seg) => handleFilterChange({ segment: seg })}
          />
        </div>
        <div className="lg:col-span-6 min-w-0">
          <PlayerAcquisitionChannels
            channels={report?.acquisition || []}
            isLoading={isLoading}
          />
        </div>
      </motion.div>

      {/* 7. Player Segments Table & Value Distribution (2 Columns) */}
      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 min-w-0">
          <PlayerSegmentsTable segments={report?.segments || []} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-6 min-w-0">
          <PlayerValueDistribution
            distribution={report?.valueDistribution || []}
            isLoading={isLoading}
          />
        </div>
      </motion.div>

      {/* 8. Player Risk Monitor & Retention Insights */}
      <motion.div variants={sectionVariants} className="space-y-4">
        <PlayerRiskMonitor
          riskData={
            report?.risk || {
              flaggedCount: 84,
              highRiskCount: 12,
              mediumRiskCount: 32,
              lowRiskCount: 40,
              signals: [],
              trend: [],
            }
          }
          isLoading={isLoading}
        />

        <PlayerRetentionInsights
          insights={report?.insights || []}
          isLoading={isLoading}
        />
      </motion.div>

      {/* 9. Recent Player Activity Ledger Table */}
      <motion.div variants={sectionVariants}>
        <RecentPlayerActivityTable
          rows={report?.recentActivity || []}
          isLoading={isLoading}
        />
      </motion.div>

      {/* 10. Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={filters}
      />
    </motion.div>
  );
};

export default PlayerReportsPage;
