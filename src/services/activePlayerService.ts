import { adminRequest } from '../lib/adminApi';

export type ActivePlayerStatus = 'active' | 'in_match' | 'idle' | 'offline';

export interface ActivePlayerTimelineEvent {
  time: string;
  description: string;
}

export interface ActivePlayerTelemetry {
  id: string;
  playerId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarInitials: string;
  region: string;
  device: 'desktop' | 'mobile' | 'tablet';
  status: ActivePlayerStatus;
  balance: number;
  sessionStartedAt: string;
  sessionDurationText: string;
  sessionStartTimeText: string;
  currentGameId?: string;
  currentGameName?: string;
  currentArenaCategory?: string;
  currentRound?: number;
  totalRounds?: number;
  score?: number;
  heartbeatState: 'healthy' | 'delayed' | 'disconnected';
  heartbeatText: string;
  heartbeatContext: string;
  latencyMs: number;
  connectionQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  gamesPlayed: number;
  winRate: number;
  recentActivity: ActivePlayerTimelineEvent[];
}

export interface ActivePlayerStats {
  activeNow: number;
  inMatch: number;
  lobbyOnline: number;
  avgSession: string;
  totalBalance: number;
  lastUpdateSecondsAgo: number;
  activityHistory: Array<{
    time: string;
    players: number;
    inMatch: number;
    lobby: number;
  }>;
}

export const activePlayerService = {
  async getActivePlayers(): Promise<ActivePlayerTelemetry[]> {
    return adminRequest<ActivePlayerTelemetry[]>('/admin/players/active');
  },

  async getActivePlayerStats(): Promise<ActivePlayerStats> {
    return adminRequest<ActivePlayerStats>('/admin/players/active/stats');
  },

  async getPlayerActivity(playerId: string): Promise<ActivePlayerTimelineEvent[]> {
    return adminRequest<ActivePlayerTimelineEvent[]>(`/admin/players/active/${playerId}/activity`);
  },

  async getPlayerHeartbeat(playerId: string): Promise<{
    state: 'healthy' | 'delayed' | 'disconnected';
    latencyMs: number;
    quality: string;
    text: string;
    context: string;
  }> {
    return adminRequest<{
      state: 'healthy' | 'delayed' | 'disconnected';
      latencyMs: number;
      quality: string;
      text: string;
      context: string;
    }>(`/admin/players/active/${playerId}/heartbeat`);
  },

  async endPlayerSession(playerId: string): Promise<ActivePlayerTelemetry> {
    return adminRequest<ActivePlayerTelemetry>(`/admin/players/active/${playerId}/end-session`, {
      method: 'POST'
    });
  },

  async resetTelemetry(): Promise<void> {
    // No-op for dynamic API
  },
};
