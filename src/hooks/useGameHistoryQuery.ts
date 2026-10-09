import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameHistoryService } from '../services/gameHistoryService';
import type { HistoryFilterParams } from '../types/gameHistory';

export const GAME_HISTORY_KEYS = {
  all: ['game-history'] as const,
  list: (params: HistoryFilterParams) => ['game-history-list', params] as const,
  session: (id: string) => ['game-history-session', id] as const,
  rounds: (sessionId: string) => ['game-history-rounds', sessionId] as const,
  players: (sessionId: string) => ['game-history-players', sessionId] as const,
  transactions: (sessionId: string) => ['game-history-transactions', sessionId] as const,
  timeline: (sessionId: string) => ['game-history-timeline', sessionId] as const,
  auditLog: (sessionId: string) => ['game-history-audit-log', sessionId] as const,
  stats: ['game-history-stats'] as const,
  performance: (range: string) => ['game-history-performance', range] as const,
  valuePerformance: ['game-history-value-performance'] as const,
};

export function useGameHistory(params: HistoryFilterParams = {}) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.list(params),
    queryFn: () => gameHistoryService.getGameHistory(params),
    staleTime: 5000,
  });
}

export function useGameSession(id: string | null) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.session(id || ''),
    queryFn: () => (id ? gameHistoryService.getGameSession(id) : null),
    enabled: Boolean(id),
    staleTime: 5000,
  });
}

export function useGameRounds(sessionId: string | null) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.rounds(sessionId || ''),
    queryFn: () => (sessionId ? gameHistoryService.getGameRounds(sessionId) : []),
    enabled: Boolean(sessionId),
    staleTime: 5000,
  });
}

export function useSessionPlayers(sessionId: string | null) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.players(sessionId || ''),
    queryFn: () => (sessionId ? gameHistoryService.getSessionPlayers(sessionId) : []),
    enabled: Boolean(sessionId),
    staleTime: 5000,
  });
}

export function useSessionTransactions(sessionId: string | null) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.transactions(sessionId || ''),
    queryFn: () => (sessionId ? gameHistoryService.getSessionTransactions(sessionId) : []),
    enabled: Boolean(sessionId),
    staleTime: 5000,
  });
}

export function useSessionTimeline(sessionId: string | null) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.timeline(sessionId || ''),
    queryFn: () => (sessionId ? gameHistoryService.getSessionTimeline(sessionId) : []),
    enabled: Boolean(sessionId),
    staleTime: 5000,
  });
}

export function useSessionAuditLog(sessionId: string | null) {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.auditLog(sessionId || ''),
    queryFn: () => (sessionId ? gameHistoryService.getSessionAuditLog(sessionId) : []),
    enabled: Boolean(sessionId),
    staleTime: 5000,
  });
}

export function useGameHistoryStats() {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.stats,
    queryFn: () => gameHistoryService.getGameHistoryStats(),
    staleTime: 10000,
  });
}

export function useGamePerformance(range: '7D' | '30D' | '3M' = '7D') {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.performance(range),
    queryFn: () => gameHistoryService.getGamePerformance(range),
    staleTime: 10000,
  });
}

export function useGameValuePerformance() {
  return useQuery({
    queryKey: GAME_HISTORY_KEYS.valuePerformance,
    queryFn: () => gameHistoryService.getGameValuePerformance(),
    staleTime: 10000,
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      action,
      notes,
    }: {
      sessionId: string;
      action: 'reviewed' | 'refunded' | 'confirmed' | 'escalated';
      notes?: string;
    }) => gameHistoryService.resolveDispute(sessionId, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_HISTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['game-history-list'] });
      queryClient.invalidateQueries({ queryKey: ['game-history-stats'] });
    },
  });
}
