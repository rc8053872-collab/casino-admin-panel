import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activePlayerService } from '../services/activePlayerService';
import type { ActivePlayerTelemetry, ActivePlayerStats } from '../services/activePlayerService';

export const ACTIVE_PLAYERS_KEYS = {
  all: ['active-players'] as const,
  stats: ['active-players-stats'] as const,
  activity: (id: string) => ['active-player-activity', id] as const,
  heartbeat: (id: string) => ['active-player-heartbeat', id] as const,
};

export function useActivePlayers() {
  return useQuery<ActivePlayerTelemetry[]>({
    queryKey: ACTIVE_PLAYERS_KEYS.all,
    queryFn: () => activePlayerService.getActivePlayers(),
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useActivePlayerStats() {
  return useQuery<ActivePlayerStats>({
    queryKey: ACTIVE_PLAYERS_KEYS.stats,
    queryFn: () => activePlayerService.getActivePlayerStats(),
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });
}

export function usePlayerTelemetryActivity(playerId: string | null) {
  return useQuery({
    queryKey: ACTIVE_PLAYERS_KEYS.activity(playerId || ''),
    queryFn: () => (playerId ? activePlayerService.getPlayerActivity(playerId) : []),
    enabled: Boolean(playerId),
    staleTime: 3000,
  });
}

export function usePlayerTelemetryHeartbeat(playerId: string | null) {
  return useQuery({
    queryKey: ACTIVE_PLAYERS_KEYS.heartbeat(playerId || ''),
    queryFn: () =>
      playerId
        ? activePlayerService.getPlayerHeartbeat(playerId)
        : {
            state: 'disconnected' as const,
            latencyMs: 0,
            quality: 'Offline',
            text: 'Offline',
            context: 'Disconnected',
          },
    enabled: Boolean(playerId),
    staleTime: 3000,
  });
}

export function useEndActiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => activePlayerService.endPlayerSession(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_PLAYERS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ACTIVE_PLAYERS_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player-metrics'] });
    },
  });
}
