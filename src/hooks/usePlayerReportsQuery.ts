import { useQuery } from '@tanstack/react-query';
import { playerReportService } from '../services/playerReportService';
import type { PlayerReportFilters } from '../types/playerReport';

export const PLAYER_REPORT_QUERY_KEYS = {
  all: ['player-reports'] as const,
  kpis: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'kpis', filters] as const,
  growth: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'growth', filters] as const,
  retention: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'retention', filters] as const,
  engagement: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'engagement', filters] as const,
  activityDistribution: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'activity-dist', filters] as const,
  acquisition: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'acquisition', filters] as const,
  segments: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'segments', filters] as const,
  risk: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'risk', filters] as const,
  valueDistribution: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'value-dist', filters] as const,
  recentActivity: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'recent-activity', filters] as const,
  full: (filters: PlayerReportFilters) => [...PLAYER_REPORT_QUERY_KEYS.all, 'full', filters] as const,
};

export function usePlayerReport(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.full(filters),
    queryFn: () => playerReportService.getPlayerReport(filters),
    staleTime: 10000,
  });
}

export function usePlayerKPIs(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.kpis(filters),
    queryFn: () => playerReportService.getPlayerKPIs(filters),
    staleTime: 10000,
  });
}

export function usePlayerGrowth(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.growth(filters),
    queryFn: () => playerReportService.getPlayerGrowth(filters),
    staleTime: 10000,
  });
}

export function useRetentionData(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.retention(filters),
    queryFn: () => playerReportService.getRetentionData(filters),
    staleTime: 10000,
  });
}

export function useEngagementData(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.engagement(filters),
    queryFn: () => playerReportService.getEngagementData(filters),
    staleTime: 10000,
  });
}

export function useAcquisitionData(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.acquisition(filters),
    queryFn: () => playerReportService.getAcquisitionData(filters),
    staleTime: 10000,
  });
}

export function usePlayerSegments(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.segments(filters),
    queryFn: () => playerReportService.getPlayerSegments(filters),
    staleTime: 10000,
  });
}

export function usePlayerRisk(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.risk(filters),
    queryFn: () => playerReportService.getPlayerRisk(filters),
    staleTime: 10000,
  });
}

export function usePlayerValueDistribution(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.valueDistribution(filters),
    queryFn: () => playerReportService.getPlayerValueDistribution(filters),
    staleTime: 10000,
  });
}

export function useRecentPlayerActivity(filters: PlayerReportFilters) {
  return useQuery({
    queryKey: PLAYER_REPORT_QUERY_KEYS.recentActivity(filters),
    queryFn: () => playerReportService.getRecentPlayerActivity(filters),
    staleTime: 10000,
  });
}
