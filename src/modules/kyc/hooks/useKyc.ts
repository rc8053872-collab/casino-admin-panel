import { useState, useEffect, useCallback } from 'react';
import type {
  KycPlayer,
  KycStats,
  KycFilterParams,
  KycHistoryEvent,
} from '../types/kyc.types';
import { kycService } from '../services/kycService';
import { useToast } from '../../../hooks/useToast';

export function useKycPlayers(filters?: KycFilterParams) {
  const [players, setPlayers] = useState<KycPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPlayers = useCallback(async () => {
    try {
      const data = await kycService.getKycPlayers(filters);
      setPlayers(data);
    } catch (err) {
      console.error('Failed fetching KYC players:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.risk, filters?.dateRange, filters?.verificationType]);

  useEffect(() => {
    fetchPlayers();
    const unsubscribe = kycService.subscribe(() => {
      fetchPlayers();
    });
    return unsubscribe;
  }, [fetchPlayers]);

  return {
    players,
    isLoading,
    refetch: fetchPlayers,
  };
}

export function useKycStats() {
  const [stats, setStats] = useState<KycStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await kycService.getKycStats();
      setStats(data);
    } catch (err) {
      console.error('Failed fetching KYC stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const unsubscribe = kycService.subscribe(() => {
      fetchStats();
    });
    return unsubscribe;
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
}

export function useKycPlayer(playerId: string | undefined) {
  const [player, setPlayer] = useState<KycPlayer | null>(null);
  const [history, setHistory] = useState<KycHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(playerId));

  const fetchPlayer = useCallback(async () => {
    if (!playerId) {
      setPlayer(null);
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await kycService.getKycPlayer(playerId);
      setPlayer(data);
      if (data) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(`Failed fetching KYC player ${playerId}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayer();
    const unsubscribe = kycService.subscribe(() => {
      fetchPlayer();
    });
    return unsubscribe;
  }, [fetchPlayer]);

  return {
    player,
    history,
    isLoading,
    refetch: fetchPlayer,
  };
}

export function useKycActions() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const approve = useCallback(
    async (playerId: string, notes?: string, actor?: string) => {
      setIsSubmitting(true);
      try {
        const updated = await kycService.approveKyc(playerId, notes, actor);
        toast.success(
          'KYC Verification Approved',
          `Player ${updated.name} (${updated.id}) marked as VERIFIED.`
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Approval failed.';
        toast.error('Approval Error', msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast]
  );

  const reject = useCallback(
    async (playerId: string, reason: string, notes?: string, actor?: string) => {
      setIsSubmitting(true);
      try {
        const updated = await kycService.rejectKyc(playerId, reason, notes, actor);
        toast.error(
          'KYC Verification Rejected',
          `Player ${updated.name} (${updated.id}) marked as REJECTED. Reason: ${reason}`
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Rejection failed.';
        toast.error('Rejection Error', msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast]
  );

  const requestInfo = useCallback(
    async (playerId: string, requirements: string[], message: string, actor?: string) => {
      setIsSubmitting(true);
      try {
        const updated = await kycService.requestKycInformation(playerId, requirements, message, actor);
        toast.info(
          'Information Requested',
          `Requirements sent to player ${updated.name}: ${requirements.join(', ')}`
        );
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Request failed.';
        toast.error('Request Error', msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast]
  );

  return {
    approve,
    reject,
    requestInfo,
    isSubmitting,
  };
}
