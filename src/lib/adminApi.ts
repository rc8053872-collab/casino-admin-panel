import { sessionService } from '../services/sessionService';

const API_BASE = import.meta.env.VITE_GAME_API_URL || 'http://localhost:3001/api';

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = sessionService.getSession();
  if (!session?.token) throw new Error('Admin session expired. Please sign in again.');

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${session.token}`,
      ...init.headers
    }
  });
  const result = await response.json().catch(() => ({})) as { error?: string; message?: string } & T;
  if (!response.ok) {
    if (response.status === 401) {
      sessionService.clearSession();
      window.location.assign('/admin/login');
    }
    throw new Error(result.error || result.message || `Admin API request failed (${response.status}).`);
  }
  return result;
}
