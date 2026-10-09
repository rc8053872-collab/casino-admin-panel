import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalService } from '../services/withdrawalService';
import type { WithdrawalFilterParams } from '../types/withdrawal';

export const WITHDRAWAL_QUERY_KEYS = {
  all: ['withdrawals'] as const,
  list: (params: WithdrawalFilterParams) => [...WITHDRAWAL_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...WITHDRAWAL_QUERY_KEYS.all, 'detail', id] as const,
  stats: () => [...WITHDRAWAL_QUERY_KEYS.all, 'stats'] as const,
  timeline: (id: string) => [...WITHDRAWAL_QUERY_KEYS.all, 'timeline', id] as const,
};

export function useWithdrawals(params: WithdrawalFilterParams = {}) {
  return useQuery({
    queryKey: WITHDRAWAL_QUERY_KEYS.list(params),
    queryFn: () => withdrawalService.getWithdrawals(params),
    staleTime: 5000,
  });
}

export function useWithdrawal(id?: string) {
  return useQuery({
    queryKey: WITHDRAWAL_QUERY_KEYS.detail(id || ''),
    queryFn: () => (id ? withdrawalService.getWithdrawal(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 5000,
  });
}

export function useWithdrawalStats() {
  return useQuery({
    queryKey: WITHDRAWAL_QUERY_KEYS.stats(),
    queryFn: () => withdrawalService.getWithdrawalStats(),
    staleTime: 5000,
  });
}

export function useSettlementTimeline(id?: string) {
  return useQuery({
    queryKey: WITHDRAWAL_QUERY_KEYS.timeline(id || ''),
    queryFn: () => (id ? withdrawalService.getSettlementTimeline(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, paymentReference }: { id: string; amount: number; paymentReference?: string }) =>
      withdrawalService.approveWithdrawal(id, amount, paymentReference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WITHDRAWAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      withdrawalService.rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WITHDRAWAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

export function useInvestigateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawalService.investigateWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WITHDRAWAL_QUERY_KEYS.all });
    },
  });
}

export function useBulkApproveWithdrawals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => withdrawalService.bulkApproveWithdrawals(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WITHDRAWAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}
