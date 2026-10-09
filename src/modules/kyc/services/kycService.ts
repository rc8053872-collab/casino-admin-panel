import type {
  KycPlayer,
  KycStats,
  KycFilterParams,
  KycHistoryEvent,
} from '../types/kyc.types';
import { INITIAL_KYC_PLAYERS, INITIAL_KYC_STATS } from '../data/mockKycData';
import { playerService } from '../../../services/playerService';

const KYC_STORAGE_KEY = 'game_admin_kyc_players_v1';
const KYC_STATS_STORAGE_KEY = 'game_admin_kyc_stats_v1';
const KYC_CHANGE_EVENT = 'game_admin_kyc_updated';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
}

function formatCurrentTimestamp(): string {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = monthNames[d.getMonth()];
  const yr = d.getFullYear();
  const hr = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${mon} ${yr} ${hr}:${min}`;
}

export class KycService {
  private subscribers: Set<() => void> = new Set();

  constructor() {
    // Listen for storage events across tabs or local broadcasts
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === KYC_STORAGE_KEY || e.key === KYC_STATS_STORAGE_KEY) {
          this.notify();
        }
      });
      window.addEventListener(KYC_CHANGE_EVENT, () => {
        this.notify();
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Subscriber error in KycService:', err);
      }
    });
  }

  private broadcastChange(playerId?: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(KYC_CHANGE_EVENT, { detail: { playerId } })
      );
    }
    this.notify();
  }

  /**
   * Structure API endpoints for future REST/GraphQL transition:
   * GET /api/v1/admin/kyc
   */
  public async getKycPlayers(filters?: KycFilterParams): Promise<KycPlayer[]> {
    // Artificial latency (30-60ms) simulating lightweight REST fetch
    await new Promise((res) => setTimeout(res, 40));

    let list = loadStorage<KycPlayer[]>(KYC_STORAGE_KEY, INITIAL_KYC_PLAYERS);

    // Ensure list is not empty
    if (!list || list.length === 0) {
      list = INITIAL_KYC_PLAYERS;
      saveStorage(KYC_STORAGE_KEY, list);
    }

    if (!filters) return list;

    // 1. Search Query Filter (Player Name, ID, PAN)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const cleanQ = q.replace('#', '').replace('plr-', '');
      list = list.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId =
          p.id.toLowerCase().includes(q) ||
          p.playerId.toLowerCase().includes(q) ||
          p.id.toLowerCase().replace('plr-', '').includes(cleanQ);
        const matchesPan = p.panMasked.toLowerCase().includes(q);
        return matchesName || matchesId || matchesPan;
      });
    }

    // 2. Status Filter
    if (filters.status && filters.status !== 'all') {
      const s = filters.status.toUpperCase();
      list = list.filter((p) => {
        if (s === 'PENDING') return p.kycStatus === 'PENDING';
        if (s === 'UNDER_REVIEW') return p.kycStatus === 'UNDER_REVIEW';
        if (s === 'VERIFIED') return p.kycStatus === 'VERIFIED';
        if (s === 'REJECTED') return p.kycStatus === 'REJECTED';
        if (s === 'NEEDS_INFORMATION') return p.kycStatus === 'NEEDS_INFORMATION';
        return p.kycStatus === s;
      });
    }

    // 3. Risk Level Filter
    if (filters.risk && filters.risk !== 'all') {
      const r = filters.risk.toUpperCase();
      list = list.filter((p) => p.riskLevel === r);
    }

    // 4. Verification Type Filter
    if (filters.verificationType && filters.verificationType !== 'all') {
      const vt = filters.verificationType.toLowerCase();
      list = list.filter((p) =>
        p.verificationType.toLowerCase().includes(vt)
      );
    }

    // 5. Date Range Filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      if (filters.dateRange === 'today') {
        list = list.filter((p) => p.submittedDate.includes('07 Oct 2026') || p.submittedDate.includes('Today'));
      } else if (filters.dateRange === '7d') {
        list = list.filter((p) => p.submittedDate.includes('Oct 2026'));
      }
    }

    return list;
  }

  /**
   * GET /api/v1/admin/kyc/:playerId
   */
  public async getKycPlayer(playerId: string): Promise<KycPlayer | null> {
    await new Promise((res) => setTimeout(res, 30));
    const list = loadStorage<KycPlayer[]>(KYC_STORAGE_KEY, INITIAL_KYC_PLAYERS);
    const cleanId = playerId.trim().toLowerCase().replace('#', '');
    const found = list.find(
      (p) =>
        p.id.toLowerCase() === playerId.toLowerCase() ||
        p.playerId.toLowerCase().replace('#', '') === cleanId ||
        p.id.toLowerCase().replace('plr-', '') === cleanId
    );
    return found || null;
  }

  /**
   * GET /api/v1/admin/kyc/stats
   */
  public async getKycStats(): Promise<KycStats> {
    await new Promise((res) => setTimeout(res, 30));
    const stats = loadStorage<KycStats>(KYC_STATS_STORAGE_KEY, INITIAL_KYC_STATS);
    return stats;
  }

  /**
   * POST /api/v1/admin/kyc/:playerId/approve
   */
  public async approveKyc(
    playerId: string,
    notes?: string,
    actor = 'Compliance Officer (Super Admin)'
  ): Promise<KycPlayer> {
    await new Promise((res) => setTimeout(res, 120));
    const list = loadStorage<KycPlayer[]>(KYC_STORAGE_KEY, INITIAL_KYC_PLAYERS);
    const index = list.findIndex(
      (p) => p.id.toLowerCase() === playerId.toLowerCase() || p.playerId === playerId
    );

    if (index === -1) {
      throw new Error(`Player record ${playerId} not found in KYC registry.`);
    }

    const current = list[index];
    const prevStatus = current.kycStatus;
    const nowStamp = formatCurrentTimestamp();

    const newHistoryEvent: KycHistoryEvent = {
      id: `h-evt-${Date.now()}`,
      timestamp: nowStamp,
      action: 'KYC Approved',
      actor,
      details: notes || 'All identity, PAN, and AML criteria verified and approved.',
      previousStatus: prevStatus,
      newStatus: 'VERIFIED',
    };

    const updated: KycPlayer = {
      ...current,
      kycStatus: 'VERIFIED',
      withdrawalStatus: 'Enabled',
      verifiedDate: nowStamp.slice(0, 11),
      notes: notes || current.notes,
      checks: {
        Identity: 'VERIFIED',
        Age: 'VERIFIED',
        PAN: 'VERIFIED',
        Address: 'VERIFIED',
        Bank: 'VERIFIED',
      },
      history: [newHistoryEvent, ...current.history],
    };

    list[index] = updated;
    saveStorage(KYC_STORAGE_KEY, list);

    // Update stats
    this.updateStatsDelta(prevStatus, 'VERIFIED');

    // Single source of truth: sync with playerService
    try {
      await playerService.updatePlayer(current.id, {
        kycStatus: 'verified',
        kycReviewedAt: new Date().toISOString(),
        kycReviewNotes: notes || 'Approved by Compliance Operations',
      });
      await playerService.logActivity(
        current.id,
        `KYC Verification Approved: ${notes || 'Identity verified'}`,
        'kyc'
      );
    } catch (e) {
      console.warn('PlayerService sync warning:', e);
    }

    this.broadcastChange(current.id);
    return updated;
  }

  /**
   * POST /api/v1/admin/kyc/:playerId/reject
   */
  public async rejectKyc(
    playerId: string,
    reason: string,
    notes?: string,
    actor = 'Compliance Officer (Super Admin)'
  ): Promise<KycPlayer> {
    await new Promise((res) => setTimeout(res, 120));
    const list = loadStorage<KycPlayer[]>(KYC_STORAGE_KEY, INITIAL_KYC_PLAYERS);
    const index = list.findIndex(
      (p) => p.id.toLowerCase() === playerId.toLowerCase() || p.playerId === playerId
    );

    if (index === -1) {
      throw new Error(`Player record ${playerId} not found in KYC registry.`);
    }

    const current = list[index];
    const prevStatus = current.kycStatus;
    const nowStamp = formatCurrentTimestamp();

    const newHistoryEvent: KycHistoryEvent = {
      id: `h-evt-${Date.now()}`,
      timestamp: nowStamp,
      action: 'KYC Rejected',
      actor,
      details: `Rejection Reason: ${reason}${notes ? ` - Notes: ${notes}` : ''}`,
      previousStatus: prevStatus,
      newStatus: 'REJECTED',
    };

    const updated: KycPlayer = {
      ...current,
      kycStatus: 'REJECTED',
      withdrawalStatus: 'Locked',
      rejectionReason: reason,
      notes: notes || current.notes,
      checks: {
        ...current.checks,
        Identity: 'REJECTED',
        PAN: 'REJECTED',
      },
      history: [newHistoryEvent, ...current.history],
    };

    list[index] = updated;
    saveStorage(KYC_STORAGE_KEY, list);

    // Update stats
    this.updateStatsDelta(prevStatus, 'REJECTED');

    // Single source of truth: sync with playerService
    try {
      await playerService.updatePlayer(current.id, {
        kycStatus: 'rejected',
        kycReviewedAt: new Date().toISOString(),
        kycReviewNotes: `Rejected: ${reason}`,
      });
      await playerService.logActivity(
        current.id,
        `KYC Rejected: ${reason}`,
        'kyc'
      );
    } catch (e) {
      console.warn('PlayerService sync warning:', e);
    }

    this.broadcastChange(current.id);
    return updated;
  }

  /**
   * POST /api/v1/admin/kyc/:playerId/request-information
   */
  public async requestKycInformation(
    playerId: string,
    requirements: string[],
    message: string,
    actor = 'Compliance Officer (Super Admin)'
  ): Promise<KycPlayer> {
    await new Promise((res) => setTimeout(res, 120));
    const list = loadStorage<KycPlayer[]>(KYC_STORAGE_KEY, INITIAL_KYC_PLAYERS);
    const index = list.findIndex(
      (p) => p.id.toLowerCase() === playerId.toLowerCase() || p.playerId === playerId
    );

    if (index === -1) {
      throw new Error(`Player record ${playerId} not found in KYC registry.`);
    }

    const current = list[index];
    const prevStatus = current.kycStatus;
    const nowStamp = formatCurrentTimestamp();

    const newHistoryEvent: KycHistoryEvent = {
      id: `h-evt-${Date.now()}`,
      timestamp: nowStamp,
      action: 'Information Requested',
      actor,
      details: `Requested: ${requirements.join(', ')}. Message: ${message}`,
      previousStatus: prevStatus,
      newStatus: 'NEEDS_INFORMATION',
    };

    const updated: KycPlayer = {
      ...current,
      kycStatus: 'NEEDS_INFORMATION',
      withdrawalStatus: 'Locked',
      infoRequested: requirements,
      notes: message,
      history: [newHistoryEvent, ...current.history],
    };

    list[index] = updated;
    saveStorage(KYC_STORAGE_KEY, list);

    // Update stats
    this.updateStatsDelta(prevStatus, 'NEEDS_INFORMATION');

    // Single source of truth: sync with playerService
    try {
      await playerService.updatePlayer(current.id, {
        kycStatus: 'needs_information',
        kycReviewNotes: `Information Requested: ${requirements.join(', ')}`,
      });
      await playerService.logActivity(
        current.id,
        `KYC Documents Requested: ${requirements.join(', ')}`,
        'kyc'
      );
    } catch (e) {
      console.warn('PlayerService sync warning:', e);
    }

    this.broadcastChange(current.id);
    return updated;
  }

  /**
   * GET /api/v1/admin/kyc/:playerId/history
   */
  public async getKycHistory(playerId: string): Promise<KycHistoryEvent[]> {
    const player = await this.getKycPlayer(playerId);
    return player?.history || [];
  }

  private updateStatsDelta(fromStatus: string, toStatus: string): void {
    if (fromStatus === toStatus) return;
    const stats = loadStorage<KycStats>(KYC_STATS_STORAGE_KEY, INITIAL_KYC_STATS);

    // Decrement fromStatus
    if (fromStatus === 'PENDING' && stats.pending > 0) stats.pending -= 1;
    else if (fromStatus === 'VERIFIED' && stats.verified > 0) stats.verified -= 1;
    else if (fromStatus === 'REJECTED' && stats.rejected > 0) stats.rejected -= 1;
    else if (fromStatus === 'UNDER_REVIEW' && stats.riskReview > 0) stats.riskReview -= 1;
    else if (fromStatus === 'NEEDS_INFORMATION' && stats.needsInformation > 0) stats.needsInformation -= 1;

    // Increment toStatus
    if (toStatus === 'PENDING') stats.pending += 1;
    else if (toStatus === 'VERIFIED') stats.verified += 1;
    else if (toStatus === 'REJECTED') stats.rejected += 1;
    else if (toStatus === 'UNDER_REVIEW') stats.riskReview += 1;
    else if (toStatus === 'NEEDS_INFORMATION') stats.needsInformation += 1;

    saveStorage(KYC_STATS_STORAGE_KEY, stats);
  }

  public resetToDefaults(): void {
    saveStorage(KYC_STORAGE_KEY, INITIAL_KYC_PLAYERS);
    saveStorage(KYC_STATS_STORAGE_KEY, INITIAL_KYC_STATS);
    this.broadcastChange();
  }
}

export const kycService = new KycService();
