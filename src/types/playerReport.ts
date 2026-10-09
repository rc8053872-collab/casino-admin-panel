import type { Player } from './player';

export type ReportPeriod =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface PlayerReportFilters {
  period: ReportPeriod;
  segment?: string;
  activity?: string;
  risk?: string;
  channel?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PlayerReportKPIs {
  newPlayers: number;
  newPlayersTrend: number;
  newPlayersSub: string;

  dailyActiveUsers: number;
  dauTrend: number;
  dauSub: string;

  retentionRate: number;
  retentionTrend: number;
  retentionSub: string;

  averagePlayerValue: number;
  arpuTrend: number;
  arpuSub: string;

  fraudRiskRate: number;
  flaggedAccounts: number;
  highRiskCount: number;
  fraudSub: string;
}

export interface PlayerGrowthDataPoint {
  date: string;
  newPlayers: number;
  activePlayers: number;
  returningPlayers: number;
}

export interface RetentionCohortItem {
  cohort: string; // e.g. "Day 1", "Day 7", "Day 14", "Day 30"
  rate: number; // percentage
  playerCount: number;
  cohortSize: number;
  returnedPlayers: number;
  dropOff: number;
}

export interface EngagementOverview {
  avgSessionDuration: string;
  sessionsPerPlayer: number;
  gamesPerPlayer: number;
  peakConcurrent: number;
}

export interface ActivityDistributionItem {
  name: string;
  percentage: number;
  playerCount: number;
  color: string;
  segmentKey: string;
}

export interface AcquisitionChannelItem {
  channel: string;
  players: number;
  percentage: number;
  trend: number;
}

export interface PlayerSegmentSummary {
  segment: string;
  segmentKey: string;
  players: number;
  avgSession: string;
  avgSpend: number;
  retention: number;
  trend: string;
  badgeClass: string;
}

export interface RiskSignalItem {
  label: string;
  cases: number;
  description: string;
  riskFilter: string;
}

export interface PlayerRiskData {
  flaggedCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  signals: RiskSignalItem[];
  trend: Array<{
    day: string;
    flags: number;
    suspensions: number;
    reviews: number;
  }>;
}

export interface ValueDistributionItem {
  tier: string;
  count: number;
  percentage: number;
  avgActivity: string;
}

export interface PlayerActivityReportRow {
  player: Player;
  segment: string;
  lastActive: string;
  sessionsCount: number;
  gamesCount: number;
  walletBalance: number;
  activityLevel: 'High' | 'Medium' | 'Low';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
}

export interface FullPlayerReport {
  kpis: PlayerReportKPIs;
  growth: PlayerGrowthDataPoint[];
  retention: RetentionCohortItem[];
  engagement: EngagementOverview;
  activityDistribution: ActivityDistributionItem[];
  acquisition: AcquisitionChannelItem[];
  segments: PlayerSegmentSummary[];
  risk: PlayerRiskData;
  valueDistribution: ValueDistributionItem[];
  recentActivity: PlayerActivityReportRow[];
  insights: string[];
}
