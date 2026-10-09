import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../services/gameService';
import type { Game } from '../types/game';

export const GAME_QUERY_KEYS = {
  all: ['games'] as const,
  lists: () => [...GAME_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...GAME_QUERY_KEYS.all, 'detail', id] as const,
  live: () => [...GAME_QUERY_KEYS.all, 'live'] as const,
  players: (id: string) => [...GAME_QUERY_KEYS.all, 'players', id] as const,
  history: (id?: string) => [...GAME_QUERY_KEYS.all, 'history', id ?? 'all'] as const,
  activity: (id?: string) => [...GAME_QUERY_KEYS.all, 'activity', id ?? 'all'] as const,
  metrics: () => [...GAME_QUERY_KEYS.all, 'metrics'] as const,
};

// --- QUERIES ---

export function useGames() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.lists(),
    queryFn: () => gameService.getGames(),
    staleTime: 5000,
  });
}

export function useGame(id?: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.detail(id || ''),
    queryFn: () => (id ? gameService.getGame(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
    staleTime: 5000,
  });
}

export function useLiveGames() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.live(),
    queryFn: () => gameService.getLiveGames(),
    refetchInterval: 5000, // auto poll live telemetry every 5s
  });
}

export function useGamePlayers(id?: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.players(id || ''),
    queryFn: () => (id ? gameService.getGamePlayers(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function useGameHistory(id?: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.history(id),
    queryFn: () => gameService.getGameHistory(id),
  });
}

export function useGameActivity(id?: string) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.activity(id),
    queryFn: () => gameService.getGameActivity(id),
    refetchInterval: 4000,
  });
}

export function useGameMetrics() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.metrics(),
    queryFn: () => gameService.getGameMetrics(),
    refetchInterval: 5000,
  });
}

// --- MUTATIONS ---

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Game>) => gameService.createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Game> }) => gameService.updateGame(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}

export function useDuplicateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.duplicateGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}

export function useEnableGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.enableGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.detail(id) });
    },
  });
}

export function useDisableGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.disableGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.detail(id) });
    },
  });
}

export function useStartGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.startGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.detail(id) });
    },
  });
}

export function useStopGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.stopGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.detail(id) });
    },
  });
}

export function useResetGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gameService.resetGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.detail(id) });
    },
  });
}

export function useBulkEnableGames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => gameService.bulkEnableGames(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}

export function useBulkDisableGames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => gameService.bulkDisableGames(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}

export function useBulkDeleteGames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => gameService.bulkDeleteGames(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}

export function useEmergencyFreezeAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => gameService.emergencyFreezeAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.all });
    },
  });
}
