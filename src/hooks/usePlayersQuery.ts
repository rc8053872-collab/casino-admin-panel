import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerService } from '../services/playerService';
import type { Player } from '../types/player';

export const PLAYER_QUERY_KEYS = {
  all: ['players'] as const,
  lists: () => [...PLAYER_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PLAYER_QUERY_KEYS.all, 'detail', id] as const,
  txns: (id: string) => [...PLAYER_QUERY_KEYS.all, 'txns', id] as const,
  history: (id: string) => [...PLAYER_QUERY_KEYS.all, 'history', id] as const,
  sessions: (id: string) => [...PLAYER_QUERY_KEYS.all, 'sessions', id] as const,
  activity: (id: string) => [...PLAYER_QUERY_KEYS.all, 'activity', id] as const,
  metrics: () => [...PLAYER_QUERY_KEYS.all, 'metrics'] as const,
};

// --- QUERIES ---

export function usePlayers() {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.lists(),
    queryFn: () => playerService.getPlayers(),
    staleTime: 5000,
  });
}

export function usePlayer(id?: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.detail(id || ''),
    queryFn: () => (id ? playerService.getPlayer(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
    staleTime: 5000,
  });
}

export function usePlayerTransactions(id?: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.txns(id || ''),
    queryFn: () => (id ? playerService.getPlayerTransactions(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function usePlayerGameHistory(id?: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.history(id || ''),
    queryFn: () => (id ? playerService.getPlayerGameHistory(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function usePlayerSessions(id?: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.sessions(id || ''),
    queryFn: () => (id ? playerService.getPlayerSessions(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function usePlayerActivity(id?: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.activity(id || ''),
    queryFn: () => (id ? playerService.getPlayerActivity(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function usePlayerMetrics() {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.metrics(),
    queryFn: () => playerService.getPlayerMetrics(),
    refetchInterval: 5000,
  });
}

// --- MUTATIONS ---

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Player>) => playerService.createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
    },
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Player> }) => playerService.updatePlayer(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useSuspendPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => playerService.suspendPlayer(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useRestorePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerService.restorePlayer(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(id) });
    },
  });
}

export function useBlockPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => playerService.blockPlayer(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useUnblockPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerService.unblockPlayer(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(id) });
    },
  });
}

export function useFreezeWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerService.freezeWallet(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(id) });
    },
  });
}

export function useUnfreezeWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerService.unfreezeWallet(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(id) });
    },
  });
}

export function useApproveKYC() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => playerService.approveKYC(id, notes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useRejectKYC() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => playerService.rejectKYC(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useFlagPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => playerService.flagPlayer(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useMarkRiskReviewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerService.markRiskReviewed(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(id) });
    },
  });
}

export function useEndPlayerSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, sessionId }: { playerId: string; sessionId: string }) =>
      playerService.endPlayerSession(playerId, sessionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.sessions(variables.playerId) });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.activity(variables.playerId) });
    },
  });
}

export function useSendPlayerNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notification }: { id: string; notification: { title: string; message: string; type: string } }) =>
      playerService.sendPlayerNotification(id, notification),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.activity(variables.id) });
    },
  });
}

export function useBulkFreezeWallets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => playerService.bulkFreezeWallets(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
    },
  });
}

export function useBulkSuspend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => playerService.bulkSuspend(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
    },
  });
}

export function useBulkRestore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => playerService.bulkRestore(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
    },
  });
}

export function useBulkUnblock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => playerService.bulkUnblock(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.all });
    },
  });
}

